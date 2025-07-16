
import { useState } from 'react';
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { DashboardFilters } from '@/components/filters/DashboardFilters';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, Target } from 'lucide-react';

const resolutionTrendData = [
  { month: 'Jan', rate: 62.1, target: 65 },
  { month: 'Feb', rate: 63.5, target: 65 },
  { month: 'Mar', rate: 64.2, target: 65 },
  { month: 'Apr', rate: 64.8, target: 65 },
  { month: 'May', rate: 65.1, target: 65 },
  { month: 'Jun', rate: 65.4, target: 65 },
];

const categoryResolutionData = [
  { category: 'Property Crime', rate: 72.5, color: '#2563eb' },
  { category: 'Violent Crime', rate: 68.2, color: '#16a34a' },
  { category: 'Cyber Crime', rate: 45.8, color: '#dc2626' },
  { category: 'Economic Crime', rate: 78.4, color: '#f59e0b' },
  { category: 'Drug Related', rate: 82.1, color: '#8b5cf6' },
];

const timeFrameData = [
  { timeFrame: '0-30 days', count: 18500, percentage: 36.2 },
  { timeFrame: '31-90 days', count: 12800, percentage: 25.1 },
  { timeFrame: '91-180 days', count: 8200, percentage: 16.1 },
  { timeFrame: '181-365 days', count: 6100, percentage: 12.0 },
  { timeFrame: '1+ years', count: 5400, percentage: 10.6 },
];

const chartConfig = {
  rate: { label: 'Resolution Rate', color: '#2563eb' },
  target: { label: 'Target', color: '#16a34a' },
};

const ResolutionRateDetail = () => {
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  const handleFiltersChange = (filters: any) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // Here you would typically filter your data based on the selected filters
  };

  return (
    <DetailPageLayout
      title="Resolution Rate Analysis"
      description="Detailed analysis of case resolution rates across different categories and timeframes"
      icon={<Target className="h-5 w-5 text-green-600" />}
    >
      <div className="space-y-8">
        {/* Filters Section */}
        <DashboardFilters 
          onFiltersChange={handleFiltersChange} 
          showCrimeTypeFilter={true}
        />

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Current Rate</div>
            <div className="text-3xl font-bold text-foreground">65.4%</div>
            <p className="text-sm text-muted-foreground mt-2">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +2.1% from last month
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Target</div>
            <div className="text-3xl font-bold text-foreground">65.0%</div>
            <p className="text-sm text-muted-foreground mt-2">
              Target achieved ✓
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Cases Resolved</div>
            <div className="text-3xl font-bold text-foreground">51,086</div>
            <p className="text-sm text-muted-foreground mt-2">
              This year
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Avg Time</div>
            <div className="text-3xl font-bold text-foreground">45 days</div>
            <p className="text-sm text-muted-foreground mt-2">
              -8 days improvement
            </p>
          </div>
        </div>

        {/* Resolution Trend */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">Resolution Rate Trend</h3>
            <p className="text-muted-foreground">Monthly resolution rate vs target over the last 6 months</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={resolutionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[60, 70]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={3} />
                <Line type="monotone" dataKey="target" stroke="#16a34a" strokeWidth={2} strokeDasharray="5 5" />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Category-wise Resolution */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">Resolution by Crime Category</h3>
              <p className="text-muted-foreground">Success rates across different crime types</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryResolutionData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="rate"
                    label={({ category, rate }) => `${category}: ${rate}%`}
                  >
                    {categoryResolutionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Resolution Timeframe */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">Resolution Timeframe</h3>
              <p className="text-muted-foreground">Distribution of cases by resolution time</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Time Frame</TableHead>
                  <TableHead>Cases</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {timeFrameData.map((item) => (
                  <TableRow key={item.timeFrame}>
                    <TableCell className="font-medium">{item.timeFrame}</TableCell>
                    <TableCell>{item.count.toLocaleString()}</TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default ResolutionRateDetail;
