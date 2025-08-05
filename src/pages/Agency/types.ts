export interface DailyData {
  date: string;
  data: Record<
    string,
    Record<string, { hit: number; nohit: number; total: number }>
  >;
}

export const categoryLabelMap: Record<string, string> = {
  tp: "Ten Print (Slip Capture)",
  cp: "Chance Print (Slip Capture)",
  mesa: "New Enrollment (MESA)",
};

export interface Totals {
  hit: number;
  nohit: number;
  total: number;
}

export interface DistrictStats {
  district: string;
  hit: number;
  nohit: number;
}

export interface StateStats {
  state: string;
  hit: number;
  nohit: number;
  districts: DistrictStats[];
}

export const categoryOptions = ["tp", "cp", "mesa"] as const;

export const dataTypeOptions = ["hit", "nohit", "total"] as const;

export type CategoryKey = "tp" | "cp" | "mesa";

export interface CategoryMetrics {
  hit: number;
  nohit: number;
  total: number; // included in data but will be excluded from logic
}
