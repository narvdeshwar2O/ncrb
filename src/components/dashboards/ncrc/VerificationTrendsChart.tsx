
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { verificationTrendData, chartConfig } from './NCRCData';

export const VerificationTrendsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Verification Trends - Monthly Overview</CardTitle>
        <CardDescription>Request volume and processing outcomes</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={verificationTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="totalRequests" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="verified" 
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ fill: '#16a34a' }}
              />
              <Line 
                type="monotone" 
                dataKey="rejected" 
                stroke="#dc2626" 
                strokeWidth={2}
                dot={{ fill: '#dc2626' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
