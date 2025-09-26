import { Metrics } from "./metrics";

export interface DistrictStats extends Metrics {
  district: string;
}

export interface StateStats extends Metrics {
  state: string;
  districts: DistrictStats[];
}
