import * as React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

import { CpCpTableRow, CpCpStatusKey } from "../types";

/* ------------------------------------------------------------------ */
/* Labels + Colors                                                     */
/* ------------------------------------------------------------------ */
const LABELS: Record<CpCpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  intra_state: "Own State",
  inter_state: "Inter State",
  total: "Total",
};

// Use CSS custom props so colors adapt to light/dark (see Theme vars)
const COLOR_MAP: Record<CpCpStatusKey, string> = {
  hit: "hsl(var(--chart-1))",
  no_hit: "hsl(var(--chart-2))",
  intra_state: "hsl(var(--chart-3))",
  inter_state: "hsl(var(--chart-4))",
  total: "hsl(var(--chart-5))",
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface CpCpComparisonChartProps {
  rows: CpCpTableRow[];
  statuses: CpCpStatusKey[]; // metrics available in UI
  selectedStates: string[]; // states user picked in filters
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export default function CpCpComparisonChart({
  rows,
  statuses,
  selectedStates,
}: CpCpComparisonChartProps) {
  // Drop duplicate + ensure we have valid keys
  const statusOptions = React.useMemo<CpCpStatusKey[]>(() => {
    const set = new Set<CpCpStatusKey>();
    statuses.forEach((s) => set.add(s));
    return Array.from(set);
  }, [statuses]);

  // Default selected metric = first option (fallback hit)
  const [selectedMetric, setSelectedMetric] = React.useState<CpCpStatusKey>(
    statusOptions[0] ?? "hit"
  );

  // Chart data: each selected state → { state, value }
  const chartData = React.useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));
    const statesToUse =
      selectedStates.length > 0 ? selectedStates : rows.map((r) => r.state);

    return statesToUse
      .filter((s) => lookup.has(s))
      .map((s) => {
        const row = lookup.get(s)!;
        const v = Number(row[selectedMetric] ?? 0);
        return { state: s, value: v };
      });
  }, [rows, selectedStates, selectedMetric]);

  /* ---- Guard: need at least 2 states for comparison ---- */
  if (selectedStates.length < 2) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
        </CardContent>
      </Card>
    );
  }

  /* ---- Guard: no data ---- */
  if (!chartData.length) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          No data available for the selected filters.
        </CardContent>
      </Card>
    );
  }

  /* ---- ChartConfig for ChartContainer ---- */
  const chartConfig = React.useMemo(
    () => ({
      [selectedMetric]: {
        label: LABELS[selectedMetric],
        color: COLOR_MAP[selectedMetric],
      },
    }),
    [selectedMetric]
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <h2 className="text-lg font-semibold">State Comparison</h2>
          <Select
            value={selectedMetric}
            onValueChange={(v) => setSelectedMetric(v as CpCpStatusKey)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((s) => (
                <SelectItem key={s} value={s}>
                  {LABELS[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="state"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={0}
                textAnchor="middle"
              />
              <YAxis />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    hideLabel={false}
                    nameKey={LABELS[selectedMetric]}
                  />
                }
              />
              <Bar
                dataKey="value"
                fill={COLOR_MAP[selectedMetric]}
                radius={[10, 10, 0, 0]}
                name={LABELS[selectedMetric]}
              >
                <LabelList
                  dataKey="value"
                  position="inside"
                  fill="hsl(var(--background))"
                  fontSize={12}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
