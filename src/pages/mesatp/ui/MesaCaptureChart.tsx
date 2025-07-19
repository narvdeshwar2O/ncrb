import { Bar, BarChart, CartesianGrid, Legend, XAxis, YAxis } from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { MesaDailyData, MesaStatusKey } from "../types";
import { useMemo } from "react";

interface SlipChartProps {
  filteredData: MesaDailyData[];
  selectedCrimeTypes: MesaStatusKey[];
}

const COLORS = [
  "#1E90FF",
  "#32CD32",
  "#FFA500",
  "#FF4500",
  "#8A2BE2",
  "#20B2AA",
  "#DC143C",
  "#708090",
];

export default function MesaCaptureChart({
  filteredData,
  selectedCrimeTypes,
}: SlipChartProps) {

  const crimeTypes = useMemo(
    () => selectedCrimeTypes.filter((type) => type !== "Total"),
    [selectedCrimeTypes]
  );

  // ✅ Prepare Chart Data
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

  // ✅ Dynamic chart config
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

  return (
    <Card className="w-full">
      <CardHeader>
        <h3 className="text-base font-semibold">Crime Type Trends</h3>
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
            {crimeTypes.map((crimeType) => (
              <Bar
                key={crimeType}
                dataKey={crimeType}
                fill={chartConfig[crimeType]?.color}
                stackId="a"
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
}
