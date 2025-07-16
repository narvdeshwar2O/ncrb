
// Sample data for NCRC Verification Dashboard
export const verificationTrendData = [
  { month: 'Jan 2024', totalRequests: 45200, verified: 38900, rejected: 4100, pending: 2200 },
  { month: 'Feb 2024', totalRequests: 48600, verified: 41800, rejected: 4200, pending: 2600 },
  { month: 'Mar 2024', totalRequests: 52100, verified: 44500, rejected: 4800, pending: 2800 },
  { month: 'Apr 2024', totalRequests: 49800, verified: 42600, rejected: 4500, pending: 2700 },
  { month: 'May 2024', totalRequests: 55400, verified: 47200, rejected: 5100, pending: 3100 },
  { month: 'Jun 2024', totalRequests: 51900, verified: 44300, rejected: 4900, pending: 2700 },
];

export const verificationTypes = [
  { type: 'Police Verification', count: 158400, percentage: 45.2, color: '#2563eb' },
  { type: 'Character Certificate', count: 96800, percentage: 27.6, color: '#16a34a' },
  { type: 'Employment Screening', count: 52200, percentage: 14.9, color: '#dc2626' },
  { type: 'Passport Verification', count: 28100, percentage: 8.0, color: '#f59e0b' },
  { type: 'Court Records', count: 15500, percentage: 4.3, color: '#8b5cf6' },
];

export const processingTimeData = [
  { category: 'Same Day', count: 12500, percentage: 8.2 },
  { category: '1-3 Days', count: 45600, percentage: 30.1 },
  { category: '4-7 Days', count: 58200, percentage: 38.4 },
  { category: '8-15 Days', count: 25100, percentage: 16.6 },
  { category: '>15 Days', count: 10100, percentage: 6.7 },
];

export const agencyWiseData = [
  { agency: 'Delhi Police', requests: 28900, success: 94.2, avgTime: 4.2 },
  { agency: 'Mumbai Police', requests: 24600, success: 91.8, avgTime: 5.1 },
  { agency: 'Bangalore Police', requests: 18200, success: 93.6, avgTime: 3.8 },
  { agency: 'Chennai Police', requests: 16800, success: 89.4, avgTime: 6.2 },
  { agency: 'Hyderabad Police', requests: 15400, success: 92.1, avgTime: 4.8 },
  { agency: 'Kolkata Police', requests: 13900, success: 88.7, avgTime: 7.1 },
];

export const rejectionReasons = [
  { reason: 'Incomplete Documents', count: 18600, percentage: 42.1 },
  { reason: 'Criminal Record Found', count: 12400, percentage: 28.0 },
  { reason: 'Address Mismatch', count: 6200, percentage: 14.0 },
  { reason: 'Identity Verification Failed', count: 4100, percentage: 9.3 },
  { reason: 'Other', count: 2900, percentage: 6.6 },
];

export const chartConfig = {
  totalRequests: { label: 'Total Requests', color: '#2563eb' },
  verified: { label: 'Verified', color: '#16a34a' },
  rejected: { label: 'Rejected', color: '#dc2626' },
  pending: { label: 'Pending', color: '#f59e0b' },
};
