import React, { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { SlipTableRow, StatusKey } from "../types";

interface SlipComparisonChartProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
  selectedStates: string[];
}

export default function SlipComparisonChart({
  rows,
  statuses,
  selectedStates,
}: SlipComparisonChartProps) {
  const [selectedStatus, setSelectedStatus] = useState<StatusKey>(
    statuses[0] || "Arrested"
  );

  const chartData = useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));
    return selectedStates
      .filter((state) => lookup.has(state))
      .map((state) => ({
        state,
        value: lookup.get(state)?.[selectedStatus] ?? 0,
      }));
  }, [rows, selectedStates, selectedStatus]);

  if (selectedStates.length < 2) {
    return (
      <Card className="w-full">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Select at least 2 states to view comparison.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">State Comparison</h2>
          <Select
            value={selectedStatus}
            onValueChange={(value) => setSelectedStatus(value as StatusKey)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select Status" />
            </SelectTrigger>
            <SelectContent>
              {statuses.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
          >
            <XAxis
              dataKey="state"
              tick={{ fontSize: 12 }}
              interval={0}
              angle={0}
              textAnchor="middle"
            />
            <YAxis />
            
            <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]}>
              <LabelList
                dataKey="value"
                position="inside"
                fill="#fff"
                fontSize={14}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
