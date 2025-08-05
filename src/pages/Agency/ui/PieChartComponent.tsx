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

  const filteredPieData = pieData.filter(
    (entry) => !entry.name.toLowerCase().includes("total")
  );

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={filteredPieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={100}
          label={({ name, value }) => `${name}: ${value}`}
        >
          {filteredPieData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={pieSliceColors[idx % pieSliceColors.length]}
            />
          ))}
        </Pie>
        <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
