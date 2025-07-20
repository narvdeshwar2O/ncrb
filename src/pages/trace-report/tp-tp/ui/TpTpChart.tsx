import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  CartesianGrid,
  Legend,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TpTpDailyData, TpTpStatusKey } from "../types";

interface TpTpChartProps {
  filteredData: TpTpDailyData[];
  selectedStatuses: TpTpStatusKey[];
}

const COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#22c55e", // green
  "#f59e0b", // amber
  "#8b5cf6", // violet
  "#14b8a6", // teal
  "#fb7185", // rose
  "#6b7280", // gray
];

const TpTpChart: React.FC<TpTpChartProps> = ({ filteredData, selectedStatuses }) => {
  // Remove "total" since we don't plot it directly
  const metrics = useMemo(
    () => selectedStatuses.filter((s) => s !== "total"),
    [selectedStatuses]
  );

  // Prepare chart data
  const chartData = useMemo(() => {
    return [...filteredData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day) => {
        const row: Record<string, any> = {
          label: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };

        for (const metric of metrics) {
          let total = 0;
          for (const stateData of Object.values(day.data)) {
            total += stateData.tp_tp?.[metric as keyof typeof stateData.tp_tp] ?? 0;
          }
          row[metric] = total;
        }
        return row;
      });
  }, [filteredData, metrics]);

  // Chart configuration
  const chartConfig = useMemo(() => {
    const config: any = {};
    metrics.forEach((metric, idx) => {
      config[metric] = {
        label: formatMetric(metric),
        color: COLORS[idx % COLORS.length],
      };
    });
    return config;
  }, [metrics]);

  if (metrics.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-base font-semibold">TP‑TP Chart</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Select at least one metric to view the chart.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-base font-semibold">TP‑TP Trends</h3>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ChartContainer config={chartConfig} className="h-full w-full">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickMargin={10}
              angle={chartData.length > 10 ? -45 : 0}
              textAnchor={chartData.length > 10 ? "end" : "middle"}
              height={chartData.length > 10 ? 80 : 40}
            />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
            {metrics.map((metric) => (
              <Bar
                key={metric}
                dataKey={metric}
                fill={chartConfig[metric]?.color}
                radius={0}
              />
            ))}
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ paddingBottom: 10 }}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default TpTpChart;

function formatMetric(metric: string): string {
  switch (metric) {
    case "hit":
      return "Hit";
    case "no_hit":
      return "No-Hit";
    case "own_state":
      return "Own State";
    case "inter_state":
      return "Inter State";
    default:
      return metric;
  }
}
