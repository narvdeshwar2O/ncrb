import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
  Pie,
  PieChart,
  Cell,
} from "recharts";
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
import { FilterState } from "@/components/filters/types/FilterTypes";


interface DailyData {
  date: string;
  data: Record<
    string,
    Record<
      string,
      { enrollment: number; hit: number; nohit: number; total: number }
    >
  >;
}

export interface MultipleChartProps {
  filteredData: DailyData[];
  filters: FilterState;
  activeCategories: string[];
  totalsByCategory: Record<
    string,
    { enrollment: number; hit: number; nohit: number }
  >;
  categoryLabelMap?: Record<string, string>;
}


// Base colors for bar segments by data type
const baseColors = {
  enrollment: "hsl(217, 100%, 65%)",
  hit: "hsl(174, 70%, 55%)",
  nohit: "hsl(40, 100%, 60%)",
};


// Colors for Pie slices
const pieSliceColors = [
  "hsl(217, 100%, 65%)",
  "hsl(174, 70%, 55%)",
  "hsl(40, 100%, 60%)",
  "hsl(340, 80%, 60%)",
  "hsl(265, 70%, 55%)",
  "hsl(29, 90%, 50%)",
];


// Utility function to sum daily totals per category for selected states
function computeDayCategoryTotals(
  day: DailyData,
  category: "tp" | "cp" | "mesa",
  states: string[]
) {
  let enrollment = 0;
  let hit = 0;
  let nohit = 0;
  for (const st of states) {
    const catRec = day.data?.[st]?.[category];
    if (!catRec) continue;
    enrollment += catRec.enrollment ?? 0;
    hit += catRec.hit ?? 0;
    nohit += catRec.nohit ?? 0;
  }
  return { enrollment, hit, nohit };
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

  // Chart view mode: stacked, grouped, pie
  const [viewMode, setViewMode] = useState<"stacked" | "grouped" | "pie">(
    "stacked"
  );

  // Control showing the pie chart after a delay for smoother load with tooltip
  const [isPieReady, setIsPieReady] = useState(false);
  useEffect(() => {
    if (viewMode === "pie") {
      setIsPieReady(false);
      const timer = setTimeout(() => setIsPieReady(true), 350);
      return () => clearTimeout(timer);
    } else {
      setIsPieReady(false); // reset when not pie
    }
  }, [viewMode]);

  // Determine if daily data is shown based on date range and data length
  const hasDateRange = filters.dateRange.from && filters.dateRange.to;
  const dayCount = filteredData.length;
  const showDailyData = hasDateRange && dayCount > 0 && dayCount <= 90;

  const selectedStates = filters.state ?? [];
  const selectedDataTypes =
    filters.dataTypes && filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"];

  // Create chart data for bar chart mode (daily or aggregated)
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
            selectedStates
          );
          selectedDataTypes.forEach((type) => {
            row[`${cat}_${type}`] = totals[type as keyof typeof totals];
          });
        });
        return row;
      });
    }

    // Aggregated data if no date range or daily data not shown
    return activeCategories.map((cat) => ({
      label: categoryLabelMap?.[cat] ?? cat.toUpperCase(),
      enrollment: totalsByCategory[cat]?.enrollment ?? 0,
      hit: totalsByCategory[cat]?.hit ?? 0,
      nohit: totalsByCategory[cat]?.nohit ?? 0,
    }));
  }, [
    showDailyData,
    filteredData,
    activeCategories,
    selectedStates,
    selectedDataTypes,
    totalsByCategory,
    categoryLabelMap,
  ]);

  const chartTitle = showDailyData
    ? `Daily Breakdown (${dayCount} day${dayCount === 1 ? "" : "s"})`
    : "Agency Totals Breakdown";

  // CSV export handler
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

  // Print handler
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

  // Pie chart data: flatten category and datatype totals into slices
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

  // Determine if daily data mode is active for bar chart rendering
  const showDailyBarChart = showDailyData && viewMode !== "pie";

  return (
    <Card className="p-1 w-full mt-3">
      <CardHeader className="flex flex-col gap-2 items-center">
        <div className="flex justify-between w-full items-center">
          <h3 className="text-base font-medium">{chartTitle}</h3>

          <div className="flex items-center gap-2">
            {/* shadcn Select to choose viewMode */}
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
          className={viewMode === "pie" ? "h-[400px]" : "h-[400px] md:h-[500px]"}
        >
          {viewMode === "pie" ? (
            isPieReady ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={pieSliceColors[idx % pieSliceColors.length]}
                      />
                    ))}
                  </Pie>
                  <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
                  <Tooltip
                    contentStyle={{
                      background: "bg-card",
                      border: "1px solid white",
                      fontWeight: "400",
                      borderRadius: "10px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-muted-foreground text-base animate-pulse">
                  Loading Pie Chart...
                </div>
                {/* Replace with shadcn Skeleton or Spinner for better UX */}
              </div>
            )
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 40, right: 20, left: 20, bottom: 10 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickMargin={10} />
                <YAxis tickMargin={8} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                  contentStyle={{
                    background: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                  }}
                />
                <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
                {showDailyBarChart
                  ? activeCategories.flatMap((cat) =>
                      selectedDataTypes.map((type, idx) => (
                        <Bar
                          key={`${cat}_${type}`}
                          dataKey={`${cat}_${type}`}
                          fill={baseColors[type as keyof typeof baseColors]}
                          stackId={
                            viewMode === "stacked"
                              ? `${cat}-stack`
                              : `${cat}-${type}-group`
                          }
                          radius={idx === selectedDataTypes.length - 1 ? 4 : 0}
                          name={`${
                            categoryLabelMap?.[cat] ?? cat.toUpperCase()
                          } ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                        >
                          <LabelList
                            dataKey={`${cat}_${type}`}
                            position="inside"
                            angle={-90}
                            fill="#fff"
                            fontSize={11}
                            formatter={(value) =>
                              Number(value) > 0 ? value : ""
                            }
                          />
                        </Bar>
                      ))
                    )
                  : selectedDataTypes.map((type, idx) => (
                      <Bar
                        key={type}
                        dataKey={type}
                        fill={baseColors[type as keyof typeof baseColors]}
                        stackId={
                          viewMode === "stacked" ? "agg-stack" : `group-${type}`
                        }
                        radius={idx === selectedDataTypes.length - 1 ? 4 : 0}
                        name={type.charAt(0).toUpperCase() + type.slice(1)}
                      >
                        <LabelList
                          dataKey={type}
                          position="inside"
                          angle={-90}
                          fill="#fff"
                          fontSize={11}
                          formatter={(value) =>
                            Number(value) > 0 ? value : ""
                          }
                        />
                      </Bar>
                    ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      )}
    </Card>
  );
}
