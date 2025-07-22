import React, { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Payload } from "recharts/types/component/DefaultLegendContent";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { DEFAULT_COLORS } from "@/constants/defaultColor";

const getColor = (index: number, colors: string[]) =>
  colors[index % colors.length];

interface GroupedBarChartProps {
  chartRef: React.RefObject<HTMLDivElement>;
  title: string;
  data: any[];
  xAxisDataKey: string;
  barKeys: string[];
  colors?: string[];
  chartHeight?: number;
  onExportCSV: () => void;
  onExportExcel: () => void;
  onPrint: () => void;
}

export function GroupedBarChart({
  chartRef,
  title,
  data,
  xAxisDataKey,
  barKeys,
  colors = DEFAULT_COLORS,
  chartHeight = 600,
  onExportCSV,
  onExportExcel,
  onPrint,
}: GroupedBarChartProps) {

  const legendPayload: Payload[] = useMemo(
    () =>
      barKeys.map((key, index) => ({
        value: key,
        type: "circle", 
        id: key,
        color: getColor(index, colors),
      })),
    [barKeys, colors]
  );

  return (
    <Card className="mt-3 w-full" ref={chartRef}>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <h2 className="text-lg font-semibold">{title}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onExportCSV}>
              <Download className="h-4 w-4 mr-1" /> CSV
            </Button>
            <Button variant="outline" size="sm" onClick={onExportExcel}>
              <Download className="h-4 w-4 mr-1" /> Excel
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={chartHeight}>
          <BarChart
            data={data}
            margin={{ top: 40, right: 20, left: 20, bottom:10 }}
          >
            <XAxis dataKey={xAxisDataKey} tickLine={false} />
            <YAxis />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
              contentStyle={{
                background: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
              }}
            />
            <Legend
              verticalAlign="top"
              wrapperStyle={{ top: 10 }}
              payload={legendPayload}
            />
            {barKeys.map((key, index) => (
              <Bar
                key={key}
                dataKey={key}
                fill={getColor(index, colors)}
                name={key}
                radius={[4, 4, 0, 0]}
              >
                <LabelList
                  dataKey={key}
                  angle={-90}
                  position="inside"
                  fill="#fff"
                  fontSize={12}
                  formatter={(value) => (Number(value) > 0 ? value : "")}
                />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
