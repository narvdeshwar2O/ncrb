"use client";

import { useState } from "react";
import { GitCommitVertical } from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { SlipDailyData, StatusKey } from "../types";

// ✅ Theme-aware colors
const chartConfig: ChartConfig = {
  Arrested: { label: "Arrested", color: "hsl(var(--chart-1))" },
  Convicted: { label: "Convicted", color: "hsl(var(--chart-2))" },
  Suspect: { label: "Suspect", color: "hsl(var(--chart-3))" },
  Total: { label: "Total", color: "hsl(var(--chart-4))" },
};

interface SlipCaptureTrendChartProps {
  filteredData: SlipDailyData[];
  selectedState: string;
}

export function SlipCaptureTrendChart({
  filteredData,
  selectedState,
}: SlipCaptureTrendChartProps) {
  const [activeLines, setActiveLines] = useState<StatusKey[]>([
    "Arrested",
    "Convicted",
    "Suspect",
    "Total",
  ]);

  const toggleLine = (key: StatusKey) => {
    setActiveLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // ✅ Prepare Chart Data
  const chartData = filteredData
    .map((day) => {
      const stateData = day.data[selectedState];
      if (!stateData) return null;
      const arrested = stateData.Arrested ?? 0;
      const convicted = stateData.Convicted ?? 0;
      const suspect = stateData.Suspect ?? 0;
      const total = arrested + convicted + suspect;

      return {
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        Arrested: arrested,
        Convicted: convicted,
        Suspect: suspect,
        Total: total,
      };
    })
    .filter(Boolean);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base">No Data Available</CardTitle>
          <CardDescription className="text-xs">
            Select a date range and a state with valid data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="py-2">
      <CardHeader className="py-3">
        <CardTitle className="text-base">
          {selectedState} - Crime Trends
        </CardTitle>
        <CardDescription className="text-xs">
          Arrested, Convicted, Suspect & Total
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0 h-[400px]">
        {/* ✅ Legend (now includes Total as toggleable) */}
        <div className="flex justify-center gap-4 py-2 border-b flex-wrap">
          {(["Arrested", "Convicted", "Suspect", "Total"] as StatusKey[]).map(
            (key) => (
              <button
                key={key}
                onClick={() => toggleLine(key)}
                className="flex items-center gap-1 text-xs sm:text-sm"
              >
                <span
                  className="h-3 w-3 rounded-full"
                  style={{
                    backgroundColor: activeLines.includes(key)
                      ? chartConfig[key].color
                      : "transparent",
                    border: `2px solid ${chartConfig[key].color}`,
                  }}
                />
                <span
                  className={
                    activeLines.includes(key)
                      ? "text-foreground"
                      : "text-muted-foreground line-through"
                  }
                >
                  {chartConfig[key].label}
                </span>
              </button>
            )
          )}
        </div>

        {/* ✅ Chart */}
        <ChartContainer config={chartConfig} className="h-full w-full p-2">
          <div className="w-full h-[300px] sm:h-[340px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 8, right: 8, bottom: 4, left: 8 }}
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis width={48} />
                <ChartTooltip content={<ChartTooltipContent />} />

                {activeLines.includes("Arrested") && (
                  <Line
                    dataKey="Arrested"
                    stroke={chartConfig.Arrested.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Convicted") && (
                  <Line
                    dataKey="Convicted"
                    stroke={chartConfig.Convicted.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Suspect") && (
                  <Line
                    dataKey="Suspect"
                    stroke={chartConfig.Suspect.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("Total") && (
                  <Line
                    dataKey="Total"
                    stroke={chartConfig.Total.color}
                    strokeWidth={2}
                    strokeDasharray="6 4"
                    dot={({ cx, cy, payload }) => {
                      const r = 14;
                      return (
                        <GitCommitVertical
                          key={payload.date}
                          x={cx - r / 2}
                          y={cy - r / 2}
                          width={r}
                          height={r}
                          fill="hsl(var(--background))"
                          stroke={chartConfig.Total.color}
                        />
                      );
                    }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
