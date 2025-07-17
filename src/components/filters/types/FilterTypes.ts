
export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  district?: string;
  state?: string[]|string;
  crimeType?: string;
  dataTypes?: string[];
  categories?: string[];
}

export interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  showCrimeTypeFilter?: boolean;
}
