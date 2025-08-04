export interface DailyData {
  date: string;
  data: Record<
    string,
    Record<
      string,
      { enrollment: number; hit: number; nohit: number; total: number }
    >
  >;
}

export const categoryLabelMap: Record<string, string> = {
  tp: "Ten Print (Slip Capture)",
  cp: "Chance Print (Slip Capture)",
  mesa: "New Enrollment (MESA)",
};

export interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
}

export const categoryOptions = ["tp", "cp", "mesa"] as const;

export const dataTypeOptions = ["enrollment", "hit", "nohit"] as const;
