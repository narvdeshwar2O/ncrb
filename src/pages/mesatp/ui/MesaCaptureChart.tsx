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
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer, Layers3 } from "lucide-react";
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
  const [isStacked, setIsStacked] = useState(true);

  // Remove "Total"
  const crimeTypes = useMemo(
    () => selectedCrimeTypes.filter((type) => type !== "Total"),
    [selectedCrimeTypes]
  );

  // Chart Data
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

  // Chart Config
  const chartConfig = useMemo(() => {
    const config: any = {};
    crimeTypes.forEach((type, idx) => {
      config[type] = {
        label: type,
        color: COLORS[idx % COLORS.length],
      };
    });
    return config;
  }, [crimeTypes]);

  const chartTitle = `Crime Type Trends (${chartData.length} days)`;

  // Export CSV
  const handleExportCSV = () => {
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
  };

  // Print
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

      <CardContent ref={chartRef} className="h-[400px]">
        {crimeTypes.length === 0 ? (
          <div className="h-full flex items-center justify-center text-red-600 font-medium">
            Please select at least one crime type to display the chart.
          </div>
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
                  fill={chartConfig[crimeType]?.color}
                  stackId={isStacked ? "stack" : undefined}
                  radius={idx === crimeTypes.length - 1 ? 4 : 0}
                >
                  <LabelList
                    dataKey={crimeType}
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
        )}
      </CardContent>
    </Card>
  );
}
