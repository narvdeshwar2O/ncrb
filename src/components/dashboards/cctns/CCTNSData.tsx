
// Sample data for CCTNS FIR Dashboard
export const firTrendData = [
  { month: 'Jan 2024', totalFIRs: 12500, solved: 8200, pending: 4300 },
  { month: 'Feb 2024', totalFIRs: 11800, solved: 7900, pending: 3900 },
  { month: 'Mar 2024', totalFIRs: 13200, solved: 8800, pending: 4400 },
  { month: 'Apr 2024', totalFIRs: 12900, solved: 8500, pending: 4400 },
  { month: 'May 2024', totalFIRs: 14100, solved: 9200, pending: 4900 },
  { month: 'Jun 2024', totalFIRs: 13600, solved: 8900, pending: 4700 },
];

export const crimeCategories = [
  { category: 'Theft', count: 28500, percentage: 35.2, color: '#8884d8' },
  { category: 'Assault', count: 18200, percentage: 22.5, color: '#82ca9d' },
  { category: 'Fraud', count: 15600, percentage: 19.3, color: '#ffc658' },
  { category: 'Cyber Crime', count: 9800, percentage: 12.1, color: '#ff7300' },
  { category: 'Drug Offenses', count: 5400, percentage: 6.7, color: '#8dd1e1' },
  { category: 'Others', count: 3500, percentage: 4.2, color: '#d084d0' },
];

export const stateWiseData = [
  { state: 'Maharashtra', firs: 45200, rate: 3.2 },
  { state: 'Uttar Pradesh', firs: 52800, rate: 2.1 },
  { state: 'Karnataka', firs: 28900, rate: 4.1 },
  { state: 'Tamil Nadu', firs: 31500, rate: 4.3 },
  { state: 'Gujarat', firs: 22400, rate: 3.5 },
  { state: 'Rajasthan', firs: 18600, rate: 2.4 },
];

export const resolutionTimeData = [
  { timeRange: '0-30 days', count: 25600, percentage: 42.1 },
  { timeRange: '31-90 days', count: 18900, percentage: 31.0 },
  { timeRange: '91-180 days', count: 9800, percentage: 16.1 },
  { timeRange: '181-365 days', count: 4200, percentage: 6.9 },
  { timeRange: '>365 days', count: 2400, percentage: 3.9 },
];

export const chartConfig = {
  totalFIRs: { label: 'Total FIRs', color: '#2563eb' },
  solved: { label: 'Solved', color: '#16a34a' },
  pending: { label: 'Pending', color: '#dc2626' },
};
