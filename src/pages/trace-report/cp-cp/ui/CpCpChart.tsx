import React, { useMemo, useRef, useState } from "react";
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
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { CpCpDailyData, CpCpStatusKey } from "../types";

// Base colors for CpCp metrics
const baseColors: Record<CpCpStatusKey, string> = {
  hit: "hsl(217, 100%, 65%)",
  no_hit: "hsl(174, 70%, 55%)",
  intra_state: "hsl(40, 100%, 60%)",
  inter_state: "hsl(0, 70%, 60%)",
  total: "hsl(200, 20%, 50%)",
};

const pieSliceColors = [
  "hsl(217, 100%, 65%)",
  "hsl(174, 70%, 55%)",
  "hsl(40, 100%, 60%)",
  "hsl(0, 70%, 60%)",
];

const metricLabelMap: Record<CpCpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No-Hit",
  intra_state: "Intra State",
  inter_state: "Inter State",
  total: "Total",
};

interface CpCpChartProps {
  filteredData: CpCpDailyData[];
  selectedStatuses: CpCpStatusKey[];
  title: string;
}

function computeDayMetricTotals(day: CpCpDailyData, metric: CpCpStatusKey) {
  let total = 0;
  for (const st of Object.keys(day.data)) {
    const rec = day.data?.[st]?.cp_cp;
    if (!rec) continue;
    total += rec[metric] ?? 0;
  }
  return total;
}

export default function CpCpChart({
  filteredData,
  selectedStatuses,
  title,
}: CpCpChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [chartType, setChartType] = useState<"stacked" | "grouped" | "pie">("stacked");

  // Filter metrics (omit 'total')
  const activeMetrics = useMemo(
    () => selectedStatuses.filter((s) => s !== "total"),
    [selectedStatuses]
  );

  // Build chart data (Bar)
  const chartData = useMemo(() => {
    if (filteredData.length > 0) {
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
        activeMetrics.forEach((metric) => {
          row[metric] = computeDayMetricTotals(day, metric);
        });
        return row;
      });
    }
    return [];
  }, [filteredData, activeMetrics]);

  const chartTitle = `${title} Trends (${chartData.length} day${chartData.length === 1 ? "" : "s"})`;

  // Pie chart data: Aggregate all data per metric for single-pie
  const pieData = useMemo(() => {
    return activeMetrics.map((metric, idx) => {
      const total = filteredData.reduce(
        (acc, day) => acc + computeDayMetricTotals(day, metric),
        0
      );
      return {
        name: metricLabelMap[metric],
        value: total,
        color: pieSliceColors[idx % pieSliceColors.length],
      };
    }).filter((d) => d.value > 0);
  }, [filteredData, activeMetrics]);

  // Print handler
  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

  // CSV export handler
  const handleExportCSV = () => {
    if (chartType === "pie") {
      const headers = ["Metric", "Total"];
      const rows = pieData.map((row) => [row.name, row.value]);
      exportService.exportToCSV(`${slugify(chartTitle)}_Pie.csv`, headers, rows);
    } else {
      const headers = ["Date", ...activeMetrics.map((m) => metricLabelMap[m])];
      const rows = chartData.map((item) => [
        item.label,
        ...activeMetrics.map((metric) => item[metric] ?? 0),
      ]);
      exportService.exportToCSV(`${slugify(chartTitle)}.csv`, headers, rows);
    }
  };

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");

  return (
    <Card className="w-full !shadow-none !border-none !p-0">
      <CardHeader className="flex flex-col gap-2 items-center border-t">
        <div className="flex justify-between w-full items-center">
          <h3 className="text-base font-medium">{chartTitle}</h3>
          <div className="flex items-center gap-2">
            <Select
              value={chartType}
              onValueChange={(val) =>
                setChartType(val as "stacked" | "grouped" | "pie")
              }
            >
              <SelectTrigger className="w-[120px] print-hide">
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

      {activeMetrics.length === 0 ? (
        <CardContent className="h-[200px] flex items-center justify-center text-center text-red-600 font-medium">
          Please select at least one metric to display the chart.
        </CardContent>
      ) : (
        <CardContent ref={chartRef} className="h-[400px] md:h-[500px]">
          {chartType === "pie" ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={120}
                  label={({ name, value }) =>
                    value && value > 0 ? `${name}: ${value}` : ""
                  }
                >
                  {pieData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
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
                {activeMetrics.map((metric, idx) => (
                  <Bar
                    key={metric}
                    dataKey={metric}
                    fill={baseColors[metric]}
                    stackId={chartType === "stacked" ? "stack" : undefined}
                    radius={idx === activeMetrics.length - 1 ? 4 : 0}
                    name={metricLabelMap[metric]}
                  >
                    <LabelList
                      dataKey={metric}
                      position="inside"
                      angle={chartType === "stacked" ? 0 : -90}
                      fill="#fff"
                      fontSize={11}
                      formatter={(value) => (Number(value) > 0 ? value : "")}
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
