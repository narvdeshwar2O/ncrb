export {};

declare global {
  /**
   * Represents a single day's data structure.
   */
  interface DailyDataTypes {
    date: string;
  }

  /**
   * Represents a date range filter.
   */
  type DateRange = {
    from: Date;
    to: Date;
  };

  /**
   * All available data types — inferred from your configMap keys.
   * You can add/remove keys here if you add new types in configMap.
   */
  type DataType =
    | "cfpb"
    | "slip_cp"
    | "mesa"
    | "tp_tp"
    | "tp_cp"
    | "cp_cp"
    | "cp_tp"
    | "pp_pp"
    | "agency"
    | "agency_consoldated"
    | "interpol";

  /**
   * Parameters used when loading data from local JSON files.
   */
  interface LoadParams {
    startDate?: string;
    endDate?: string;
    stateFilter?: string;
    type: DataType;
  }
}
