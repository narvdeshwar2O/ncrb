import { useMemo, useRef } from "react";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";
import { SlipTableRow, StatusKey } from "../types";

interface SlipComparisonChartProps {
  rows: SlipTableRow[];
  statuses: StatusKey[]; // Multiple statuses
  selectedStates: string[];
  categories: string[]; // Categories filter
}

export function SlipComparisonChart({
  rows,
  statuses,
  selectedStates,
  categories,
}: SlipComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  // Handle "no statuses selected"
  if (statuses.length === 0) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Please select at least one Crime Status to view the chart.
        </CardContent>
      </Card>
    );
  }

  // Prepare chart data
  const chartData = useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));

    return statuses.map((status) => ({
      category: status, // each status is a category on X-axis
      ...Object.fromEntries(
        selectedStates.map((state) => [state, lookup.get(state)?.[status] ?? 0])
      ),
    }));
  }, [rows, selectedStates, statuses]);

  // Export Handlers
  const handleExportCSV = () => {
    const headers = ["Status", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.category,
      ...selectedStates.map((s) => d[s] ?? 0),
    ]);
    exportService.exportToCSV("state-comparison.csv", headers, rowsData);
  };

  const handleExportExcel = () => {
    const headers = ["Status", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.category,
      ...selectedStates.map((s) => d[s] ?? 0),
    ]);
    const meta = {
      states: selectedStates,
      statuses: statuses,
      generatedAt: new Date().toISOString(),
    };
    exportService.exportToExcel({
      element: chartWrapRef.current,
      filename: "state-comparison.xlsx",
      data: { headers, rows: rowsData, meta },
    });
  };

  const handlePrint = () => {
    exportService.printComponent(
      chartWrapRef.current,
      "State Comparison Chart"
    );
  };

  // No states selected
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
        title="State Comparison by Crime Status"
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
