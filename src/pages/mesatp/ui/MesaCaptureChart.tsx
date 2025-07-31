import { useMemo, useRef, useState } from "react";
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
import { MesaDailyData, MesaStatusKey } from "../types";

interface MesaCaptureChartProps {
  filteredData: MesaDailyData[];
  selectedCrimeTypes: MesaStatusKey[];
}

const COLORS = [
  "#1E90FF", // DodgerBlue
  "#32CD32", // LimeGreen
  "#FFA500", // Orange
  "#FF4500", // OrangeRed
  "#8A2BE2", // BlueViolet
  "#20B2AA", // LightSeaGreen
  "#DC143C", // Crimson
  "#708090", // SlateGray
];

export default function MesaCaptureChart({
  filteredData,
  selectedCrimeTypes,
}: MesaCaptureChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const [chartType, setChartType] = useState<"stacked" | "grouped" | "pie">("stacked");
  const crimeTypes = useMemo(
    () => selectedCrimeTypes.filter((type) => type !== "Total"),
    [selectedCrimeTypes]
  );

  // For bar chart
  const chartData = useMemo(() => {
    return filteredData
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((day) => {
        const row: Record<string, any> = {
          label: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
        };
        for (const crimeType of crimeTypes) {
          let total = 0;
          for (const stateData of Object.values(day.data)) {
            total += stateData[crimeType] ?? 0;
          }
          row[crimeType] = total;
        }
        return row;
      });
  }, [filteredData, crimeTypes]);

  // For pie chart (aggregate)
  const pieData = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const crimeType of crimeTypes) {
      totals[crimeType] = 0;
    }
    filteredData.forEach((day) => {
      for (const crimeType of crimeTypes) {
        for (const stateData of Object.values(day.data)) {
          totals[crimeType] += stateData[crimeType] ?? 0;
        }
      }
    });
    return crimeTypes.map((type, idx) => ({
      name: type,
      value: totals[type] ?? 0,
      color: COLORS[idx % COLORS.length],
    }));
  }, [filteredData, crimeTypes]);

  const chartTitle = `Crime Type Trends (${chartData.length} days)`;

  const handleExportCSV = () => {
    if (chartType === "pie") {
      const headers = ["Crime Type", "Total"];
      const rows = pieData.map((row) => [row.name, row.value]);
      exportService.exportToCSV(`${chartTitle.replace(/\s+/g, "_")}_Pie.csv`, headers, rows);
    } else {
      const headers = ["Date", ...crimeTypes];
      const rows = chartData.map((item) => [
        item.label,
        ...crimeTypes.map((c) => item[c] ?? 0),
      ]);
      exportService.exportToCSV(
        `${chartTitle.replace(/\s+/g, "_")}.csv`,
        headers,
        rows
      );
    }
  };

  const handlePrint = () => {
    const actionButtons = chartRef.current?.querySelectorAll(".print-hide");
    actionButtons?.forEach((btn) => btn.setAttribute("style", "display:none"));
    exportService.printComponent(chartRef.current, chartTitle);
    setTimeout(() => {
      actionButtons?.forEach((btn) => btn.removeAttribute("style"));
    }, 500);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="text-base font-semibold">{chartTitle}</h3>
          <div className="flex gap-2">
            <Select value={chartType} onValueChange={val => setChartType(val as any)}>
              <SelectTrigger className="w-[110px] print-hide">
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

      <CardContent ref={chartRef} className="h-[400px]">
        {crimeTypes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-red-600 font-medium">
            Please select at least one crime type to display the chart.
          </div>
        ) : chartType === "pie" ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={120}
                label={({ name, value }) => (value > 0 ? `${name}: ${value}` : "")}
              >
                {pieData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.color} />
                ))}
              </Pie>
              <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
              <Tooltip contentStyle={{
                    background: "bg-card",
                    border: "1px solid white",
                    fontWeight: "400",
                    borderRadius: "10px",
                  }}/>
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 40, right: 20, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="label"
                tickMargin={10}
                angle={chartData.length > 10 ? -45 : 0}
                textAnchor={chartData.length > 10 ? "end" : "middle"}
                height={chartData.length > 10 ? 80 : 40}
              />
              <YAxis />
              <Tooltip
                cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
                contentStyle={{
                  background: "hsl(var(--background))",
                  border: "1px solid hsl(var(--border))",
                }}
              />
              <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />

              {crimeTypes.map((crimeType, idx) => (
                <Bar
                  key={crimeType}
                  dataKey={crimeType}
                  fill={COLORS[idx % COLORS.length]}
                  stackId={chartType === "stacked" ? "stack" : undefined}
                  radius={idx === crimeTypes.length - 1 ? 4 : 0}
                >
                  <LabelList
                    dataKey={crimeType}
                    position="inside"
                    angle={chartType === "stacked" ? 0 : -90}
                    fill="#fff"
                    fontSize={11}
                    formatter={val => (Number(val) > 0 ? val : "")}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
