"use client";

import React, { useMemo, useState } from "react";
import { LineChart, Line, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart";
import { CpCpDailyData } from "../types";
import { cn } from "@/lib/utils";

interface CpCpTrendChartProps {
  filteredData: CpCpDailyData[];
  selectedState: string;
}

const chartConfig: ChartConfig = {
  hit: { label: "Hit", color: "hsl(var(--chart-1))" },
  no_hit: { label: "No-Hit", color: "hsl(var(--chart-2))" },
  total: { label: "Total", color: "hsl(var(--chart-4))" },
};

export default function CpCpTrendChart({
  filteredData,
  selectedState,
}: CpCpTrendChartProps) {
  // Legend toggle state
  const [activeKeys, setActiveKeys] = useState<
    Array<"hit" | "no_hit" | "total">
  >(["hit", "no_hit", "total"]);

  const toggleKey = (k: "hit" | "no_hit" | "total") => {
    setActiveKeys((prev) =>
      prev.includes(k) ? prev.filter((x) => x !== k) : [...prev, k]
    );
  };

  const chartData = useMemo(() => {
    if (!filteredData.length) return [];
    return [...filteredData]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day) => {
        const cpCp = day.data[selectedState]?.cp_cp;
        const hit = cpCp?.hit ?? 0;
        const no_hit = cpCp?.no_hit ?? 0;
        const total = cpCp?.total ?? hit + no_hit;
        return {
          label: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          hit,
          no_hit,
          total,
        };
      });
  }, [filteredData, selectedState]);

  // Guard: no data for that state
  if (
    !chartData.length ||
    chartData.every((r) => r.hit === 0 && r.no_hit === 0 && r.total === 0)
  ) {
    return (
      <Card className="w-full">
        <CardHeader>
          <h3 className="text-base font-semibold">
            TP‑TP Trend for {selectedState}
          </h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No data available for the selected state and date range.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-base font-semibold">
          TP‑TP Trend for {selectedState}
        </h3>
      </CardHeader>
      <CardContent className="h-[400px]">
        {/* Top Legend */}
        <div className="flex justify-center gap-4 pb-3">
          {(["hit", "no_hit", "total"] as const).map((k) => {
            const active = activeKeys.includes(k);
            const color = chartConfig[k].color;
            return (
              <button
                key={k}
                type="button"
                onClick={() => toggleKey(k)}
                className={cn(
                  "flex items-center gap-2 rounded-full border px-3 py-1 text-xs sm:text-sm transition",
                  active
                    ? "bg-background"
                    : "opacity-60 line-through text-muted-foreground"
                )}
                style={{ borderColor: color }}
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: active ? color : "transparent",
                    border: `2px solid ${color}`,
                  }}
                />
                {chartConfig[k].label}
              </button>
            );
          })}
        </div>

        {/* Chart */}
        <ChartContainer
          config={chartConfig}
          className="h-[calc(100%-2.25rem)] w-full"
        >
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, bottom: 0, left: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tickMargin={8}
              tickLine={false}
              axisLine={false}
            />
            <YAxis width={48} />
            <ChartTooltip content={<ChartTooltipContent indicator="line" />} />

            {activeKeys.includes("hit") && (
              <Line
                type="monotone"
                dataKey="hit"
                stroke={chartConfig.hit.color}
                strokeWidth={2}
                dot={{ r: 4, stroke: chartConfig.hit.color, strokeWidth: 1 }}
              />
            )}
            {activeKeys.includes("no_hit") && (
              <Line
                type="monotone"
                dataKey="no_hit"
                stroke={chartConfig.no_hit.color}
                strokeWidth={2}
                dot={{ r: 4, stroke: chartConfig.no_hit.color, strokeWidth: 1 }}
              />
            )}
            {activeKeys.includes("total") && (
              <Line
                type="monotone"
                dataKey="total"
                stroke={chartConfig.total.color}
                strokeWidth={2}
                strokeDasharray="6 4"
                activeDot={{ r: 5 }}
                dot={{ r: 4, stroke: chartConfig.total.color, strokeWidth: 1 }}
              />
            )}
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
