
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { stateWiseData, chartConfig } from './CCTNSData';

export const StateWiseChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>State-wise FIR Statistics</CardTitle>
        <CardDescription>FIR count and crime rate per 1000 population</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateWiseData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="state" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="firs" fill="#2563eb" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
