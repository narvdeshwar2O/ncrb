import React, { useState } from "react";
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

const RADIAN = Math.PI / 180;

export function PieChartComponent({
  pieData,
  pieSliceColors,
}: PieChartComponentProps) {
  // Filter out 'total'
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const filteredPieData = pieData.filter(
    (entry) => !entry.name.toLowerCase().includes("total")
  );

  // Sort data by value
  const sortedPieData = [...filteredPieData].sort((a, b) => b.value - a.value);

  // Custom label renderer
  const renderLabelWithArrow = (props: any) => {
    const { cx, cy, midAngle, outerRadius, name, value } = props;

    // Position calculations
    const sideMultiplier = midAngle > 90 && midAngle < 270 ? -1 : 1; // Left or right
    const outerX = cx + (outerRadius + 25) * Math.cos(-midAngle * RADIAN);
    const outerY = cy + (outerRadius + 25) * Math.sin(-midAngle * RADIAN);
    const labelX = outerX + sideMultiplier * 10;
    let labelY = outerY;

    // Prevent overlapping by adjusting Y (simple approach)
    const index = sortedPieData.findIndex((item) => item.name === name);
    labelY += index * 12 * (sideMultiplier === -1 ? 1 : -1); // adjust spacing

    // Find slice color
    const sliceColor = pieSliceColors[index % pieSliceColors.length];

    return (
      <g
        key={`label-group-${name}`}
        onMouseEnter={() => setActiveIndex(index)}
        onMouseLeave={() => setActiveIndex(null)}
        style={{ cursor: "pointer" }}
      >
        <polyline
          points={`${cx + outerRadius * Math.cos(-midAngle * RADIAN)},${
            cy + outerRadius * Math.sin(-midAngle * RADIAN)
          } ${outerX},${outerY} ${labelX},${labelY}`}
          fill="none"
          stroke={sliceColor}
          strokeWidth={2}
          opacity={0.8}
        />
        <circle
          cx={cx + outerRadius * Math.cos(-midAngle * RADIAN)}
          cy={cy + outerRadius * Math.sin(-midAngle * RADIAN)}
          r={2}
          fill={sliceColor}
        />
        <text
          x={labelX + (sideMultiplier === 1 ? 5 : -5)}
          y={labelY}
          fill={sliceColor}
          textAnchor={sideMultiplier === 1 ? "start" : "end"}
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

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart margin={{ top: 80, right: 100, bottom: 100, left: 100 }}>
        <Pie
          data={sortedPieData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={150}
          label={(entry) => renderLabelWithArrow(entry)}
          labelLine={false}
        >
          {sortedPieData.map((entry, idx) => (
            <Cell
              key={`cell-${idx}`}
              fill={pieSliceColors[idx % pieSliceColors.length]}
            />
          ))}
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
              style={{ color: entry.color, fontWeight: 600, fontSize: "12px" }}
            >
              {value}
            </span>
          )}
          iconType="circle"
        />

        <Tooltip
          contentStyle={{
            background: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "6px",
            padding: "6px 10px",
            color: "hsl(var(--popover-foreground))",
            fontSize: "12px",
            fontWeight: "500",
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          }}
          wrapperStyle={{
            outline: "none",
            zIndex: 9999,
          }}
          formatter={(value: any, name: any, props: any) => [
            <span style={{ fontWeight: 600, color: props.color }}>
              {value}
            </span>,
            <span
              style={{
                fontWeight: 600,
                color: "hsl(var(--popover-foreground))",
              }}
            >
              {name}
            </span>,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
