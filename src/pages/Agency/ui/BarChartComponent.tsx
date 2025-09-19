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

function darkenColor(hex: string, amount = 20) {
  if (!hex) return hex;
  const col = hex.replace("#", "");
  const num = parseInt(col, 16);
  let r = (num >> 16) - amount;
  let g = ((num >> 8) & 0x00ff) - amount;
  let b = (num & 0x0000ff) - amount;
  r = r < 0 ? 0 : r;
  g = g < 0 ? 0 : g;
  b = b < 0 ? 0 : b;
  return `rgb(${r},${g},${b})`;
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

  const filteredDataTypes = selectedDataTypes.filter(
    (type) => type !== "total"
  );

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
            fontWeight:"600"
          }}
        />
        <Legend
          verticalAlign="top"
          wrapperStyle={{
            top: 0,
            color: "#222",
            fontWeight: 600,
          }}
        />

        {showDailyBarChart
          ? activeCategories.flatMap((cat) =>
              filteredDataTypes.map((type) => {
                const dataKey = `${cat}_${type}`;
                if (chartData.length > 0 && !(dataKey in chartData[0])) {
                  return null;
                }
                const baseColor = getBarColor(
                  cat,
                  type,
                  activeCategories,
                  filteredDataTypes
                );
                return (
                  <Bar
                    key={dataKey}
                    dataKey={dataKey}
                    fill={baseColor}
                    activeBar={{
                      style: {
                        fill: baseColor,
                        filter: "brightness(0.85)",
                      },
                    }}
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
          : filteredDataTypes.map((type) => {
              const baseColor = getBarColor(
                "agg",
                type,
                ["agg"],
                filteredDataTypes
              );
              return (
                <Bar
                  key={type}
                  dataKey={type}
                  fill={baseColor}
                  activeBar={{
                    style: { fill: darkenColor(baseColor) },
                  }}
                  stackId={
                    viewMode === "stacked" ? "agg-stack" : `group-${type}`
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
              );
            })}
      </BarChart>
    </ResponsiveContainer>
  );
}
