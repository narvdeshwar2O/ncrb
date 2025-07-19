import { useMemo } from "react";
import ChartCard from "../../Agency/comp/ChartCard";


/**
 * Props
 */
interface Top5CrimeStatusViewProps {
  allData: SlipDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: string[]; // loose; we will narrow
}

/**
 * Narrow incoming statuses to the valid SlipCapture status keys.
 * We import STATUS_KEYS lazily to avoid circular deps (or pass in if you prefer).
 */

import { SlipDailyData, STATUS_KEYS, StatusKey } from "../types";
const VALID_STATUSES: StatusKey[] = [...STATUS_KEYS];
const isValidStatus = (v: string): v is StatusKey =>
  (VALID_STATUSES as unknown as string[]).includes(v);

/**
 * Format for ChartCard consumption: { state, value }
 */
type ChartDatum = { state: string; value: number };

/**
 * Component
 */
export default function SlipTopFive({
  allData,
  from,
  to,
  statuses,
}: Top5CrimeStatusViewProps) {
  /**
   * Safe narrowed list; if user passes none valid, fall back to ALL.
   */
  const activeStatuses: StatusKey[] = useMemo(() => {
    const narrowed = statuses.filter(isValidStatus);
    return narrowed.length ? narrowed : VALID_STATUSES;
  }, [statuses]);

  /**
   * Aggregate totals across the date range (inclusive).
   * NOTE: Ignores any state selection filters (as requested).
   */
  const topDataByStatus = useMemo(() => {
    // Guard null dates: if missing, include everything
    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    // totals[state][status] -> number
    const totals: Record<
      string,
      Record<StatusKey, number>
    > = {};

    for (const day of allData) {
      const d = new Date(day.date).getTime();
      if (d < fromTime || d > toTime) continue;

      // day.data: Record<StateName, Record<StatusKey, number>>
      for (const [state, rec] of Object.entries(day.data)) {
        if (!totals[state]) {
          // init all statuses to 0
          totals[state] = {} as Record<StatusKey, number>;
          for (const s of VALID_STATUSES) totals[state][s] = 0;
        }
        for (const s of activeStatuses) {
          totals[state][s] += rec[s] ?? 0;
        }
      }
    }

    // Build sorted Top5 lists per status
    const result: Record<StatusKey, ChartDatum[]> = {} as any;
    for (const s of activeStatuses) {
      const arr: ChartDatum[] = Object.entries(totals).map(([state, vals]) => ({
        state,
        value: vals[s] ?? 0,
      }));
      arr.sort((a, b) => b.value - a.value);
      result[s] = arr.slice(0, 5);
    }
    return result;
  }, [allData, from, to, activeStatuses]);

  /**
   * Render
   */
  return (
    <div className="grid grid-cols-3 gap-3">
      {activeStatuses.map((status) => {
        const data = topDataByStatus[status] ?? [];
        return (
          <div key={status}>
            
            <div className="grid grid-cols-1 md:grid-grid-1 lg:grid-cols-1 gap-4">
              
              <ChartCard title={status} data={data} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
