import { useMemo, useRef } from "react";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";
import { MesaTableRow, MesaStatusKey } from "../types";

interface MesaComparisonChartProps {
  rows: MesaTableRow[];
  statuses: MesaStatusKey[];
  selectedStates: string[];
}

export default function MesaComparisonChart({
  rows = [],
  statuses = [],
  selectedStates = [],
}: MesaComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  // Filter out "Total"
  const filteredStatuses = useMemo(
    () => (statuses || []).filter((s) => s !== "Total"),
    [statuses]
  );

  // Prepare chart data safely
  const chartData = useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));
    return filteredStatuses.map((status) => ({
      category: status,
      ...Object.fromEntries(
        selectedStates.map((state) => [state, lookup.get(state)?.[status] ?? 0])
      ),
    }));
  }, [rows, selectedStates, filteredStatuses]);

  // Export Handlers
  const handleExportCSV = () => {
    if (!chartData.length) return;
    const headers = ["Status", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.category,
      ...selectedStates.map((s) => d[s] ?? 0),
    ]);
    exportService.exportToCSV("mesa-comparison.csv", headers, rowsData);
  };

  const handleExportExcel = () => {
    if (!chartData.length) return;
    const headers = ["Status", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.category,
      ...selectedStates.map((s) => d[s] ?? 0),
    ]);
    exportService.exportToExcel({
      element: chartWrapRef.current,
      filename: "mesa-comparison.xlsx",
      data: {
        headers,
        rows: rowsData,
        meta: { generatedAt: new Date().toISOString() },
      },
    });
  };

  const handlePrint = () => {
    exportService.printComponent(
      chartWrapRef.current,
      "Mesa State Comparison Chart"
    );
  };

  // **UI Conditions after hooks**
  if (!filteredStatuses.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Please select at least one Crime Status to view the chart.
        </CardContent>
      </Card>
    );
  }

  if (selectedStates.length < 2) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <GroupedBarChart
        chartRef={chartWrapRef}
        title="Mesa State Comparison by Crime Status"
        data={chartData}
        xAxisDataKey="category"
        barKeys={selectedStates}
        onExportCSV={handleExportCSV}
        onExportExcel={handleExportExcel}
        onPrint={handlePrint}
      />
    </div>
  );
}
