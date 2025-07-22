import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { FilterState } from "@/components/filters/types/FilterTypes";
import computeCombinedTotal from "@/utils/computeCombinedTotal";

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
  /** Optional map for friendly category display names. */
  categoryLabelMap?: Record<string, string>;
}

/* Base colors (kept from your original). */
const baseChartConfig: ChartConfig = {
  tp_enrollment: { label: "TP Enrollment", color: "hsl(217, 100%, 65%)" },
  tp_hit: { label: "TP Hit", color: "hsl(217, 80%, 55%)" },
  tp_nohit: { label: "TP No-Hit", color: "hsl(217, 70%, 45%)" },

  cp_enrollment: { label: "CP Enrollment", color: "hsl(174, 70%, 55%)" },
  cp_hit: { label: "CP Hit", color: "hsl(174, 60%, 45%)" },
  cp_nohit: { label: "CP No-Hit", color: "hsl(174, 50%, 35%)" },

  mesa_enrollment: { label: "MESA Enrollment", color: "hsl(40, 100%, 60%)" },
  mesa_hit: { label: "MESA Hit", color: "hsl(40, 90%, 50%)" },
  mesa_nohit: { label: "MESA No-Hit", color: "hsl(40, 80%, 40%)" },
};

/**
 * Sum category totals for *one day* across the selected states.
 */
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

/**
 * MultipleChart
 * - Daily view (<= 90 days): date x multi‑stack per category+metric.
 * - Aggregate view: category x metrics.
 */
export function MultipleChart({
  filteredData,
  filters,
  activeCategories,
  totalsByCategory,
  categoryLabelMap,
}: MultipleChartProps) {
  const hasDateRange = filters.dateRange.from && filters.dateRange.to;
  const dayCount = filteredData.length;
  const showDailyData = hasDateRange && dayCount > 0 && dayCount <= 90;

  const selectedStates = filters.state ?? [];
  const selectedDataTypes =
    filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"];

  const getBarSize = (dc: number) => {
    if (dc <= 7) return 40;
    if (dc <= 30) return 15;
    if (dc <= 90) return 10;
    return 5;
  };
  const barSize = showDailyData ? getBarSize(dayCount) : 50;

  /**
   * Build chart data.
   * DAILY MODE: One row per day, per category & metric (sums across selected states).
   * AGGREGATE MODE: One row per category; metrics from `totalsByCategory`.
   */
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
          if (selectedDataTypes.includes("enrollment"))
            row[`${cat}_enrollment`] = totals.enrollment;
          if (selectedDataTypes.includes("hit"))
            row[`${cat}_hit`] = totals.hit;
          if (selectedDataTypes.includes("nohit"))
            row[`${cat}_nohit`] = totals.nohit;
        });

        return row;
      });
    }

    // aggregate
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

  /* Legend build */
  const legendItems = useMemo(() => {
    if (showDailyData) {
      // use baseChartConfig but replace category label prefix if provided
      return Object.entries(baseChartConfig)
        .filter(([key]) =>
          selectedDataTypes.some((type) => key.endsWith(`_${type}`))
        )
        .map(([key, { color }]) => {
          // key = "tp_enrollment"
          const [cat, metric] = key.split("_");
          const friendlyCat = categoryLabelMap?.[cat] ?? cat.toUpperCase();
          const friendlyMetric =
            metric.charAt(0).toUpperCase() + metric.slice(1);
          return {
            key,
            label: `${friendlyCat} ${friendlyMetric}`,
            color,
          };
        });
    }
    // aggregate legend by metric only
    return selectedDataTypes.map((type) => ({
      key: type,
      label: type.charAt(0).toUpperCase() + type.slice(1),
      color:
        type === "enrollment"
          ? "blue"
          : type === "hit"
          ? "#059669"
          : "green",
    }));
  }, [showDailyData, selectedDataTypes, categoryLabelMap]);

  return (
    <Card className="p-1 w-full mt-3">
      <CardHeader className="flex flex-col gap-2 items-center">
        <h3 className="text-base font-medium">{chartTitle}</h3>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 justify-center">
          {legendItems.map(({ key, label, color }) => (
            <div key={key} className="flex items-center gap-1 text-sm">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span className="text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </CardHeader>

      <CardContent className="h-[300px] md:h-[400px] lg:h-[500px]">
        <ChartContainer config={baseChartConfig} className="h-full w-full">
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
              cursor
              content={<ChartTooltipContent indicator="line" />}
            />

            {showDailyData
              ? activeCategories.flatMap((cat) =>
                  selectedDataTypes.map((type) => {
                    const key = `${cat}_${type}`;
                    return (
                      <Bar
                        key={key}
                        dataKey={key}
                        fill={baseChartConfig[key]?.color || "#ccc"}
                        barSize={barSize}
                        stackId={cat}
                        name={`${categoryLabelMap?.[cat] ?? cat.toUpperCase()} ${
                          type.charAt(0).toUpperCase() + type.slice(1)
                        }`}
                        radius={2}
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
