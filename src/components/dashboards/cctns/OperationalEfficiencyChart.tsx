
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

const efficiencyData = [
  { metric: 'Response Time', current: 85, target: 90 },
  { metric: 'Investigation Quality', current: 88, target: 90 },
  { metric: 'Court Success', current: 72, target: 80 },
  { metric: 'Resource Utilization', current: 91, target: 85 },
  { metric: 'Digital Evidence', current: 69, target: 75 },
  { metric: 'Case Documentation', current: 94, target: 95 },
];

const chartConfig = {
  current: { label: 'Current Performance', color: '#2563eb' },
  target: { label: 'Target', color: '#16a34a' },
};

export const OperationalEfficiencyChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Operational Efficiency Analysis</CardTitle>
        <CardDescription>Performance metrics vs targets across key areas</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={efficiencyData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="metric" />
              <PolarRadiusAxis angle={45} domain={[0, 100]} />
              <Radar name="Current" dataKey="current" stroke="#2563eb" fill="#2563eb" fillOpacity={0.3} />
              <Radar name="Target" dataKey="target" stroke="#16a34a" fill="#16a34a" fillOpacity={0.1} />
              <ChartTooltip content={<ChartTooltipContent />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
