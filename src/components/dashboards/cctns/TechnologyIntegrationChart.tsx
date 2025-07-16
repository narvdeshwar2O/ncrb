
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const technologyData = [
  { month: 'Jan', cctv: 65, mobile: 72, cyber: 58, forensic: 81 },
  { month: 'Feb', cctv: 68, mobile: 75, cyber: 62, forensic: 83 },
  { month: 'Mar', cctv: 71, mobile: 78, cyber: 65, forensic: 85 },
  { month: 'Apr', cctv: 74, mobile: 80, cyber: 68, forensic: 87 },
  { month: 'May', cctv: 77, mobile: 82, cyber: 71, forensic: 89 },
  { month: 'Jun', cctv: 80, mobile: 85, cyber: 74, forensic: 91 },
];

const chartConfig = {
  cctv: { label: 'CCTV Evidence', color: '#8b5cf6' },
  mobile: { label: 'Mobile Data', color: '#06b6d4' },
  cyber: { label: 'Cyber Evidence', color: '#f59e0b' },
  forensic: { label: 'Forensic Analysis', color: '#10b981' },
};

export const TechnologyIntegrationChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Technology Integration Trends</CardTitle>
        <CardDescription>Adoption and usage of technology in investigations</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={technologyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="cctv" stroke="#8b5cf6" strokeWidth={2} />
              <Line type="monotone" dataKey="mobile" stroke="#06b6d4" strokeWidth={2} />
              <Line type="monotone" dataKey="cyber" stroke="#f59e0b" strokeWidth={2} />
              <Line type="monotone" dataKey="forensic" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
