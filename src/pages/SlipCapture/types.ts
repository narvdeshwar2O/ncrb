// components/slip-capture/types.ts
export interface SlipDailyData {
  date: string;
  data: Record<string, {
    Arrested: number;
    Convicted: number;
    Externee: number;
    Deportee: number;
    UIFP: number;
    Suspect: number;
    UDB: number;
    Absconder: number;
    total: number;
  }>;
}

export const STATUS_KEYS = [
  "Arrested",
  "Convicted",
  "Externee",
  "Deportee",
  "UIFP",
  "Suspect",
  "UDB",
  "Absconder",
] as const;
export type StatusKey = (typeof STATUS_KEYS)[number];

export interface SlipFilters {
  dateRange: { from: Date | null; to: Date | null };
  states: string[];
  statuses: StatusKey[];
}

export interface SlipTableRow {
  state: string;
  [k: string]: number | string; // statuses + total
}
