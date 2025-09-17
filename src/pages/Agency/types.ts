export interface DailyData extends DailyDataTypes {
  data: Record<
    string,
    Record<
      string,
      {
        hit: number;
        nohit: number;
        total: number;
        enrol: number;
        delete: number;
      }
    >
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
  delete: number;
}

export interface DistrictStats {
  district: string;
  hit: number;
  nohit: number;
  enrol: number;
  total?: number;
  delete: number;
}

export interface StateStats {
  state: string;
  hit: number;
  nohit: number;
  enrol: number;
  delete: number;
  total?: number;
  districts: DistrictStats[];
}

export const categoryOptions = ["tp", "cp", "mesa"] as const;

export const dataTypeOptions = [
  "hit",
  "nohit",
  "total",
  "enrol",
  "delete",
] as const;

export type CategoryKey = "tp" | "cp" | "mesa";

export interface CategoryMetrics {
  hit: number;
  nohit: number;
  total?: number;
  enrol: number;
  delete: number;
}
