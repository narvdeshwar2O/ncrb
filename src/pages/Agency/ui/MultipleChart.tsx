import { useMemo, useRef, useState } from "react";
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
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { FilterState } from "@/components/filters/types/FilterTypes";
import { Button } from "@/components/ui/button";
import { Download, Printer, Layers3 } from "lucide-react";
import * as exportService from "@/utils/exportService";

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

const baseColors = {
  enrollment: "hsl(217, 100%, 65%)",
  hit: "hsl(174, 70%, 55%)",
  nohit: "hsl(40, 100%, 60%)",
};

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

export function MultipleChart({
  filteredData,
  filters,
  activeCategories,
  totalsByCategory,
  categoryLabelMap,
}: MultipleChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);

  const hasDateRange = filters.dateRange.from && filters.dateRange.to;
  const dayCount = filteredData.length;
  const showDailyData = hasDateRange && dayCount > 0 && dayCount <= 90;

  const selectedStates = filters.state ?? [];
  const selectedDataTypes =
    filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"];
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

  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

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

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  return (
    <Card className="p-1 w-full mt-3">
      <CardHeader className="flex flex-col gap-2 items-center">
        <div className="flex justify-between w-full items-center">
          <h3 className="text-base font-medium">{chartTitle}</h3>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStacked((prev) => !prev)}
              className="print-hide"
            >
              <Layers3 className="h-4 w-4 mr-1" />{" "}
              {isStacked ? "Grouped" : "Stacked"}
            </Button>
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
        <CardContent ref={chartRef} className="h-[400px] md:h-[500px]">
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

              {showDailyData
                ? activeCategories.flatMap((cat) =>
                    selectedDataTypes.map((type, idx) => (
                      <Bar
                        key={`${cat}_${type}`}
                        dataKey={`${cat}_${type}`}
                        fill={baseColors[type as keyof typeof baseColors]}
                        stackId={
                          isStacked ? `${cat}-stack` : `${cat}-${type}-group`
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
                      stackId={isStacked ? "agg-stack" : `group-${type}`}
                      radius={idx === selectedDataTypes.length - 1 ? 4 : 0}
                      name={type.charAt(0).toUpperCase() + type.slice(1)}
                    >
                      <LabelList
                        dataKey={type}
                        position="inside"
                        angle={-90}
                        fill="#fff"
                        fontSize={11}
                        formatter={(value) => (Number(value) > 0 ? value : "")}
                      />
                    </Bar>
                  ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      )}
    </Card>
  );
}
