import React, { useEffect, useMemo, useRef, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";
import { BarChartComponent } from "./BarChartComponent";
import { PieChartComponent } from "./PieChartComponent";
import { FilterState } from "@/components/filters/types/FilterTypes";
import { DailyData } from "../types";

const colorPalette = [
  "#1875F0",
  "#22B573",
  "#F6C244",
  "#EC4967",
  "#B392F0",
  "#FF9950",
  "#26C6DA",
  "#26A69A",
  "#FFA726",
  "#F4511E",
  "#8D6E63",
  "#789262",
  "#FF61A6",
  "#af52de",
  "#f7b731",
];
const pieSliceColors = [...colorPalette];

function getBarColor(
  cat: string | number,
  type: string | number,
  catList: string[],
  typeList: string[]
) {
  const catIdx = catList.indexOf(cat as string);
  const typeIdx = typeList.indexOf(type as string);
  const idx = catIdx * typeList.length + typeIdx;
  return colorPalette[idx % colorPalette.length];
}

function computeDayCategoryTotals(
  day: any,
  category: "tp" | "cp" | "mesa",
  units: string[]
) {
  let hit = 0,
    nohit = 0;
  for (const unit of units) {
    const catRec = Object.values(day.data || {}).flatMap((stateData) =>
      stateData?.[unit]?.[category] ? [stateData[unit][category]] : []
    )[0];
    if (!catRec) continue;
    hit += catRec.hit ?? 0;
    nohit += catRec.nohit ?? 0;
  }
  return { hit, nohit };
}

export interface MultipleChartProps {
  filteredData: DailyData[];
  filters: FilterState;
  activeCategories: string[];
  totalsByCategory: Record<
    string,
    { hit: number; nohit: number; total: number }
  >;
  categoryLabelMap?: Record<string, string>;
}

export function MultipleChart(props: MultipleChartProps) {
  const {
    filteredData,
    filters,
    activeCategories,
    totalsByCategory,
    categoryLabelMap,
  } = props;

  const chartRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<"stacked" | "grouped" | "pie">(
    "stacked"
  );
  const [isPieReady, setIsPieReady] = useState(false);

  useEffect(() => {
    if (viewMode === "pie") {
      setIsPieReady(false);
      const timer = setTimeout(() => setIsPieReady(true), 350);
      return () => clearTimeout(timer);
    } else {
      setIsPieReady(false);
    }
  }, [viewMode]);

  const hasDateRange = filters.dateRange.from && filters.dateRange.to;
  const dayCount = filteredData.length;
  const showDailyData = hasDateRange && dayCount > 0 && dayCount <= 90;

  const selectedUnits = useMemo(() => {
    if (filters.districts?.length) {
      return filters.districts;
    }
    if (!filters.state?.length) return [];
    const units = new Set<string>();
    filteredData.forEach((day) => {
      filters.state?.forEach((stateName) => {
        const stateDistricts = day.data?.[stateName];
        if (stateDistricts) {
          Object.keys(stateDistricts).forEach((district) =>
            units.add(district)
          );
        }
      });
    });
    return Array.from(units);
  }, [filteredData, filters.state, filters.districts]); // ✅ fix dependency here

  const selectedDataTypes = filters.dataTypes?.length
    ? filters.dataTypes
    : ["hit", "nohit"];

  const chartData = useMemo(() => {
    if (showDailyData) {
      const sorted = [...filteredData].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      return sorted.map((day) => {
        const row: Record<string, any> = {
          label: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
        activeCategories.forEach((cat) => {
          const totals = computeDayCategoryTotals(
            day,
            cat as "tp" | "cp" | "mesa",
            selectedUnits
          );
          selectedDataTypes.forEach((type) => {
            row[`${cat}_${type}`] = totals[type as keyof typeof totals];
          });
        });
        return row;
      });
    }
    return activeCategories.map((cat) => ({
      label: categoryLabelMap?.[cat] ?? cat.toUpperCase(),
      hit: totalsByCategory[cat]?.hit ?? 0,
      nohit: totalsByCategory[cat]?.nohit ?? 0,
      total: totalsByCategory[cat]?.total ?? 0,
    }));
  }, [
    showDailyData,
    filteredData,
    activeCategories,
    selectedUnits,
    selectedDataTypes,
    totalsByCategory,
    categoryLabelMap,
  ]);

  const chartTitle = showDailyData
    ? `Daily Breakdown (${dayCount} day${dayCount === 1 ? "" : "s"})`
    : "Agency Totals Breakdown";

  const handleExportCSV = () => {
    const headers = [
      showDailyData ? "Date" : "Category",
      ...activeCategories.flatMap((cat) =>
        selectedDataTypes.map((type) =>
          showDailyData ? `${cat}_${type}` : type
        )
      ),
    ];
    const rows = chartData.map((item) => [
      item.label,
      ...activeCategories.flatMap((cat) =>
        selectedDataTypes.map((type) =>
          showDailyData ? item[`${cat}_${type}`] ?? 0 : item[type] ?? 0
        )
      ),
    ]);
    exportService.exportToCSV(`${slugify(chartTitle)}.csv`, headers, rows);
  };

  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  const pieData = useMemo(() => {
    return activeCategories
      .flatMap((cat) =>
        selectedDataTypes.map((type) => ({
          name:
            (categoryLabelMap?.[cat] ?? cat.toUpperCase()) +
            " " +
            type.charAt(0).toUpperCase() +
            type.slice(1),
          value: totalsByCategory[cat]?.[type] ?? 0,
        }))
      )
      .filter((d) => d.value > 0);
  }, [activeCategories, selectedDataTypes, totalsByCategory, categoryLabelMap]);

  const showDailyBarChart = showDailyData && viewMode !== "pie";

  return (
    <Card className="p-1 w-full mt-3">
      <CardHeader className="flex flex-col gap-2 items-center">
        <div className="flex justify-between w-full items-center">
          <h3 className="text-base font-medium">{chartTitle}</h3>
          <div className="flex items-center gap-2">
            <Select
              value={viewMode}
              onValueChange={(val) => {
                if (val === "stacked" || val === "grouped" || val === "pie") {
                  setViewMode(val);
                }
              }}
            >
              <SelectTrigger className="w-[130px] text-sm font-medium bg-card">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="stacked">Stacked</SelectItem>
                <SelectItem value="grouped">Grouped</SelectItem>
                <SelectItem value="pie">Pie</SelectItem>
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="print-hide"
            >
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="print-hide"
            >
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      {activeCategories.length === 0 ? (
        <CardContent className="h-[200px] flex items-center justify-center text-center text-red-600 font-medium">
          Please select at least one category to display the chart.
        </CardContent>
      ) : (
        <CardContent
          ref={chartRef}
          className={
            viewMode === "pie" ? "h-[500px]" : "h-[500px] md:h-[600px]"
          }
        >
          {viewMode === "pie" ? (
            isPieReady ? (
              <PieChartComponent
                pieData={pieData}
                pieSliceColors={pieSliceColors}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-muted-foreground text-base animate-pulse">
                  Loading Pie Chart...
                </div>
              </div>
            )
          ) : (
            <BarChartComponent
              chartData={chartData}
              activeCategories={activeCategories}
              selectedDataTypes={selectedDataTypes}
              categoryLabelMap={categoryLabelMap}
              viewMode={viewMode}
              getBarColor={getBarColor}
              showDailyBarChart={showDailyBarChart}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
}
