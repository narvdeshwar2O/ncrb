
import { useState } from 'react';
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { DashboardFilters } from '@/components/filters/DashboardFilters';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, AlertTriangle, TrendingUp } from 'lucide-react';

const hotspotData = [
  { area: 'Downtown Commercial', incidents: 312, severity: 8.5, population: 45000, x: 312, y: 8.5 },
  { area: 'Industrial Zone East', incidents: 245, severity: 7.2, population: 32000, x: 245, y: 7.2 },
  { area: 'Market District', incidents: 278, severity: 7.8, population: 38000, x: 278, y: 7.8 },
  { area: 'Residential North', incidents: 156, severity: 5.4, population: 65000, x: 156, y: 5.4 },
  { area: 'Transport Hub', incidents: 203, severity: 6.9, population: 28000, x: 203, y: 6.9 },
  { area: 'University Area', incidents: 189, severity: 6.1, population: 42000, x: 189, y: 6.1 },
];

const trendData = [
  { month: 'Jan', hotspots: 142, newHotspots: 8 },
  { month: 'Feb', hotspots: 145, newHotspots: 5 },
  { month: 'Mar', hotspots: 149, newHotspots: 7 },
  { month: 'Apr', hotspots: 152, newHotspots: 4 },
  { month: 'May', hotspots: 154, newHotspots: 3 },
  { month: 'Jun', hotspots: 156, newHotspots: 2 },
];

const crimeTypeData = [
  { type: 'Theft', count: 485, percentage: 31.2 },
  { type: 'Assault', count: 312, percentage: 20.1 },
  { type: 'Vandalism', count: 268, percentage: 17.3 },
  { type: 'Drug Related', count: 234, percentage: 15.1 },
  { type: 'Burglary', count: 189, percentage: 12.2 },
  { type: 'Other', count: 65, percentage: 4.1 },
];

const chartConfig = {
  incidents: { label: 'Incidents', color: '#dc2626' },
  severity: { label: 'Severity', color: '#ea580c' },
  hotspots: { label: 'Total Hotspots', color: '#2563eb' },
  newHotspots: { label: 'New Hotspots', color: '#dc2626' },
};

const CrimeHotspotsDetail = () => {
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  const handleFiltersChange = (filters: any) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // Here you would typically filter your data based on the selected filters
  };

  return (
    <DetailPageLayout
      title="Crime Hotspots Analysis"
      description="Geographic analysis of crime concentration areas with severity assessment and trend monitoring"
      icon={<MapPin className="h-5 w-5 text-red-600" />}
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
            <div className="text-sm font-medium text-muted-foreground mb-2">Active Hotspots</div>
            <div className="text-3xl font-bold text-foreground">156</div>
            <p className="text-sm text-muted-foreground mt-2">
              <TrendingUp className="inline h-3 w-3 text-red-500" />
              +12 new this month
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">High Risk Areas</div>
            <div className="text-3xl font-bold text-foreground">23</div>
            <p className="text-sm text-muted-foreground mt-2">
              <AlertTriangle className="inline h-3 w-3 text-red-500" />
              Severity {'>'}= 8.0
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Total Incidents</div>
            <div className="text-3xl font-bold text-foreground">1,553</div>
            <p className="text-sm text-muted-foreground mt-2">
              In hotspot areas
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">Avg Response Time</div>
            <div className="text-3xl font-bold text-foreground">8.5 min</div>
            <p className="text-sm text-muted-foreground mt-2">
              In hotspot areas
            </p>
          </div>
        </div>

        {/* Hotspot Scatter Plot */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">Hotspot Analysis - Incidents vs Severity</h3>
            <p className="text-muted-foreground">Geographic areas plotted by number of incidents and severity score</p>
          </div>
          <ChartContainer config={chartConfig} className="h-[400px]">
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
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Hotspot Trend */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">Hotspot Development Trend</h3>
              <p className="text-muted-foreground">Monthly tracking of hotspot identification</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hotspots" fill="#2563eb" />
                  <Bar dataKey="newHotspots" fill="#dc2626" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {/* Crime Types in Hotspots */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">Crime Types in Hotspots</h3>
              <p className="text-muted-foreground">Most common crimes in identified hotspot areas</p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Crime Type</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>%</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {crimeTypeData.map((item) => (
                  <TableRow key={item.type}>
                    <TableCell className="font-medium">{item.type}</TableCell>
                    <TableCell>{item.count}</TableCell>
                    <TableCell>{item.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {/* Detailed Hotspot Table */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">Detailed Hotspot Information</h3>
            <p className="text-muted-foreground">Complete breakdown of all identified crime hotspots</p>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Area</TableHead>
                <TableHead>Incidents</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Population</TableHead>
                <TableHead>Crime Rate</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotspotData.map((item) => (
                <TableRow key={item.area}>
                  <TableCell className="font-medium">{item.area}</TableCell>
                  <TableCell>{item.incidents}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.severity >= 8 ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                      item.severity >= 6 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' : 
                      'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    }`}>
                      {item.severity}
                    </span>
                  </TableCell>
                  <TableCell>{item.population.toLocaleString()}</TableCell>
                  <TableCell>{((item.incidents / item.population) * 1000).toFixed(1)}/1000</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default CrimeHotspotsDetail;
