import { useState } from "react";
import { GitCommitVertical, Download, Printer } from "lucide-react";
import {
  ResponsiveContainer,
  CartesianGrid,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Legend,
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
import { Button } from "@/components/ui/button";
import * as exportService from "@/utils/exportService";

// Chart configuration
const chartConfig: ChartConfig = {
  Arrested: { label: "Arrested", color: "#3B82F6" },
  Convicted: { label: "Convicted", color: "#22C55E" },
  Suspect: { label: "Suspect", color: "#EF4444" },
  Total: { label: "Total", color: "#F59E0B" },
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
    .filter(Boolean) as any[];

  const handleExportCSV = () => {
    const headers = ["Date", "Arrested", "Convicted", "Suspect", "Total"];
    const rows = chartData.map((d) => [
      d.date,
      d.Arrested,
      d.Convicted,
      d.Suspect,
      d.Total,
    ]);
    exportService.exportToCSV(`${selectedState}-trend.csv`, headers, rows);
  };

  const handlePrint = () => {
    if (chartData.length === 0) {
      alert(
        "No data available to print. Please select a valid state and date range."
      );
      return;
    }

    const hideElements = document.querySelectorAll<HTMLElement>(".print-hide");
    hideElements.forEach((el) => (el.style.display = "none"));

    const element = document.getElementById("trend-chart-container");
    exportService.printComponent(
      element as HTMLDivElement,
      `${selectedState} Trend Report`
    );

    setTimeout(() => {
      hideElements.forEach((el) => (el.style.display = ""));
    }, 500);
  };

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
    <Card id="trend-chart-container" className="py-2">
      <CardHeader className="py-3">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-base">
              {selectedState} - Crime Trends
            </CardTitle>
            <CardDescription className="text-xs">
              Arrested, Convicted, Suspect & Total
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

                {/* ✅ Fixed legend that doesn't hide lines */}
                <Legend
                  verticalAlign="top"
                  wrapperStyle={{ top: 0, cursor: "pointer" }}
                  payload={Object.keys(chartConfig).map((key) => ({
                    id: key,
                    value: chartConfig[key as StatusKey].label,
                    type: "line",
                    color: chartConfig[key as StatusKey].color,
                    inactive: !activeLines.includes(key as StatusKey),
                  }))}
                  onClick={(e) => toggleLine(e.id as StatusKey)}
                  formatter={(value, entry) => {
                    const isActive = activeLines.includes(entry?.id as StatusKey);
                    return (
                      <span style={{ opacity: isActive ? 1 : 0.4 }}>
                        {value}
                      </span>
                    );
                  }}
                />

                {/* ✅ Conditionally render lines */}
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
                          fill="#FFFFFF"
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
