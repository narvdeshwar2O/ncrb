import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  LabelList,
} from "recharts";

interface ChartCardProps {
  title: string;
  data: { state: string; value: number }[];
}

function ChartCard({ title, data }: ChartCardProps) {
  const rankedData = [...data].slice(0, 5).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  const EllipsisLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const padding = 4;
    const maxTextWidth = width - padding * 2;

    const text = String(value);
    const capitalizedText =
      text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    let truncated = capitalizedText;

    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.font = "12px sans-serif";
      while (
        ctx.measureText(truncated).width > maxTextWidth &&
        truncated.length > 0
      ) {
        truncated = truncated.slice(0, -1);
      }
      if (truncated !== capitalizedText) truncated += "...";
    }

    return (
      <text
        x={x + padding}
        y={y + height / 2 + 4}
        fill="white"
        fontSize={12}
        textAnchor="start"
      >
        {truncated}
      </text>
    );
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3">
          <p className="font-semibold text-gray-800 capitalize">
            {data.state}:{data.value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm font-semibold">
          Top 5 states : {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ value: { label: title, color: "var(--chart-2)" } }}
        >
          <BarChart
            data={rankedData}
            layout="vertical"
            margin={{ right: 30, left: -10, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} vertical={false} />
            <YAxis
              dataKey="rank"
              type="category"
              tickLine={false}
              axisLine={true}
              tickFormatter={(value) => `#${value}`}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip cursor={false} content={<CustomTooltip />} />
            <Bar
              dataKey="value"
              fill="#2563eb"
              radius={[0, 8, 8, 0]}
              barSize={30}
            >
              {/* Use custom ellipsis label */}
              <LabelList
                dataKey="state"
                position="insideLeft"
                content={<EllipsisLabel />}
                className="capitalize"
              />
              {/* Value on right */}
              <LabelList
                dataKey="value"
                position="right"
                offset={5}
                className="fill-foreground"
                fontSize={10}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default ChartCard;
