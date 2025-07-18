// components/slip-capture/ui/SlipComparisonChart.tsx
import React, { useMemo } from "react";
import { SlipTableRow, StatusKey } from "../types";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LabelList,
} from "recharts";

interface SlipComparisonChartProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
  selectedStates: string[];
}

const SlipComparisonChart: React.FC<SlipComparisonChartProps> = ({
  rows,
  statuses,
  selectedStates,
}) => {
  const data = useMemo(() => {
    const lookup = new Map(rows.map((r) => [r.state, r]));
    const used = selectedStates.length > 0 ? selectedStates : rows.map((r) => r.state);
    return used
      .filter((s) => lookup.has(s))
      .map((s) => lookup.get(s)!)
      .map((r) => ({ ...r, name: r.state }));
  }, [rows, selectedStates]);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={data}
        margin={{ top: 16, right: 16, left: 0, bottom: 16 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip formatter={(v: any) => v.toLocaleString?.() ?? v} />
        <Legend />
        {statuses.map((s) => (
          <Bar key={s} dataKey={s} stackId="a" fill="#3b82f6">
            <LabelList dataKey={s} position="top" formatter={(v: any) => (v > 0 ? v : "")} />
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default SlipComparisonChart;
