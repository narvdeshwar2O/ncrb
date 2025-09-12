export interface DailyData {
  date: string;
  data: Record<
    string,
    Record<string, { hit: number; nohit: number; total: number; enrol: number }>
  >;
}

export const categoryLabelMap: Record<string, string> = {
  tp: "Ten Print (Slip Capture)",
  cp: "Chance Print (Slip Capture)",
  mesa: "Live Enrollment (MESA)",
};

export interface Totals {
  hit: number;
  nohit: number;
  total?: number;
  enrol: number;
}

export interface DistrictStats {
  district: string;
  hit: number;
  nohit: number;
  enrol: number;
  total?: number;
}


export interface StateStats {
  state: string;
  hit: number;
  nohit: number;
  enrol: number;
  total?: number;
  districts: DistrictStats[];
}

export const categoryOptions = ["tp", "cp", "mesa"] as const;

export const dataTypeOptions = ["hit", "nohit", "total", "enrol"] as const;

export type CategoryKey = "tp" | "cp" | "mesa";

export interface CategoryMetrics {
  hit: number;
  nohit: number;
  total?: number;
  enrol: number;
}
