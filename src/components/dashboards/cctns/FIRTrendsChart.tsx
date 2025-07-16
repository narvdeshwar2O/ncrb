
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { AreaChart, Area, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { firTrendData, chartConfig } from './CCTNSData';

export const FIRTrendsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>FIR Trends - Monthly Overview</CardTitle>
        <CardDescription>Total, Solved, and Pending FIRs over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={firTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey="totalFIRs" 
                stackId="1"
                stroke="#2563eb" 
                fill="#2563eb" 
                fillOpacity={0.3}
              />
              <Area 
                type="monotone" 
                dataKey="solved" 
                stackId="2"
                stroke="#16a34a" 
                fill="#16a34a" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
