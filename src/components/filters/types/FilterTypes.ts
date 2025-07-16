
export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  district?: string;
  state?: string;
  crimeType?: string;
}

export interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  showCrimeTypeFilter?: boolean;
}
