import { useMemo, useRef } from "react";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";

import { CpCpTableRow, CpCpStatusKey } from "../types";

const metricLabelMap: Record<CpCpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  intra_state: "Own State",
  inter_state: "Inter State",
  total: "Total",
};

interface CpCpComparisonChartProps {
  rows: CpCpTableRow[];
  statuses: CpCpStatusKey[];
  selectedStates: string[];
}

export default function CpCpComparisonChart({
  rows,
  statuses,
  selectedStates,
}: CpCpComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);
  const activeMetrics: CpCpStatusKey[] = statuses?.length ? statuses : [];

  const chartData = useMemo(() => {
    const transposedData: Record<string, any> = {};
    activeMetrics.forEach((metric) => {
      transposedData[metric] = { metric: metricLabelMap[metric] };
    });

    selectedStates.forEach((state) => {
      const row = rows.find((r) => r.state === state);
      activeMetrics.forEach((metric) => {
        const value = Number((row as any)?.[metric] ?? 0);
        if (transposedData[metric]) {
          transposedData[metric][state] = value;
        }
      });
    });

    return Object.values(transposedData).filter((d) =>
      selectedStates.some((s) => (d[s] ?? 0) > 0)
    );
  }, [rows, selectedStates, activeMetrics]);

  const handleExportCSV = () => {
    const headers = ["Metric", ...selectedStates];
    const csvRows = chartData.map((d) => [
      d.metric,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    exportService.exportToCSV("cp-cp-comparison.csv", headers, csvRows);
  };

  const handlePrint = () => {
    exportService.printComponent(chartWrapRef.current, "CP-CP State Comparison");
  };

  const handleExportExcel = () => {
    const headers = ["Metric", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.metric,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    const meta = {
      states: selectedStates,
      metrics: activeMetrics,
      generatedAt: new Date().toISOString(),
    };

    exportService.exportToExcel({
      element: chartWrapRef.current,
      filename: "cp-cp-comparison.xlsx",
      data: { headers, rows: rowsData, meta },
    });
  };

  // Corrected Guard
  if (selectedStates.length < 2 && selectedStates.length <=15) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Please select at least 2 and at most 15 states to view the chart.
        </CardContent>
      </Card>
    );
  }

  return (
    <GroupedBarChart
      chartRef={chartWrapRef}
      title="State Comparison by Metric"
      data={chartData}
      xAxisDataKey="metric"
      barKeys={selectedStates}
      onExportCSV={handleExportCSV}
      onExportExcel={handleExportExcel}
      onPrint={handlePrint}
    />
  );
}
