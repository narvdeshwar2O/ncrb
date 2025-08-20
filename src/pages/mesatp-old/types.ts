// components/mesa-capture/types.ts
export interface MesaDailyData {
  date: string;
  data: Record<
    string,
    {
      Arrested: number;
      Convicted: number;
      Externee: number;
      Deportee: number;
      UIFP: number;
      Suspect: number;
    }
  >;
}

export const MESA_STATUS_KEYS = [
  "Arrested",
  "Convicted",
  "Externee",
  "Deportee",
  "UIFP",
  "Suspect",
  "Total"
] as const;

export type MesaStatusKey = (typeof MESA_STATUS_KEYS)[number];

export interface SlipFilters {
  dateRange: { from: Date | null; to: Date | null };
  states: string[];
  statuses: MesaStatusKey[];
}

export interface MesaTableRow {
  state: string;
  [key: string]: number | string | undefined;
}
