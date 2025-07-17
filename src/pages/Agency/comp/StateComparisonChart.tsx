import React, { useState, useMemo } from "react";
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

interface StateComparisonChartProps {
  data: StateData;
  selectedStates: string[];
}

const metrics = ["enrollment", "hit", "nohit"] as const;

export function StateComparisonChart({
  data,
  selectedStates,
}: StateComparisonChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<
    (typeof metrics)[number]
  >("enrollment");

  const chartData = useMemo(() => {
    return selectedStates.map((state) => {
      const stateInfo = data[state];
      return {
        state,
        tp: stateInfo?.tp?.[selectedMetric] ?? 0,
        cp: stateInfo?.cp?.[selectedMetric] ?? 0,
        mesha: stateInfo?.mesha?.[selectedMetric] ?? 0,
      };
    });
  }, [selectedStates, data, selectedMetric]);

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
    <Card className="mt-3 w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">State Comparison</h2>
          <Select
            value={selectedMetric}
            onValueChange={(value) =>
              setSelectedMetric(value as (typeof metrics)[number])
            }
          >
            <SelectTrigger className="w-[180px]">
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
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20 }}>
            <XAxis dataKey="state" />
            <YAxis />
            {/* Tooltip removed to disable hover pop-up */}
            <Legend />
            <Bar dataKey="tp" fill="#2563eb" name="TP" radius={[10,10,0,0]}>
              <LabelList dataKey="tp" position="inside" fill="#fff" fontSize={16} />
            </Bar>
            <Bar dataKey="cp" fill="#16a34a" name="CP" radius={[10,10,0,0]}>
              <LabelList dataKey="cp" position="inside" fill="#fff" fontSize={16} />
            </Bar>
            <Bar dataKey="mesha" fill="#f59e0b" name="MESHA" radius={[10,10,0,0]}>
              <LabelList
                dataKey="mesha"
                position="inside"
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
