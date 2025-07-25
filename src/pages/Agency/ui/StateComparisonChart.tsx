import { useMemo, useRef } from "react";
import { StateData } from "./AgencyTable";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";

// Interface and type definitions
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

  // Data preparation logic remains within the component, which is correct
  const activeMetrics: MetricKey[] = (
    dataTypes?.length ? dataTypes : ["enrollment", "hit", "nohit"]
  ) as MetricKey[];

  const activeCategories: CategoryKey[] = (
    categories?.length
      ? categories.filter((c) => ["tp", "cp", "mesa"].includes(c))
      : ["tp", "cp", "mesa"]
  ) as CategoryKey[];

  const chartData = useMemo(() => {
    const transposedData: Record<string, any> = {};
    activeCategories.forEach((cat) => {
      transposedData[cat] = { category: categoryLabelMap[cat] };
    });
    selectedStates.forEach((state) => {
      const stateInfo = data[state] || {};
      activeCategories.forEach((cat) => {
        const rec = (stateInfo as any)[cat] as { [K in MetricKey]?: number } | undefined;
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

  // --- HANDLERS NOW PREPARE DATA AND DELEGATE ---

  const handleExportCSV = () => {
    // 2. Prepare data specific to this component
    const headers = ["Category", ...selectedStates];
    const rows = chartData.map((d) => [
      d.category,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    // 3. Delegate to the service
    exportService.exportToCSV("state-comparison-by-category.csv", headers, rows);
  };

  const handlePrint = () => {
    // Delegate to the service, providing the specific element and title
    exportService.printComponent(chartWrapRef.current, "State Comparison Chart");
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

  // The component renders the chart and passes the clean handlers down
  return (
    <GroupedBarChart
      chartRef={chartWrapRef}
      title="State Comparison by Category"
      data={chartData}
      xAxisDataKey="category"
      barKeys={selectedStates}
      onExportCSV={handleExportCSV}
      
      onPrint={handlePrint}
    />
  );
}
