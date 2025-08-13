export type QuickDateRange = {
  label: string;
  value?: number;
};
export const quickRanges: QuickDateRange[] = [
  { label: "Last 7 Days", value: 7 },
  { label: "Last 30 Days", value: 30 },
  { label: "Last 90 Days", value: 90 },
  { label: "All Data" },
];
