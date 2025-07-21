import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FilterState } from "@/components/filters/types/FilterTypes";
import computeCombinedTotal from "@/utils/computeCombinedTotal";
import { useMemo } from "react";

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
}

const chartConfig: ChartConfig = {
  tp_enrollment: { label: "TP Enrollment", color: "hsl(217, 100%, 65%)" },
  tp_hit: { label: "TP Hit", color: "hsl(217, 80%, 55%)" },
  tp_nohit: { label: "TP No-Hit", color: "hsl(217, 70%, 45%)" },

  cp_enrollment: { label: "CP Enrollment", color: "hsl(174, 70%, 55%)" },
  cp_hit: { label: "CP Hit", color: "hsl(174, 60%, 45%)" },
  cp_nohit: { label: "CP No-Hit", color: "hsl(174, 50%, 35%)" },

  mesa_enrollment: { label: "mesa Enrollment", color: "hsl(40, 100%, 60%)" },
  mesa_hit: { label: "mesa Hit", color: "hsl(40, 90%, 50%)" },
  mesa_nohit: { label: "mesa No-Hit", color: "hsl(40, 80%, 40%)" },
};

export function MultipleChart({
  filteredData,
  filters,
  activeCategories,
  totalsByCategory,
}: MultipleChartProps) {
  const hasDateRange = filters.dateRange.from && filters.dateRange.to;
  const showDailyData =
    hasDateRange && filteredData.length > 0 && filteredData.length <= 90;

  const getBarSize = (dayCount: number) => {
    if (dayCount <= 7) return 40;
    if (dayCount <= 30) return 15;
    if (dayCount <= 90) return 10;
    return 5;
  };

  const barSize = showDailyData ? getBarSize(filteredData.length) : 50;

  // ✅ Build chart data dynamically
  const chartData = useMemo(() => {
    if (showDailyData) {
      return filteredData
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((day) => {
          const row: Record<string, any> = {
            label: new Date(day.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            }),
          };

          activeCategories.forEach((category) => {
            const totals = computeCombinedTotal(
              filteredData,
              category as "tp" | "cp" | "mesa",
              filters
            );

            if (filters.dataTypes.includes("enrollment"))
              row[`${category}_enrollment`] = totals.enrollment;
            if (filters.dataTypes.includes("hit"))
              row[`${category}_hit`] = totals.hit;
            if (filters.dataTypes.includes("nohit"))
              row[`${category}_nohit`] = totals.nohit;
          });

          return row;
        });
    } else {
      return activeCategories.map((category) => ({
        label: category.toUpperCase(),
        enrollment: totalsByCategory[category]?.enrollment || 0,
        hit: totalsByCategory[category]?.hit || 0,
        nohit: totalsByCategory[category]?.nohit || 0,
      }));
    }
  }, [
    filteredData,
    activeCategories,
    filters,
    showDailyData,
    totalsByCategory,
  ]);

  const chartTitle = showDailyData
    ? `Daily Breakdown (${filteredData.length} days)`
    : "Agency Totals Breakdown";

  const selectedDataTypes =
    filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"];

  return (
    <Card className="p-1 w-full mt-3">
      <CardHeader className="flex flex-col gap-2 items-center">
        <h3 className="text-base font-medium">{chartTitle}</h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {showDailyData
            ? Object.entries(chartConfig)
                .filter(([key]) =>
                  selectedDataTypes.some((type) => key.includes(type))
                )
                .map(([key, { label, color }]) => (
                  <div key={key} className="flex items-center gap-1 text-sm">
                    <span
                      className="inline-block w-3 h-3 rounded-full"
                      style={{ backgroundColor: color }}
                    ></span>
                    <span className="text-muted-foreground">{label}</span>
                  </div>
                ))
            : selectedDataTypes.map((type) => (
                <div key={type} className="flex items-center gap-1 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{
                      backgroundColor:
                        type === "enrollment"
                          ? "blue"
                          : type === "hit"
                          ? "#059669"
                          : "green",
                    }}
                  />
                  <span className="text-muted-foreground">
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                </div>
              ))}
        </div>
      </CardHeader>

      <CardContent className="h-[300px] md:h-[400px] lg:h-[500px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="label"
              tickMargin={10}
              angle={showDailyData ? -45 : 0}
              textAnchor={showDailyData ? "end" : "middle"}
              height={showDailyData ? 80 : 40}
            />
            <YAxis tickMargin={8} />

            <ChartTooltip
              cursor={true}
              content={<ChartTooltipContent indicator="line" />}
            />

            {showDailyData
              ? activeCategories.flatMap((category) =>
                  selectedDataTypes.map((type) => {
                    const key = `${category}_${type}`;
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={chartConfig[key]?.color || "#ccc"}
                        barSize={barSize}
                        stackId={category}
                        name={(chartConfig[key]?.label || key) as string}
                      />
                    );
                  })
                )
              : selectedDataTypes.map((type) => (
                  <Bar
                    key={type}
                    dataKey={type}
                    fill={
                      type === "enrollment"
                        ? "blue"
                        : type === "hit"
                        ? "#059669"
                        : "green"
                    }
                    barSize={50}
                    radius={4}
                  />
                ))}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
