
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

const riskAssessmentData = [
  { risk: 'Low Risk', count: 275400, percentage: 90.9, color: '#16a34a' },
  { risk: 'Medium Risk', count: 21200, percentage: 7.0, color: '#f59e0b' },
  { risk: 'High Risk', count: 6400, percentage: 2.1, color: '#dc2626' },
];

const chartConfig = {
  count: { label: 'Cases', color: '#2563eb' },
};

export const RiskAssessmentChart = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Distribution</CardTitle>
        <CardDescription>Categorization of verification cases by risk level</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={riskAssessmentData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ risk, percentage }) => `${risk}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {riskAssessmentData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <ChartTooltip content={<ChartTooltipContent />} />
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};
