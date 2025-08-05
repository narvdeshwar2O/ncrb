import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";

interface PieChartComponentProps {
  pieData: { name: string; value: number }[];
  pieSliceColors: string[];
}

export function PieChartComponent(props: PieChartComponentProps) {
  const { pieData, pieSliceColors } = props;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={pieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) => `${name}: ${value}`}
        >
          {pieData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={pieSliceColors[idx % pieSliceColors.length]}
            />
          ))}
        </Pie>
        <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
