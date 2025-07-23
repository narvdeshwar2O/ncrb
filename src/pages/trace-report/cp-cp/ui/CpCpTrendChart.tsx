import { useState } from "react";
import { GitCommitVertical, Download, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
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
import { CpCpDailyData } from "../types";
import { Button } from "@/components/ui/button";
import * as exportService from "@/utils/exportService";

// ✅ Colors (HEX for print safety)
const chartConfig: ChartConfig = {
  hit: { label: "Hit", color: "#3B82F6" }, // Blue
  no_hit: { label: "No-Hit", color: "#22C55E" }, // Green
  total: { label: "Total", color: "#F59E0B" }, // Amber
};

type CpCpStatusKey = "hit" | "no_hit" | "total";

interface CpCpTrendChartProps {
  filteredData: CpCpDailyData[];
  selectedState: string;
}

export default function CpCpTrendChart({
  filteredData,
  selectedState,
}: CpCpTrendChartProps) {
  const [activeLines, setActiveLines] = useState<CpCpStatusKey[]>([
    "hit",
    "no_hit",
    "total",
  ]);

  const toggleLine = (key: CpCpStatusKey) => {
    setActiveLines((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  // Prepare Chart Data
  const chartData = filteredData
    .map((day) => {
      const cpCp = day.data[selectedState]?.cp_cp;
      if (!cpCp) return null;
      const hit = cpCp.hit ?? 0;
      const no_hit = cpCp.no_hit ?? 0;
      const total = hit + no_hit;

      return {
        date: new Date(day.date).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        hit,
        no_hit,
        total,
      };
    })
    .filter(Boolean) as any[];

  // CSV Export
  const handleExportCSV = () => {
    const headers = ["Date", "Hit", "No-Hit", "Total"];
    const rows = chartData.map((d) => [d.date, d.hit, d.no_hit, d.total]);
    exportService.exportToCSV(`${selectedState}-cp-cp-trend.csv`, headers, rows);
  };

  // Print
  const handlePrint = () => {
    if (chartData.length === 0) {
      alert(
        "No data available to print. Please select a valid state and date range."
      );
      return;
    }

    const hideElements = document.querySelectorAll<HTMLElement>(".print-hide");
    hideElements.forEach((el) => (el.style.display = "none"));

    const element = document.getElementById("cpcp-trend-chart");
    exportService.printComponent(
      element as HTMLDivElement,
      `${selectedState} CP-CP Trend Report`
    );

    setTimeout(() => {
      hideElements.forEach((el) => (el.style.display = ""));
    }, 500);
  };

  // Custom Legend
  const renderLegend = () => {
    const keys: CpCpStatusKey[] = ["hit", "no_hit", "total"];
    return (
      <ul
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "16px",
          listStyle: "none",
          padding: "8px 0",
          margin: "0 0 8px 0",
          flexWrap: "wrap",
        }}
      >
        {keys.map((key) => {
          const isActive = activeLines.includes(key);
          return (
            <li
              key={key}
              onClick={() => toggleLine(key)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "4px",
                cursor: "pointer",
                color: isActive ? chartConfig[key].color : "#A0AEC0",
                fontSize: "12px",
              }}
            >
              <span
                style={{
                  width: "12px",
                  height: "12px",
                  borderRadius: "50%",
                  backgroundColor: isActive
                    ? chartConfig[key].color
                    : "#A0AEC0",
                }}
              />
              {chartConfig[key].label}
            </li>
          );
        })}
      </ul>
    );
  };

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader className="py-2">
          <CardTitle className="text-base">No Data Available</CardTitle>
          <CardDescription className="text-xs">
            Select a date range and a state with valid CP-CP data.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card id="cpcp-trend-chart" className="py-2">
      <CardHeader className="py-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedState} - CP-CP Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Hit, No-Hit & Total
            </CardDescription>
          </div>
          <div className="flex gap-2 print-hide">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0 h-[400px]">
        {renderLegend()}
        <ChartContainer config={chartConfig} className="h-full w-full p-2">
          <div className="w-full h-[300px] sm:h-[340px] md:h-[360px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 8, bottom: 4, left: 8 }}
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

                {activeLines.includes("hit") && (
                  <Line
                    dataKey="hit"
                    stroke={chartConfig.hit.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("no_hit") && (
                  <Line
                    dataKey="no_hit"
                    stroke={chartConfig.no_hit.color}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                )}
                {activeLines.includes("total") && (
                  <Line
                    dataKey="total"
                    stroke={chartConfig.total.color}
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
                          fill="#FFFFFF"
                          stroke={chartConfig.total.color}
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
