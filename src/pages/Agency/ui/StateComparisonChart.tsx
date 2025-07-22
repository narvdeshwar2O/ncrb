// src/components/StateComparisonChart.tsx

import React, { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { StateData } from "./AgencyTable";
import { exportToCSV, printHTMLElement } from "@/utils/exportHelpers";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";

interface StateComparisonChartProps {
  data: StateData;
  selectedStates: string[];
  dataTypes: string[];
  categories?: string[];
}

type MetricKey = "enrollment" | "hit" | "nohit";
type CategoryKey = "tp" | "cp" | "mesa";

const categoryLabelMap: Record<CategoryKey, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

export function StateComparisonChart({
  data,
  selectedStates,
  dataTypes,
  categories,
}: StateComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  const activeMetrics: MetricKey[] = (
    dataTypes?.length ? dataTypes : ["enrollment", "hit", "nohit"]
  ) as MetricKey[];

  const activeCategories: CategoryKey[] = (
    categories?.length
      ? categories.filter((c) => ["tp", "cp", "mesa"].includes(c))
      : ["tp", "cp", "mesa"]
  ) as CategoryKey[];

  const chartData = useMemo(() => {
    // This logic is specific to state data and remains here
    const transposedData: Record<string, any> = {};
    activeCategories.forEach((cat) => {
      transposedData[cat] = { category: categoryLabelMap[cat] };
    });
    selectedStates.forEach((state) => {
      const stateInfo = data[state] || {};
      activeCategories.forEach((cat) => {
        const rec = (stateInfo as any)[cat] as
          | { [K in MetricKey]?: number }
          | undefined;
        const sum = activeMetrics.reduce((acc, m) => acc + (rec?.[m] ?? 0), 0);
        if (transposedData[cat]) {
          transposedData[cat][state] = sum;
        }
      });
    });
    return Object.values(transposedData).filter((d) =>
      selectedStates.some((s) => (d[s] ?? 0) > 0)
    );
  }, [selectedStates, data, activeCategories, activeMetrics]);

  // Export handlers remain here as they contain business-specific logic[1]
  const handleExportCSV = () => {
    const headers = ["Category", ...selectedStates];
    const rows = chartData.map((d) => [
      d.category,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    exportToCSV("state-comparison-by-category.csv", headers, rows);
  };

  const handlePrint = () => {
    printHTMLElement(chartWrapRef.current, "State Comparison Chart");
  };

  const handleExportExcel = async () => {
    if (!chartWrapRef.current) return;
    try {
      const canvas = await html2canvas(chartWrapRef.current, { scale: 2 });
      const imageBase64 = canvas.toDataURL("image/png");
      const headers = ["Category", ...selectedStates];
      const rows = chartData.map((d) => [
        d.category,
        ...selectedStates.map((state) => d[state] ?? 0),
      ]);
      const meta = {
        states: selectedStates,
        metrics: activeMetrics,
        categories: activeCategories,
        generatedAt: new Date().toISOString(),
      };
      const resp = await fetch("http://localhost:5000/save-chart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64, headers, rows, meta }),
      });
      if (!resp.ok) throw new Error(`Excel export failed: ${resp.statusText}`);
      const blob = await resp.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = "state-comparison-by-category.xlsx";
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error("Excel export error", err);
    }
  };

  if (!selectedStates.length) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least one state to view the chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <GroupedBarChart
      chartRef={chartWrapRef}
      title="State Comparison by Category"
      data={chartData}
      xAxisDataKey="category"
      barKeys={selectedStates}
      onExportCSV={handleExportCSV}
      onExportExcel={handleExportExcel}
      onPrint={handlePrint}
    />
  );
}
