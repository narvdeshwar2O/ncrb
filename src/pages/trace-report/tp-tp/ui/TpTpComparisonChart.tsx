import { useMemo, useRef } from "react";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";

import { TpTpTableRow, TpTpStatusKey } from "../types";

// Interface and type definitions
interface TpTpComparisonChartProps {
  rows: TpTpTableRow[];
  statuses: TpTpStatusKey[]; // metrics available in UI
  selectedStates: string[]; // states user picked in filters
}
type MetricKey = TpTpStatusKey;

const metricLabelMap: Record<MetricKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  own_state: "Own State",
  inter_state: "Inter State",
  total: "Total",
};

export default function TpTpComparisonChart({
  rows,
  statuses,
  selectedStates,
}: TpTpComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  // Data preparation logic
  const activeMetrics: MetricKey[] = statuses?.length ? statuses : [];

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

  // --- HANDLERS NOW PREPARE DATA AND DELEGATE ---

  const handleExportCSV = () => {
    // Prepare data specific to this component
    const headers = ["Metric", ...selectedStates];
    const rows = chartData.map((d) => [
      d.metric,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    // Delegate to the service
    exportService.exportToCSV("state-comparison-by-metric.csv", headers, rows);
  };

  const handlePrint = () => {
    // Delegate to the service, providing the specific element and title
    exportService.printComponent(
      chartWrapRef.current,
      "State Comparison Chart"
    );
  };

  const handleExportExcel = () => {
    // Prepare all necessary data for the Excel export
    const headers = ["Metric", ...selectedStates];
    const rows = chartData.map((d) => [
      d.metric,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    const meta = {
      states: selectedStates,
      metrics: activeMetrics,
      generatedAt: new Date().toISOString(),
    };

    exportService.exportToCSV("state-comparison-by-metric.csv", headers, rows);
  };

  if (selectedStates.length < 2) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view the chart.
        </CardContent>
      </Card>
    );
  }

  // The component renders the chart and passes the clean handlers down
  return (
    <GroupedBarChart
      chartRef={chartWrapRef}
      title="State Comparison by Metric"
      data={chartData}
      xAxisDataKey="metric"
      barKeys={selectedStates}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
    />
  );
}
