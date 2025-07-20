// components/tp-tp/types.ts

export interface TpTpDailyData {
  date: string;
  data: Record<string, {
    tp_tp: {
      hit: number;
      no_hit: number;
      total: number;
      own_state: number;
      inter_state: number;
    };
  }>;
}

export const TP_TP_STATUS_KEYS = [
  "hit",
  "no_hit",
  "total",
  "own_state",
  "inter_state"
] as const;

export type TpTpStatusKey = (typeof TP_TP_STATUS_KEYS)[number];

export interface TpTpFilters {
  dateRange: { from: Date | null; to: Date | null };
  states: string[];
  statuses: TpTpStatusKey[];
}

export interface TpTpTableRow {
  state: string;
  total?: number;
  [key: string]: number | string | undefined;
}
