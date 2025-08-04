export interface FilterState {
  dateRange: {
    from: Date | undefined;
    to: Date | undefined;
  };
  state: string[];
  districts?: string[];
  dataTypes?: string[];
  categories?: string[];
}

export interface DashboardFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  showCrimeTypeFilter?: boolean;
}
