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
  "#E6194B",
  "#3CB44B", 
  "#0082C8",
  "#F58231",
  "#911EB4",
  "#46F0F0",
  "#F032E6", // magenta
  "#D2F53C", // lime
  "#FABEBE", // pink
  "#008080", // teal
  "#E6BEFF", // lavender
  "#AA6E28", // brown
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
  selectedStates: string[],
  selectedDistricts: string[]
) {
  let hit = 0,
    enrol = 0,
    nohit = 0,
    del = 0;

  if (!day.data) {
    return { hit, nohit, enrol, delete: del };
  }

  for (const stateKey of Object.keys(day.data)) {
    const stateData = day.data[stateKey];
    if (!stateData) continue;

    const stateKeyLower = stateKey.toLowerCase().trim();
    const shouldIncludeState =
      selectedStates.length === 0 ||
      selectedStates.some(
        (state) => state.toLowerCase().trim() === stateKeyLower
      );

    if (!shouldIncludeState) continue;

    for (const districtKey of Object.keys(stateData)) {
      const districtData = stateData[districtKey];
      if (!districtData || typeof districtData !== "object") continue;

      const districtKeyLower = districtKey.toLowerCase().trim();
      const shouldIncludeDistrict =
        selectedDistricts.length === 0 ||
        selectedDistricts.some(
          (district) => district.toLowerCase().trim() === districtKeyLower
        );

      if (!shouldIncludeDistrict) continue;

      const catRec = districtData[category];
      if (!catRec || typeof catRec !== "object") continue;

      enrol += Number(catRec.enrol) || 0;
      hit += Number(catRec.hit) || 0;
      nohit += Number(catRec.nohit) || 0;
      del += Number(catRec.delete) || 0;
    }
  }

  return { hit, nohit, enrol, delete: del };
}

export interface MultipleChartProps {
  filteredData: DailyData[];
  filters: FilterState;
  activeCategories: string[];
  totalsByCategory: Record<
    string,
    { enrol: number; hit: number; nohit: number; total: number; delete: number }
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
  console.log("filter", filteredData);
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

  const hasDateRange = filters.dateRange?.from && filters.dateRange?.to;
  const dayCount = filteredData.length;
  const showDailyData = hasDateRange && dayCount >= 0 && dayCount <= 90;

  const selectedStates = filters.state || [];
  const selectedDistricts = filters.districts || [];

  // ✅ include delete in default dataTypes
  const selectedDataTypes = filters.dataTypes?.length
    ? filters.dataTypes
    : ["hit", "nohit", "delete"];

  const chartData = useMemo(() => {
    if (showDailyData) {
      const start = filters.dateRange?.from
        ? new Date(filters.dateRange.from)
        : null;
      const end = filters.dateRange?.to ? new Date(filters.dateRange.to) : null;

      if (!start || !end) return [];

      // Generate all dates in range
      const allDates: Date[] = [];
      let current = new Date(start);
      while (current <= end) {
        allDates.push(new Date(current));
        current.setDate(current.getDate() + 1);
      }

      // Map original data by date for quick lookup
      const dataByDate: Record<string, DailyData> = {};
      filteredData.forEach((day) => {
        dataByDate[new Date(day.date).toDateString()] = day;
      });

      // Build rows for every date in the range
      const dailyData = allDates.map((date) => {
        const dayStr = date.toDateString();
        const day = dataByDate[dayStr] ?? {
          date: date.toISOString(),
          data: {},
        };

        const row: Record<string, any> = {
          label: date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };

        activeCategories.forEach((cat) => {
          const totals = computeDayCategoryTotals(
            day,
            cat as "tp" | "cp" | "mesa",
            selectedStates,
            selectedDistricts
          );

          selectedDataTypes.forEach((type) => {
            const key = `${cat}_${type}`;
            row[key] = totals[type as keyof typeof totals] ?? 0;
          });
        });

        return row;
      });

      return dailyData;
    }

    // Aggregate totals view
    const categoryData = activeCategories.map((cat) => {
      const data = {
        label: categoryLabelMap?.[cat] ?? cat.toUpperCase(),
        enrol: totalsByCategory[cat]?.enrol ?? 0,
        hit: totalsByCategory[cat]?.hit ?? 0,
        nohit: totalsByCategory[cat]?.nohit ?? 0,
        delete: totalsByCategory[cat]?.delete ?? 0,
        total: totalsByCategory[cat]?.total ?? 0,
      };
      return data;
    });

    return categoryData;
  }, [
    showDailyData,
    filteredData,
    activeCategories,
    selectedStates,
    selectedDistricts,
    selectedDataTypes,
    totalsByCategory,
    categoryLabelMap,
    filters.dateRange,
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
