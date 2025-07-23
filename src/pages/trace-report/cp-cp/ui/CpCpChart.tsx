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
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Layers3 } from "lucide-react";
import * as exportService from "@/utils/exportService";
import { CpCpDailyData, CpCpStatusKey } from "../types";

// Base colors for CpCp metrics
const baseColors: Record<CpCpStatusKey, string> = {
  hit: "hsl(217, 100%, 65%)",
  no_hit: "hsl(174, 70%, 55%)",
  intra_state: "hsl(40, 100%, 60%)",
  inter_state: "hsl(0, 70%, 60%)",
  total: "hsl(200, 20%, 50%)", // not used in chart but kept for mapping
};

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
  title:String
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
  title
}: CpCpChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const [isStacked, setIsStacked] = useState(false);

  // Active metrics (exclude total)
  const activeMetrics = useMemo(
    () => selectedStatuses.filter((s) => s !== "total"),
    [selectedStatuses]
  );

  // Build chart data
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

    // fallback (empty data)
    return [];
  }, [filteredData, activeMetrics]);

  const chartTitle = `${title} Trends (${chartData.length} day${chartData.length === 1 ? "" : "s"})`;

  // Print handler
  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Date", ...activeMetrics.map((m) => metricLabelMap[m])];
    const rows = chartData.map((item) => [
      item.label,
      ...activeMetrics.map((metric) => item[metric] ?? 0),
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
              <Layers3 className="h-4 w-4 mr-1" />
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

      {activeMetrics.length === 0 ? (
        <CardContent className="h-[200px] flex items-center justify-center text-center text-red-600 font-medium">
          Please select at least one metric to display the chart.
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

              {activeMetrics.map((metric, idx) => (
                <Bar
                  key={metric}
                  dataKey={metric}
                  fill={baseColors[metric]}
                  stackId={isStacked ? "stack" : `group-${metric}`}
                  radius={idx === activeMetrics.length - 1 ? 4 : 0}
                  name={metricLabelMap[metric]}
                >
                  <LabelList
                    dataKey={metric}
                    position="inside"
                    angle={isStacked ? 0 : -90}
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
