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
  // Assign ranks: 1 → 5
  const rankedData = [...data].slice(0, 5).map((item, index) => ({
    ...item,
    rank: index + 1,
  }));

  // Custom label with ellipsis
  const EllipsisLabel = (props: any) => {
    const { x, y, width, height, value } = props;
    const padding = 4;
    const maxTextWidth = width - padding * 2;

    const text = String(value);
    let truncated = text;

    // Canvas trick to measure text width
    const ctx = document.createElement("canvas").getContext("2d");
    if (ctx) {
      ctx.font = "12px sans-serif";
      while (ctx.measureText(truncated).width > maxTextWidth && truncated.length > 0) {
        truncated = truncated.slice(0, -1);
      }
      if (truncated !== text) truncated += "...";
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center text-sm font-semibold">Top 5 states : {title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ value: { label: title, color: "var(--chart-2)" } }}
        >
          <BarChart data={rankedData} layout="vertical" margin={{ right: 30 }}>
            <CartesianGrid horizontal={false} vertical={false}/>
            <YAxis
              dataKey="rank"
              type="category"
              tickLine={false}
              axisLine={true}
              tickFormatter={(value) => `#${value}`}
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20}>
              {/* Use custom ellipsis label */}
              <LabelList dataKey="state" position="insideLeft" content={<EllipsisLabel />} />
              {/* Value on right */}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
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
