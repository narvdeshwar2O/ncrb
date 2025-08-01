import React from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LabelList,
} from "recharts";

interface BarChartComponentProps {
  chartData: any[];
  activeCategories: string[];
  selectedDataTypes: string[];
  categoryLabelMap?: Record<string, string>;
  viewMode: "stacked" | "grouped";
  getBarColor: (
    cat: string,
    type: string,
    catList: string[],
    typeList: string[]
  ) => string;
  showDailyBarChart: boolean;
}

export function BarChartComponent(props: BarChartComponentProps) {
  const {
    chartData,
    activeCategories,
    selectedDataTypes,
    categoryLabelMap,
    viewMode,
    getBarColor,
    showDailyBarChart,
  } = props;

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={chartData}
        margin={{ top: 40, right: 20, left: 20, bottom: 10 }}
      >
        <CartesianGrid vertical={false} />
        <XAxis dataKey="label" tickMargin={10} />
        <YAxis tickMargin={8} />
        <Tooltip
          cursor={{ fill: "hsl(var(--muted) / 0.5)" }}
          contentStyle={{
            background: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Legend verticalAlign="top" wrapperStyle={{ top: 0 }} />
        {showDailyBarChart
          ? activeCategories.flatMap((cat) =>
              selectedDataTypes.map((type, idx) => (
                <Bar
                  key={`${cat}_${type}`}
                  dataKey={`${cat}_${type}`}
                  fill={getBarColor(
                    cat,
                    type,
                    activeCategories,
                    selectedDataTypes
                  )}
                  stackId={
                    viewMode === "stacked"
                      ? `${cat}-stack`
                      : `${cat}-${type}-group`
                  }
                //   radius={idx === selectedDataTypes.length - 1 ? 2 : 0}
                  name={`${
                    categoryLabelMap?.[cat] ?? cat.toUpperCase()
                  } ${type.charAt(0).toUpperCase() + type.slice(1)}`}
                >
                  <LabelList
                    dataKey={`${cat}_${type}`}
                    position="inside"
                    angle={-90}
                    fill="#fff"
                    fontSize={11}
                    formatter={(value) => (Number(value) > 0 ? value : "")}
                  />
                </Bar>
              ))
            )
          : selectedDataTypes.map((type, idx) => (
              <Bar
                key={type}
                dataKey={type}
                fill={getBarColor(
                  "agg",
                  type,
                  ["agg"],
                  selectedDataTypes
                )}
                stackId={
                  viewMode === "stacked"
                    ? "agg-stack"
                    : `group-${type}`
                }
                name={type.charAt(0).toUpperCase() + type.slice(1)}
              >
                <LabelList
                  dataKey={type}
                  position="inside"
                  angle={-90}
                  fill="#fff"
                  fontSize={11}
                  formatter={(value) => (Number(value) > 0 ? value : "")}
                />
              </Bar>
            ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
