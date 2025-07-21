export interface CpCpRecord {
  hit: number;
  no_hit: number;
  total: number;
  inter_state: number;
  intra_state: number;
}

export interface GenericDailyData<Key extends string = "cp_cp"> {
  date: string;
  data: Record<string, { [K in Key]: CpCpRecord }>;
}

export type CpCpDailyData = GenericDailyData<"cp_cp">;
export type CpTpDailyData = GenericDailyData<"cp_tp">;
export type PpPpDailyData = GenericDailyData<"pp_pp">;

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
