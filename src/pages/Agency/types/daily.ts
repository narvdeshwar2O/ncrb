import { CategoryKey } from "./category";
import { Metrics } from "./metrics";

export interface DailyData extends DailyDataTypes {
  data: Record<string, Record<CategoryKey, Metrics>>;
}
