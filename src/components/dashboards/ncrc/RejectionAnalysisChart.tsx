
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { rejectionReasons, chartConfig } from './NCRCData';

export const RejectionAnalysisChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rejection Analysis</CardTitle>
        <CardDescription>Common reasons for verification rejection</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rejectionReasons}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="reason" angle={-45} textAnchor="end" height={100} />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="#dc2626" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
