
export interface SlipNestedData {
  [state: string]: {
    [district: string]: {
      [act: string]: {
        [section: string]: {
          arrest_act: string;
          arrest_section: string;
          arresty_received_tp: number;
          convicted_received_tp: number;
          externee_received_tp: number;
          deportee_received_tp: number;
          uifp_received_tp: number;
          suspect_received_tp: number;
          udb_received_tp: number;
          absconder_received_tp: number;
        };
      };
    };
  };
}

export interface SlipDailyData {
  date: string;
  data: SlipNestedData;
}

export interface SlipRecord {
  date: string;
  state: string;
  district: string;
  act: string;
  section: string;
  Arrested: number;
  Convicted: number;
  Externee: number;
  Deportee: number;
  UIFP: number;
  Suspect: number;
  UDB: number;
  Absconder: number;
  total: number;
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
  "Total",
] as const;

export const STATUS_KEY_MAP: Record<string, string> = {
  arrested: "arresty_received_tp",
  convicted: "convicted_received_tp",
  externee: "externee_received_tp",
  deportee: "deportee_received_tp",
  uifp: "uifp_received_tp",
  suspect: "suspect_received_tp",
  udb: "deadbody_received_tp",
  absconder: "absconder_received_tp",
  total: "total_received_tp"  
};


export type StatusKey = (typeof STATUS_KEYS)[number];

export interface SlipFilters {
  dateRange: {
    from?: Date | null;
    to?: Date | null;
  };
  states: string[];
  districts: string[];
  acts: string[];
  sections: string[];
  statuses: StatusKey[];
}

export interface SlipTableRow {
  state: string;
  district?: string;
  act?: string;
  section?: string;
  total?: number;
  [key: string]: number | string | undefined;
}