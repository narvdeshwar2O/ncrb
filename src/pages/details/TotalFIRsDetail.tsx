import { useState } from "react";
import { DetailPageLayout } from "@/components/layouts/DetailPageLayout";
import { DashboardFilters } from "@/components/filters/DashboardFilters";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, TrendingUp, TrendingDown } from "lucide-react";
import { data } from "../../components/filters/data/data";
import { isWithinInterval, parseISO } from "date-fns";
const monthlyData = [
  { month: "Jan", total: 6850, solved: 4200, pending: 2650 },
  { month: "Feb", total: 7100, solved: 4500, pending: 2600 },
  { month: "Mar", total: 7300, solved: 4800, pending: 2500 },
  { month: "Apr", total: 7500, solved: 5100, pending: 2400 },
  { month: "May", total: 7800, solved: 5300, pending: 2500 },
  { month: "Jun", total: 8100, solved: 5500, pending: 2600 },
];

const stateWiseData = [
  { state: "Maharashtra", firs: 12500, rate: 8.2 },
  { state: "Uttar Pradesh", firs: 11800, rate: 7.9 },
  { state: "Tamil Nadu", firs: 9200, rate: 6.8 },
  { state: "Karnataka", firs: 8500, rate: 6.1 },
  { state: "Gujarat", firs: 7800, rate: 5.9 },
];

const categoryData = [
  { category: "Property Crime", count: 28500, percentage: 36.5 },
  { category: "Violent Crime", count: 18200, percentage: 23.3 },
  { category: "Cyber Crime", count: 12800, percentage: 16.4 },
  { category: "Economic Crime", count: 10600, percentage: 13.6 },
  { category: "Drug Related", count: 8000, percentage: 10.2 },
];

const chartConfig = {
  total: { label: "Total FIRs", color: "#2563eb" },
  solved: { label: "Solved", color: "#16a34a" },
  pending: { label: "Pending", color: "#dc2626" },
};

const TotalFIRsDetail = () => {
  const [appliedFilters, setAppliedFilters] = useState<any>(null);
  const [filteredFIRs, setFilteredFIRs] = useState(data.firData);

  const handleFiltersChange = (filters: any) => {
    setAppliedFilters(filters);
    console.log("Applied filters:", filters);
    // Here you would typically filter your data based on the selected filters
    const filtered = data.firData.filter((fir) => {
      const matchesDate =
        !filters.dateRange.from ||
        !filters.dateRange.to ||
        isWithinInterval(parseISO(fir.date), {
          start: filters.dateRange.from,
          end: filters.dateRange.to,
        });

      const matchesState =
        filters.state === "All States" || fir.state === filters.state;

      const matchesDistrict =
        filters.district === "All Districts" ||
        fir.district === filters.district;

      const matchesCrimeType =
        filters.crimeType === "All Crime Types" ||
        fir.crimeType === filters.crimeType;

      return matchesDate && matchesState && matchesDistrict && matchesCrimeType;
    });

    setFilteredFIRs(filtered);
  };

  return (
    <DetailPageLayout
      title="Total FIRs Analysis"
      description="Comprehensive analysis of First Information Reports including trends, distribution, and detailed breakdowns"
      icon={<FileText className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        {/* Filters Section */}
        <DashboardFilters
          onFiltersChange={handleFiltersChange}
          showCrimeTypeFilter={true}
        />
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Filtered FIRs
            </h3>
            <p className="text-muted-foreground">Based on applied filters</p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>State</TableHead>
                <TableHead>District</TableHead>
                <TableHead>Crime Type</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFIRs.map((fir) => (
                <TableRow key={fir.id}>
                  <TableCell>{fir.firNumber}</TableCell>
                  <TableCell>{fir.date}</TableCell>
                  <TableCell>{fir.state}</TableCell>
                  <TableCell>{fir.district}</TableCell>
                  <TableCell>{fir.crimeType}</TableCell>
                  <TableCell>{fir.status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Current Month
            </div>
            <div className="text-3xl font-bold text-foreground">8,100</div>
            <p className="text-sm text-muted-foreground mt-2">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +3.8% from last month
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Year to Date
            </div>
            <div className="text-3xl font-bold text-foreground">44,650</div>
            <p className="text-sm text-muted-foreground mt-2">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              +5.2% vs last year
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Daily Average
            </div>
            <div className="text-3xl font-bold text-foreground">259</div>
            <p className="text-sm text-muted-foreground mt-2">
              <TrendingUp className="inline h-3 w-3 text-green-500" />
              Based on current month
            </p>
          </div>
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="text-sm font-medium text-muted-foreground mb-2">
              Peak Day
            </div>
            <div className="text-3xl font-bold text-foreground">385</div>
            <p className="text-sm text-muted-foreground mt-2">
              Highest single day count
            </p>
          </div>
        </div>

        {/* Monthly Trend Chart */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
          <div className="mb-6">
            <h3 className="text-xl font-semibold text-foreground">
              Monthly FIR Trends
            </h3>
            <p className="text-muted-foreground">
              Total, solved, and pending FIRs over the last 6 months
            </p>
          </div>
          <ChartContainer config={chartConfig} className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="total"
                  stackId="1"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="solved"
                  stackId="2"
                  stroke="#16a34a"
                  fill="#16a34a"
                  fillOpacity={0.3}
                />
                <Area
                  type="monotone"
                  dataKey="pending"
                  stackId="3"
                  stroke="#dc2626"
                  fill="#dc2626"
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>

        {/* State-wise and Category Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                State-wise Distribution
              </h3>
              <p className="text-muted-foreground">Top 5 states by FIR count</p>
            </div>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stateWiseData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="state"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="firs" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-lg shadow-sm">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-foreground">
                Crime Category Breakdown
              </h3>
              <p className="text-muted-foreground">
                Distribution by crime type
              </p>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Category</TableHead>
                  <TableHead>Count</TableHead>
                  <TableHead>Percentage</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categoryData.map((item) => (
                  <TableRow key={item.category}>
                    <TableCell className="font-medium">
                      {item.category}
                    </TableCell>
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

export default TotalFIRsDetail;
