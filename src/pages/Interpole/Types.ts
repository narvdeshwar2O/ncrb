export interface InterpoleDailyData extends DailyDataTypes {
  data: { country: string; agency: string; count: number }[];
}

export interface InterpoleFilters {
  dateRange: { from: Date | null; to: Date | null };
  countries: string[];
}
