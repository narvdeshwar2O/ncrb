
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const hotspotData = [
  { area: 'Downtown', incidents: 245, severity: 8.2, x: 245, y: 8.2 },
  { area: 'Industrial Zone', incidents: 189, severity: 6.8, x: 189, y: 6.8 },
  { area: 'Market District', incidents: 312, severity: 7.5, x: 312, y: 7.5 },
  { area: 'Residential North', incidents: 156, severity: 5.4, x: 156, y: 5.4 },
  { area: 'Commercial Hub', incidents: 278, severity: 7.1, x: 278, y: 7.1 },
  { area: 'Transport Terminal', incidents: 203, severity: 6.9, x: 203, y: 6.9 },
];

const chartConfig = {
  incidents: { label: 'Incidents', color: '#dc2626' },
  severity: { label: 'Severity Score', color: '#ea580c' },
};

export const CrimeHotspotsChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Crime Hotspot Analysis</CardTitle>
        <CardDescription>Geographic distribution of crime incidents vs severity</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart data={hotspotData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Incidents" />
              <YAxis dataKey="y" name="Severity" />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value, name, props) => [
                  name === 'x' ? `${value} incidents` : `${value} severity`,
                  props.payload.area
                ]}
              />
              <Scatter dataKey="y" fill="#dc2626" />
            </ScatterChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
