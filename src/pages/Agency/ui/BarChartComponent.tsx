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

  // ✅ Filter out "total" once here
  const filteredDataTypes = selectedDataTypes.filter((type) => type !== "total");

  React.useEffect(() => {
    if (chartData.length > 0) {
      console.log("BarChart data keys:", Object.keys(chartData[0]));
    }
  }, [chartData]);

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
              filteredDataTypes.map((type) => {
                const dataKey = `${cat}_${type}`;
                if (chartData.length > 0 && !(dataKey in chartData[0])) {
                  return null; // Defensive: skip bars if key missing
                }
                return (
                  <Bar
                    key={dataKey}
                    dataKey={dataKey}
                    fill={getBarColor(
                      cat,
                      type,
                      activeCategories,
                      filteredDataTypes
                    )}
                    stackId={
                      viewMode === "stacked"
                        ? `${cat}-stack`
                        : `${cat}-${type}-group`
                    }
                    name={`${categoryLabelMap?.[cat] ?? cat.toUpperCase()} ${
                      type.charAt(0).toUpperCase() + type.slice(1)
                    }`}
                  >
                    <LabelList
                      dataKey={dataKey}
                      position="inside"
                      angle={-90}
                      fill="#fff"
                      fontSize={11}
                      formatter={(value) => (Number(value) > 0 ? value : "")}
                    />
                  </Bar>
                );
              })
            )
          : filteredDataTypes.map((type) => (
              <Bar
                key={type}
                dataKey={type}
                fill={getBarColor("agg", type, ["agg"], filteredDataTypes)}
                stackId={viewMode === "stacked" ? "agg-stack" : `group-${type}`}
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
