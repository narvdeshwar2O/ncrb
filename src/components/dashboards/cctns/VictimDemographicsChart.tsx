
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const demographicsData = [
  { category: '18-25', male: 1240, female: 980, total: 2220 },
  { category: '26-35', male: 1560, female: 1320, total: 2880 },
  { category: '36-45', male: 1180, female: 1050, total: 2230 },
  { category: '46-55', male: 890, female: 780, total: 1670 },
  { category: '56+', male: 540, female: 490, total: 1030 },
];

const chartConfig = {
  male: { label: 'Male', color: '#3b82f6' },
  female: { label: 'Female', color: '#ec4899' },
};

export const VictimDemographicsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Victim Demographics Analysis</CardTitle>
        <CardDescription>Age and gender distribution of crime victims</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demographicsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="male" fill="#3b82f6" />
              <Bar dataKey="female" fill="#ec4899" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
