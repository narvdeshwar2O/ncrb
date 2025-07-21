import React, { useState, useMemo, useRef } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { StateData } from "./AgencyTable";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { exportToCSV, printHTMLElement } from "@/utils/exportHelpers";

interface StateComparisonChartProps {
  data: StateData;
  selectedStates: string[];
}

const metrics = ["enrollment", "hit", "nohit"] as const;

/** Custom X-axis tick with ellipsis + rotate. */
interface CustomStateTickProps {
  x?: number;
  y?: number;
  payload?: { value: string };
  maxChars?: number;
}
const CustomStateTick = ({
  x = 0,
  y = 0,
  payload,
  maxChars = 10,
}: CustomStateTickProps) => {
  const raw = payload?.value ?? "";
  const truncated = raw.length > maxChars ? `${raw.slice(0, maxChars)}…` : raw;
  return (
    <g transform={`translate(${x},${y})`}>
      <text
        x={0}
        y={0}
        dy={16}
        textAnchor="end"
        fill="#666"
        transform="rotate(-40)"
      >
        <title>{raw}</title>
        {truncated}
      </text>
    </g>
  );
};

export function StateComparisonChart({
  data,
  selectedStates,
}: StateComparisonChartProps) {
  const [selectedMetric, setSelectedMetric] =
    useState<(typeof metrics)[number]>("enrollment");

  const chartWrapRef = useRef<HTMLDivElement>(null);

  // shrink label chars when many states
  const maxLabelChars = selectedStates.length > 10 ? 6 : 10;

  const chartData = useMemo(() => {
    return selectedStates.map((state) => {
      const stateInfo = data[state];
      return {
        state,
        tp: stateInfo?.tp?.[selectedMetric] ?? 0,
        cp: stateInfo?.cp?.[selectedMetric] ?? 0,
        mesa: stateInfo?.mesa?.[selectedMetric] ?? 0,
      };
    });
  }, [selectedStates, data, selectedMetric]);

  // ----- Export CSV -----
  const handleExportCSV = () => {
    // header row: state + TP/CP/MESA for current metric
    const headers = ["State", "TP", "CP", "MESA"];
    const rows = chartData.map((r) => [r.state, r.tp, r.cp, r.mesa]);
    exportToCSV(`state-comparison-${selectedMetric}.csv`, headers, rows);
  };

  // ----- Print -----
  const handlePrint = () => {
    printHTMLElement(chartWrapRef.current, "State Comparison Chart");
  };

  if (selectedStates.length < 2) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-3 w-full" ref={chartWrapRef}>
      <CardHeader>
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <h2 className="text-lg font-semibold">State Comparison</h2>

          <div className="flex items-center gap-2">
            {/* metric selector */}
            <Select
              value={selectedMetric}
              onValueChange={(value) =>
                setSelectedMetric(value as (typeof metrics)[number])
              }
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue placeholder="Select metric" />
              </SelectTrigger>
              <SelectContent>
                {metrics.map((metric) => (
                  <SelectItem key={metric} value={metric}>
                    {metric.charAt(0).toUpperCase() + metric.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Export CSV */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              title="Download CSV"
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </Button>

            {/* Print */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              title="Print Chart"
            >
              <Printer className="h-4 w-4 mr-1" />
              Print
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={700}>
          <BarChart
            data={chartData}
            margin={{ top: 60, right: 30, left: 20, bottom: 10 }}
          >
            <XAxis
              dataKey="state"
              tick={<CustomStateTick maxChars={maxLabelChars} />}
              interval={0}
              height={80}
              tickLine={false}
            />
            <YAxis />
            <Legend
              verticalAlign="top"
              align="center"
              wrapperStyle={{ top: 0 }}
            />
            <Bar dataKey="tp" fill="#2563eb" name="TP" radius={[10, 10, 0, 0]}>
              <LabelList
                dataKey="tp"
                position="center"
                angle={-90}
                fill="#fff"
                fontSize={12}
              />
            </Bar>
            <Bar dataKey="cp" fill="#16a34a" name="CP" radius={[10, 10, 0, 0]}>
              <LabelList
                dataKey="cp"
                position="center"
                angle={-90}
                fill="#fff"
                fontSize={12}
              />
            </Bar>
            <Bar
              dataKey="mesa"
              fill="#f59e0b"
              name="MESA"
              radius={[10, 10, 0, 0]}
            >
              <LabelList
                dataKey="mesa"
                position="center"
                angle={-90}
                fill="#fff"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
