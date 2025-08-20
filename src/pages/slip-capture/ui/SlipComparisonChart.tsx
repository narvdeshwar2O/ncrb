import { useMemo, useRef } from "react";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";
import { SlipTableRow, StatusKey } from "../types";

// Keep your original interface
interface SlipComparisonChartProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
  selectedStates: string[];
  categories: string[];
}

export function SlipComparisonChart({
  rows,
  statuses,
  selectedStates,
  categories,
}: SlipComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  console.log("SlipComparisonChart - Input data:", {
    rowsCount: rows.length,
    statuses,
    selectedStates,
    categories,
    sampleRow: rows[0]
  });

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

  // ✅ State count validation (minimum 2, maximum 15)
  if (selectedStates.length < 2) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
          <br />
          Currently selected: {selectedStates.length} state(s)
        </CardContent>
      </Card>
    );
  }

  if (selectedStates.length > 15) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Maximum 15 states allowed for comparison.
          <br />
          Currently selected: {selectedStates.length} state(s)
          <br />
          Please deselect {selectedStates.length - 15} state(s).
        </CardContent>
      </Card>
    );
  }

  // ✅ Process the table rows to create state aggregates
  const stateAggregates = useMemo(() => {
    const aggregates = new Map<string, Record<StatusKey, number>>();

    // Initialize aggregates for selected states
    selectedStates.forEach(state => {
      const statusTotals = {} as Record<StatusKey, number>;
      statuses.forEach(status => {
        statusTotals[status] = 0;
      });
      aggregates.set(state, statusTotals);
    });

    // Aggregate data from table rows
    rows.forEach((row) => {
      if (!selectedStates.includes(row.state)) return;

      const stateAgg = aggregates.get(row.state);
      if (!stateAgg) return;

      // Add values from this row to the state aggregate
      statuses.forEach((status) => {
        if (row[status] !== undefined) {
          stateAgg[status] += Number(row[status]) || 0;
        }
      });
    });

    console.log("State aggregates from table rows:", Object.fromEntries(aggregates.entries()));
    return aggregates;
  }, [rows, selectedStates, statuses]);

  // Prepare chart data - each status becomes a category on X-axis
  const chartData = useMemo(() => {
    return statuses.map((status) => {
      const dataPoint = { category: status };
      
      selectedStates.forEach((state) => {
        const stateData = stateAggregates.get(state);
        dataPoint[state] = stateData?.[status] ?? 0;
      });

      return dataPoint;
    });
  }, [stateAggregates, selectedStates, statuses]);

  console.log("Chart data for comparison:", chartData);

  // Export Handlers
  const handleExportCSV = () => {
    const headers = ["Status", ...selectedStates];
    const rowsData = chartData.map((d) => [
      d.category,
      ...selectedStates.map((s) => d[s] ?? 0),
    ]);
    exportService.exportToCSV("state-comparison.csv", headers, rowsData);
  };

  const handlePrint = () => {
    exportService.printComponent(
      chartWrapRef.current,
      "State Comparison Chart"
    );
  };

  // Check if there's any data to show
  const hasData = chartData.some(item => 
    selectedStates.some(state => (item[state] as number) > 0)
  );

  if (!hasData) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          No data available for the selected states and statuses.
          <br />
          States: {selectedStates.join(", ")}
          <br />
          Statuses: {statuses.join(", ")}
          <br />
          Table rows: {rows.length}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <GroupedBarChart
        chartRef={chartWrapRef}
        title={`State Comparison by Crime Status (${selectedStates.length}/15 states)`}
        data={chartData}
        xAxisDataKey="category"
        barKeys={selectedStates}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
      />
    </div>
  );
}