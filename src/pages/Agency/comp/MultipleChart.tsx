import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
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
  tpTotal: {
    enrollment: number;
    hit: number;
    nohit: number;
    total?: number;
  };
  cpTotal: {
    enrollment: number;
    hit: number;
    nohit: number;
    total?: number;
  };
  mesaTotal: {
    enrollment: number;
    hit: number;
    nohit: number;
    total?: number;
  };
  filteredData: DailyData[];
  filters: FilterState;
}

const chartConfig = {
  // TP - Blue family
  tp_enrollment: { label: "TP Enrollment", color: "hsl(217, 100%, 65%)" }, // bright blue
  tp_hit: { label: "TP Hit", color: "hsl(217, 80%, 55%)" }, // standard blue
  tp_nohit: { label: "TP No-Hit", color: "hsl(217, 70%, 45%)" }, // deep blue

  // CP - Teal family
  cp_enrollment: { label: "CP Enrollment", color: "hsl(174, 70%, 55%)" }, // bright teal
  cp_hit: { label: "CP Hit", color: "hsl(174, 60%, 45%)" }, // mid teal
  cp_nohit: { label: "CP No-Hit", color: "hsl(174, 50%, 35%)" }, // dark teal

  // MESA - Amber/Gold family
  mesa_enrollment: { label: "MESA Enrollment", color: "hsl(40, 100%, 60%)" }, // golden amber
  mesa_hit: { label: "MESA Hit", color: "hsl(40, 90%, 50%)" }, // rich amber
  mesa_nohit: { label: "MESA No-Hit", color: "hsl(40, 80%, 40%)" }, // dark amber
} satisfies ChartConfig;
export function MultipleChart({
  tpTotal,
  cpTotal,
  mesaTotal,
  filteredData,
  filters,
}: MultipleChartProps) {
  // Check if we have a specific date range (like last 7 days)
  const hasDateRange = filters.dateRange.from && filters.dateRange.to;

  // If there's a date range and we have filtered data, show daily data
  const showDailyData =
    hasDateRange && filteredData.length > 0 && filteredData.length <= 90;

  // Define custom bar sizes based on number of days
  const getBarSize = (dayCount: number) => {
    if (dayCount <= 7) return 40;
    if (dayCount <= 30) return 15;
    if (dayCount <= 90) return 10;
    return 5;
  };

  const barSize = showDailyData ? getBarSize(filteredData.length) : 50;

  let chartData;

  if (showDailyData) {
    // Create daily chart data with TP, CP, MESA breakdown by enrollment/hit/nohit
    chartData = filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((dayData) => {
        const tpDayTotal = computeCombinedTotal([dayData], "tp", filters);
        const cpDayTotal = computeCombinedTotal([dayData], "cp", filters);
        const mesaDayTotal = computeCombinedTotal([dayData], "mesha", filters);

        return {
          label: new Date(dayData.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          date: dayData.date,
          // TP data
          tp_enrollment: tpDayTotal.enrollment,
          tp_hit: tpDayTotal.hit,
          tp_nohit: tpDayTotal.nohit,

          // CP data
          cp_enrollment: cpDayTotal.enrollment,
          cp_hit: cpDayTotal.hit,
          cp_nohit: cpDayTotal.nohit,

          // MESA data
          mesa_enrollment: mesaDayTotal.enrollment,
          mesa_hit: mesaDayTotal.hit,
          mesa_nohit: mesaDayTotal.nohit,
        };
      });
  } else {
    // Show totals for TP, CP, MESA with their breakdown
    chartData = [
      {
        label: "TP",
        enrollment: tpTotal.enrollment,
        hit: tpTotal.hit,
        nohit: tpTotal.nohit,
      },
      {
        label: "CP",
        enrollment: cpTotal.enrollment,
        hit: cpTotal.hit,
        nohit: cpTotal.nohit,
      },
      {
        label: "MESA",
        enrollment: mesaTotal.enrollment,
        hit: mesaTotal.hit,
        nohit: mesaTotal.nohit,
      },
    ];
  }

  const chartTitle = showDailyData
    ? `Daily Breakdown by Agency (${filteredData.length} days)`
    : "Agency Totals Breakdown";

  const selectedDataTypes =
    filters.dataTypes && filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"]; // default show all

  // Legend colors for totals view (must match your Bar `fill` colors)
  const totalsLegend = {
    enrollment: { label: "Enrollment", color: "blue" },
    hit: { label: "Hit", color: "#059669" },
    nohit: { label: "No Hit", color: "green" },
  } as const;

  return (
    <Card className="p-1">
      <CardHeader className="flex flex-col gap-2 items-center">
        <h3 className="text-base font-medium">{chartTitle}</h3>
        {filteredData.length <= 90 ? (
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(chartConfig)
              .filter(([key]) => {
                if (
                  selectedDataTypes.includes("enrollment") &&
                  key.includes("enrollment")
                )
                  return true;
                if (selectedDataTypes.includes("hit") && key.includes("hit"))
                  return true;
                if (
                  selectedDataTypes.includes("nohit") &&
                  key.includes("nohit")
                )
                  return true;
                return false;
              })
              .map(([key, { label, color }]) => (
                <div key={key} className="flex items-center gap-1 text-sm">
                  <span
                    className="inline-block w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  ></span>
                  <span className="text-muted-foreground">{label}</span>
                </div>
              ))}
          </div>
        ) : (
          <div className="flex gap-3 flex-wrap justify-center">
            {selectedDataTypes.includes("enrollment") && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: totalsLegend.enrollment.color }}
                />
                <span className="text-muted-foreground">
                  {totalsLegend.enrollment.label}
                </span>
              </div>
            )}
            {selectedDataTypes.includes("hit") && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: totalsLegend.hit.color }}
                />
                <span className="text-muted-foreground">
                  {totalsLegend.hit.label}
                </span>
              </div>
            )}
            {selectedDataTypes.includes("nohit") && (
              <div className="flex items-center gap-1 text-sm">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{ backgroundColor: totalsLegend.nohit.color }}
                />
                <span className="text-muted-foreground">
                  {totalsLegend.nohit.label}
                </span>
              </div>
            )}
          </div>
        )}
      </CardHeader>

      <CardContent className="h-[300px] md:h-[400px] lg:h-[500px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />

            <XAxis
              dataKey="label"
              tickLine={true}
              tickMargin={10}
              axisLine={true}
              angle={showDailyData ? -45 : 0}
              textAnchor={showDailyData ? "end" : "middle"}
              height={showDailyData ? 80 : 60}
            />

            <YAxis
              tickLine={true}
              axisLine={true}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />

            <ChartTooltip
              cursor={true}
              content={
                <ChartTooltipContent
                  indicator="line"
                  className="cursor-pointer"
                />
              }
            />

            {showDailyData ? (
              // Daily view - show stacked bars for each agency with enrollment/hit/nohit
              <>
                {/* TP bars (dynamic) */}
                {selectedDataTypes.includes("enrollment") && (
                  <Bar
                    dataKey="tp_enrollment"
                    fill="var(--color-tp_enrollment)"
                    radius={[0, 0, 4, 4]}
                    barSize={barSize}
                    name="TP Enrollment"
                    stackId="tp"
                  />
                )}
                {selectedDataTypes.includes("hit") && (
                  <Bar
                    dataKey="tp_hit"
                    fill="var(--color-tp_hit)"
                    barSize={barSize}
                    name="TP Hit"
                    stackId="tp"
                  />
                )}
                {selectedDataTypes.includes("nohit") && (
                  <Bar
                    dataKey="tp_nohit"
                    fill="var(--color-tp_nohit)"
                    radius={[4, 4, 0, 0]}
                    barSize={barSize}
                    name="TP No-Hit"
                    stackId="tp"
                  />
                )}

                {/* CP bars */}
                {/* TP bars (dynamic) */}
                {selectedDataTypes.includes("enrollment") && (
                  <Bar
                    dataKey="cp_enrollment"
                    fill="var(--color-cp_enrollment)"
                    radius={[0, 0, 4, 4]}
                    barSize={barSize}
                    name="CP Enrollment"
                    stackId="cp"
                  />
                )}
                {selectedDataTypes.includes("hit") && (
                  <Bar
                    dataKey="cp_hit"
                    fill="var(--color-cp_hit)"
                    barSize={barSize}
                    name="cP Hit"
                    stackId="cp"
                  />
                )}
                {selectedDataTypes.includes("nohit") && (
                  <Bar
                    dataKey="cp_nohit"
                    fill="var(--color-cp_nohit)"
                    radius={[4, 4, 0, 0]}
                    barSize={barSize}
                    name="CP No-Hit"
                    stackId="cp"
                  />
                )}

                {/* MESA bars */}
                {/* TP bars (dynamic) */}
                {selectedDataTypes.includes("enrollment") && (
                  <Bar
                    dataKey="mesa_enrollment"
                    fill="var(--color-mesa_enrollment)"
                    radius={[0, 0, 4, 4]}
                    barSize={barSize}
                    name="MESA Enrollment"
                    stackId="mesa"
                  />
                )}
                {selectedDataTypes.includes("hit") && (
                  <Bar
                    dataKey="mesa_hit"
                    fill="var(--color-mesa_hit)"
                    barSize={barSize}
                    name="MESA Hit"
                    stackId="mesa"
                  />
                )}
                {selectedDataTypes.includes("nohit") && (
                  <Bar
                    dataKey="mesa_nohit"
                    fill="var(--color-mesa_nohit)"
                    radius={[4, 4, 0, 0]}
                    barSize={barSize}
                    name="MESA No-Hit"
                    stackId="mesa"
                  />
                )}
              </>
            ) : (
              <>
                {selectedDataTypes.includes("enrollment") && (
                  <Bar
                    dataKey="enrollment"
                    fill="blue"
                    radius={4}
                    barSize={50}
                    name="Enrollment"
                  />
                )}
                {selectedDataTypes.includes("hit") && (
                  <Bar
                    dataKey="hit"
                    fill="#059669"
                    radius={4}
                    barSize={50}
                    name="Hit"
                  />
                )}
                {selectedDataTypes.includes("nohit") && (
                  <Bar
                    dataKey="nohit"
                    fill="green"
                    radius={4}
                    barSize={50}
                    name="No-Hit"
                  />
                )}
              </>
            )}
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
