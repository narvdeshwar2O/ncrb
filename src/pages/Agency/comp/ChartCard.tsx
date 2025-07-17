import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, LabelList } from "recharts";

interface ChartCardProps {
  title: string;
  data: { state: string; value: number }[];
}

function ChartCard({ title, data }: ChartCardProps) {
  // Assign ranks: 1 → 5
  const rankedData = [...data]
    .slice(0, 5)
    .map((item, index) => ({
      ...item,
      rank: index + 1, // Rank starts from 1
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{ value: { label: title, color: "var(--chart-2)" } }}
        >
          <BarChart data={rankedData} layout="vertical" margin={{ right: 40 }}>
            <CartesianGrid horizontal={false} />
            {/* Show ranks on Y-axis */}
            <YAxis
              dataKey="rank"
              type="category"
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `#${value}`} // Show as #1, #2...
            />
            <XAxis dataKey="value" type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="line" />}
            />
            <Bar dataKey="value" fill="#2563eb" radius={[0, 8, 8, 0]} barSize={20}>
              {/* Show state inside bar */}
              <LabelList
                dataKey="state"
                position="insideLeft"
                offset={8}
                className="fill-white"
                fontSize={12}
              />
              {/* Show value on right */}
              <LabelList
                dataKey="value"
                position="right"
                offset={8}
                className="fill-foreground"
                fontSize={12}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default ChartCard;
