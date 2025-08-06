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

type MetricKey = "hit" | "nohit";
type CategoryKey = "tp" | "cp" | "mesa";

const categoryLabelMap: Record<CategoryKey, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

export function StateComparisonChart({
  data,
  selectedStates,
  categories,
}: StateComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);
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
        const rec = (stateInfo as any)[cat] as
          | { [K in MetricKey]?: number }
          | undefined;
        const sum = (rec?.hit ?? 0) + (rec?.nohit ?? 0);
        transposedData[cat][state] = sum;
      });
    });

    return Object.values(transposedData); // ✅ No filtering
  }, [selectedStates, data, activeCategories]);

  const handleExportCSV = () => {
    const headers = ["Category", ...selectedStates];
    const rows = chartData.map((d) => [
      d.category,
      ...selectedStates.map((state) => d[state] ?? 0),
    ]);
    exportService.exportToCSV(
      "state-comparison-by-category.csv",
      headers,
      rows
    );
  };

  const handlePrint = () => {
    exportService.printComponent(
      chartWrapRef.current,
      "State Comparison Chart"
    );
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
      title="State Comparison by Category ( Hit + NoHit) "
      data={chartData}
      xAxisDataKey="category"
      barKeys={selectedStates}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
    />
  );
}
