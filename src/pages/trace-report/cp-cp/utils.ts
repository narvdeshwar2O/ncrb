import {
  CpCpDailyData,
  CpCpFilters,
  CpCpTableRow,
  CpCpStatusKey,
} from "./types";

/**
 * ✅ Get Last 7 Days Range
 */
export const getLast7DaysRange = () => {
  const today = new Date();
  const to = today;
  const from = new Date();
  from.setDate(today.getDate() - 7);
  return { from, to };
};

/**
 * ✅ Extract unique states from data
 */
export function extractStates(data: CpCpDailyData[]): string[] {
  const set = new Set<string>();
  for (const day of data) {
    for (const st of Object.keys(day.data)) set.add(st);
  }
  return Array.from(set).sort();
}

/**
 * ✅ Filter data by date range and states
 */
export function filterCpCpData(
  all: CpCpDailyData[],
  filters: CpCpFilters
): CpCpDailyData[] {
  const { from, to } = filters.dateRange;
  const { states } = filters;
  const restrictStates = states && states.length > 0;

  return all.filter((entry) => {
    const d = new Date(entry.date);
    if (from && d < from) return false;
    if (to && d > to) return false;
    if (!restrictStates) return true;
    return states.some((s) => s in entry.data);
  });
}

/**
 * ✅ Compute totals for each metric
 */
export function computeTotalsByStatus(
  filtered: CpCpDailyData[],
  statuses: CpCpStatusKey[],
  restrictStates?: string[]
) {
  const sums: Record<string, number> = {};
  for (const st of statuses) sums[st] = 0;
  let grand = 0;

  const hasRestrict = restrictStates && restrictStates.length > 0;
  for (const day of filtered) {
    const stateKeys = hasRestrict
      ? restrictStates.filter((s) => s in day.data)
      : Object.keys(day.data);

    for (const stKey of stateKeys) {
      const rec = day.data[stKey].cp_cp; // FIXED
      for (const status of statuses) {
        const v = rec?.[status] ?? 0;
        sums[status] += v;
        if (status !== "total") grand += v;
      }
    }
  }
  return { ...sums, total: grand };
}

/**
 * ✅ Build Table Data
 */
export function buildCpCpTableData(
  filtered: CpCpDailyData[],
  statuses: CpCpStatusKey[],
  selectedStates: string[] = []
): CpCpTableRow[] {
  const stateTotals: Record<string, Record<string, number>> = {};

  for (const day of filtered) {
    for (const [state, rec] of Object.entries(day.data)) {
      if (selectedStates.length > 0 && !selectedStates.includes(state)) {
        continue;
      }

      if (!stateTotals[state]) {
        stateTotals[state] = Object.fromEntries(statuses.map((s) => [s, 0]));
        stateTotals[state].total = 0;
      }

      const target = stateTotals[state];
      const cpCpRecord = rec.cp_cp; // FIXED

      for (const s of statuses) {
        const v = cpCpRecord?.[s] ?? 0;
        target[s] += v;
        if (s !== "total") target.total += v;
      }
    }
  }

  return Object.entries(stateTotals)
    .map(([state, stats]) => ({ state, ...stats }))
    .sort((a, b) => (b.total as number) - (a.total as number)) as CpCpTableRow[];
}

/**
 * ✅ Top N by Metric
 */
export function topNByStatus(
  table: CpCpTableRow[],
  status: CpCpStatusKey,
  n = 5
) {
  return [...table]
    .sort((a, b) => (b[status] as number) - (a[status] as number))
    .slice(0, n);
}
