
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts';

const qualityTrendData = [
  { month: 'Jan 2024', dataAccuracy: 95.2, sourceReliability: 8.3, crossReference: 86.8, fraudDetection: 10.2 },
  { month: 'Feb 2024', dataAccuracy: 95.8, sourceReliability: 8.4, crossReference: 87.4, fraudDetection: 10.8 },
  { month: 'Mar 2024', dataAccuracy: 96.1, sourceReliability: 8.5, crossReference: 88.1, fraudDetection: 11.4 },
  { month: 'Apr 2024', dataAccuracy: 96.3, sourceReliability: 8.6, crossReference: 88.7, fraudDetection: 11.9 },
  { month: 'May 2024', dataAccuracy: 96.5, sourceReliability: 8.7, crossReference: 89.2, fraudDetection: 12.3 },
  { month: 'Jun 2024', dataAccuracy: 96.8, sourceReliability: 8.7, crossReference: 89.4, fraudDetection: 12.6 },
];

const chartConfig = {
  dataAccuracy: { label: 'Data Accuracy (%)', color: '#2563eb' },
  crossReference: { label: 'Cross-Reference Success (%)', color: '#16a34a' },
  fraudDetection: { label: 'Fraud Detection (%)', color: '#dc2626' },
};

export const QualityMetricsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quality Metrics Trends</CardTitle>
        <CardDescription>Monthly performance trends for key quality indicators</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={qualityTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="dataAccuracy" 
                stroke="#2563eb" 
                strokeWidth={2}
                dot={{ fill: '#2563eb' }}
              />
              <Line 
                type="monotone" 
                dataKey="crossReference" 
                stroke="#16a34a" 
                strokeWidth={2}
                dot={{ fill: '#16a34a' }}
              />
              <Line 
                type="monotone" 
                dataKey="fraudDetection" 
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
