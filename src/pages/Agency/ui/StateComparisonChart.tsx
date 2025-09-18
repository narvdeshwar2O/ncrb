import React, { useMemo, useRef } from "react";
import { StateData, DistrictData } from "./AgencyTable";
import { GroupedBarChart } from "@/components/charts/GroupedBarChart";
import { Card, CardContent } from "@/components/ui/card";
import * as exportService from "@/utils/exportService";

interface StateComparisonChartProps {
  data: {
    stateResult: StateData;
    districtResult: DistrictData;
  };
  selectedStates: string[];
  selectedDistricts?: string[];
  dataTypes: string[];
  categories?: string[];
  comparisonType: "state" | "district";
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
  selectedDistricts = [],
  categories,
  comparisonType,
}: StateComparisonChartProps) {
  const chartWrapRef = useRef<HTMLDivElement>(null);

  const activeCategories: CategoryKey[] = (
    categories?.length
      ? categories.filter((c) => ["tp", "cp", "mesa"].includes(c))
      : ["tp", "cp", "mesa"]
  ) as CategoryKey[];

  // Validation
  const isValidStateSelection =
    comparisonType === "state" ? selectedStates.length >= 2 && selectedStates.length <= 15 : true;
  const isValidDistrictSelection =
    comparisonType === "district" ? selectedStates.length === 1 : true;

  const chartData = useMemo(() => {
    const transposed: Record<string, any> = {};
    activeCategories.forEach((cat) => {
      transposed[cat] = { category: categoryLabelMap[cat] };
    });

    if (comparisonType === "state") {
      selectedStates.forEach((state) => {
        const stateInfo = data.stateResult[state] || {};
        activeCategories.forEach((cat) => {
          const rec = (stateInfo as any)[cat] as { [K in MetricKey]?: number } | undefined;
          transposed[cat][state] = (rec?.hit ?? 0) + (rec?.nohit ?? 0);
        });
      });
    } else {
      selectedDistricts.forEach((district) => {
        const districtInfo = data.districtResult[district] || {};
        activeCategories.forEach((cat) => {
          const rec = (districtInfo as any)[cat] as { [K in MetricKey]?: number } | undefined;
          transposed[cat][district] = (rec?.hit ?? 0) + (rec?.nohit ?? 0);
        });
      });
    }

    return Object.values(transposed);
  }, [comparisonType, selectedStates, selectedDistricts, data, activeCategories]);

  const handleExportCSV = () => {
    const headers =
      comparisonType === "state" ? ["Category", ...selectedStates] : ["Category", ...selectedDistricts];
    const rows = chartData.map((d) => [
      d.category,
      ...(comparisonType === "state" ? selectedStates : selectedDistricts).map((key) => d[key] ?? 0),
    ]);
    exportService.exportToCSV(`${comparisonType}-comparison-by-category.csv`, headers, rows);
  };

  const handlePrint = () => {
    exportService.printComponent(
      chartWrapRef.current,
      `${comparisonType.charAt(0).toUpperCase() + comparisonType.slice(1)} Comparison Chart`
    );
  };

  if (!isValidStateSelection) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          For state comparison, please select at least 2 and at most 15 states.
        </CardContent>
      </Card>
    );
  }

  if (!isValidDistrictSelection) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          For district comparison, please select exactly one state.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full">
      <GroupedBarChart
        chartRef={chartWrapRef}
        title={
          comparisonType === "state"
            ? "State Comparison by Category (Hit + NoHit)"
            : "District Comparison by Category (Hit + NoHit)"
        }
        data={chartData}
        xAxisDataKey="category"
        barKeys={comparisonType === "state" ? selectedStates : selectedDistricts}
        onExportCSV={handleExportCSV}
        onPrint={handlePrint}
      />
    </div>
  );
}
