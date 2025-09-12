import React from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  Sector,
} from "recharts";

interface PieChartComponentProps {
  pieData: { name: string; value: number }[];
  pieSliceColors: string[];
}

const darkenStyle = { filter: "brightness(0.85)" };

// Custom label with arrows pointing to sectors
const renderLabelWithArrow = (
  entries: any,
  colors: string[],
  originalData: any[]
) => {
  const { cx, cy, midAngle, innerRadius, outerRadius, name, value, percent } =
    entries;

  // Only show labels for slices larger than 3% to avoid overcrowding
  if (percent < 0.01) {
    return null;
  }

  const RADIAN = Math.PI / 180;

  // Calculate positions
  const innerPoint = {
    x: cx + (outerRadius + 5) * Math.cos(-midAngle * RADIAN),
    y: cy + (outerRadius + 5) * Math.sin(-midAngle * RADIAN),
  };

  const outerPoint = {
    x: cx + (outerRadius + 35) * Math.cos(-midAngle * RADIAN),
    y: cy + (outerRadius + 35) * Math.sin(-midAngle * RADIAN),
  };

  const labelPoint = {
    x: outerPoint.x + (outerPoint.x > cx ? 10 : -10),
    y: outerPoint.y,
  };

  // Get color for this slice
  const originalIndex = originalData.findIndex((item) => item.name === name);
  const sliceColor = colors[originalIndex % colors.length];

  return (
    <g key={`label-group-${name}`}>
      {/* Arrow line from pie edge to label */}
      <polyline
        points={`${innerPoint.x},${innerPoint.y} ${outerPoint.x},${outerPoint.y} ${labelPoint.x},${labelPoint.y}`}
        fill="none"
        stroke={sliceColor}
        strokeWidth={2}
        opacity={0.8}
      />

      {/* Small circle at the connection point */}
      <circle cx={innerPoint.x} cy={innerPoint.y} r={2} fill={sliceColor} />

      {/* Label text */}
      <text
        x={labelPoint.x + (labelPoint.x > cx ? 5 : -5)}
        y={labelPoint.y - 4}
        fill={sliceColor}
        textAnchor={labelPoint.x > cx ? "start" : "end"}
        dominantBaseline="central"
        fontSize={10}
        fontWeight={600}
        style={{ pointerEvents: "none" }}
      >
        {name} : {value}
      </text>
    </g>
  );
};

export function PieChartComponent(props: PieChartComponentProps) {
  const { pieData, pieSliceColors } = props;

  const filteredPieData = pieData.filter(
    (entry) => !entry.name.toLowerCase().includes("total")
  );

  // Sort data by value (largest first) to ensure better label positioning
  const sortedPieData = [...filteredPieData].sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 80, right: 100, bottom: 50, left: 100 }}>
        <Pie
          data={sortedPieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={(entries) =>
            renderLabelWithArrow(entries, pieSliceColors, filteredPieData)
          }
          labelLine={false}
          activeShape={(props) => <Sector {...props} style={darkenStyle} />}
        >
          {sortedPieData.map((entry, idx) => {
            // Find original index for consistent coloring
            const originalIndex = filteredPieData.findIndex(
              (item) => item.name === entry.name
            );
            return (
              <Cell
                key={`cell-${idx}`}
                fill={pieSliceColors[originalIndex % pieSliceColors.length]}
              />
            );
          })}
        </Pie>

        <Legend
          verticalAlign="top"
          height={60}
          wrapperStyle={{
            top: 0,
            color: "#222",
            fontWeight: 600,
            paddingBottom: "20px",
          }}
          formatter={(value, entry) => (
            <span
              style={{
                color: entry.color,
                fontWeight: 600,
                fontSize: "12px",
              }}
            >
              {value}
            </span>
          )}
          iconType="circle"
        />

        <Tooltip
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
            color: "#222",
            fontWeight: 600,
            borderRadius: "6px",
          }}
          formatter={(value: any, name: any, props: any) => [
            <span style={{ fontWeight: 600, color: props.color }}>
              {value}
            </span>,
            <span style={{ fontWeight: 600, color: props.color }}>{name}</span>,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
