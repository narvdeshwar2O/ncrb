
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { verificationTypes, chartConfig } from './NCRCData';

export const VerificationTypesChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Types Distribution</CardTitle>
        <CardDescription>Breakdown by verification category</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={verificationTypes}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ type, percentage }) => `${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {verificationTypes.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
