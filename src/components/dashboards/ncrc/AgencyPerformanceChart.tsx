
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { agencyWiseData, chartConfig } from './NCRCData';

export const AgencyPerformanceChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agency Performance</CardTitle>
        <CardDescription>Success rate by law enforcement agency</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agencyWiseData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[80, 100]} />
              <YAxis dataKey="agency" type="category" width={120} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="success" fill="#16a34a" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
