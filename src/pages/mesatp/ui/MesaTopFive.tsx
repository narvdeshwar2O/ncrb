import { useMemo } from "react";
import ChartCard from "../../agency/ui/ChartCard";
import { MesaDailyData, MesaStatusKey, MESA_STATUS_KEYS } from "../types";

/**
 * Props
 */
interface Top5CrimeStatusViewProps {
  allData: MesaDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: string[];
}

/**
 * Format for ChartCard consumption: { state, value }
 */
type ChartDatum = { state: string; value: number };

/**
 * Utility to validate statuses
 */
const VALID_STATUSES: MesaStatusKey[] = [...MESA_STATUS_KEYS];
const isValidStatus = (v: string): v is MesaStatusKey =>
  (VALID_STATUSES as unknown as string[]).includes(v);

export default function MesaTopFive({
  allData,
  from,
  to,
  statuses,
}: Top5CrimeStatusViewProps) {
  /**
   * Safe narrowed list; if user passes none valid, fall back to ALL.
   */
  const activeStatuses: MesaStatusKey[] = useMemo(() => {
    const narrowed = statuses.filter(isValidStatus);
    return narrowed.length ? narrowed : VALID_STATUSES;
  }, [statuses]);

  /**
   * Aggregate totals across the date range (inclusive).
   */
  const topDataByStatus = useMemo(() => {
    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    const totals: Record<string, Record<MesaStatusKey, number>> = {};

    for (const day of allData) {
      const d = new Date(day.date).getTime();
      if (d < fromTime || d > toTime) continue;

      for (const [state, rec] of Object.entries(day.data)) {
        if (!totals[state]) {
          totals[state] = {} as Record<MesaStatusKey, number>;
          for (const s of VALID_STATUSES) totals[state][s] = 0;
        }
        for (const s of activeStatuses) {
          totals[state][s] += rec[s] ?? 0;
        }
      }
    }

    const result: Record<MesaStatusKey, ChartDatum[]> = {} as any;
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

  return (
    <div className="grid grid-cols-3 gap-3">
      {activeStatuses.map((status) => {
        const data = topDataByStatus[status] ?? [];
        return (
          <div key={status}>
            <div className="grid grid-cols-1 gap-4">
              <ChartCard title={status} data={data} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
