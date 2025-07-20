export interface CpCpRecord {
  hit: number;
  no_hit: number;
  total: number;
  inter_state: number;
  intra_state: number;
}

export interface CpCpDailyData {
  date: string;
  data: Record<string, { cp_cp: CpCpRecord }>; // FIXED: cp_cp instead of tp_tp
}

export type CpCpStatusKey = "hit" | "no_hit" | "inter_state" | "intra_state" | "total";

export interface CpCpTableRow {
  state: string;
  hit: number;
  no_hit: number;
  inter_state: number;
  intra_state: number;
  total: number;
}

export interface CpCpFilters {
  dateRange: { from?: Date; to?: Date };
  states: string[];
  statuses: CpCpStatusKey[];
}

export const CP_CP_STATUS_KEYS: CpCpStatusKey[] = [
  "hit",
  "no_hit",
  "inter_state",
  "intra_state",
  "total",
];
