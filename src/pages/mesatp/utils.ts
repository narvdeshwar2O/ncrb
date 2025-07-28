// components/slip-capture/utils.ts
import {
  MesaDailyData,
  SlipFilters,
  MesaTableRow,
  MesaStatusKey,
} from "./types";

export const getLastNDaysRange = () => {
  const today = new Date();
  const to = today;
  const from = new Date();
  from.setDate(today.getDate() - 7);
  return { from, to };
};

export function extractStates(data: MesaDailyData[]): string[] {
  const set = new Set<string>();
  for (const day of data) {
    for (const st of Object.keys(day.data)) set.add(st);
  }
  return Array.from(set).sort();
}

export function filterSlipData(
  all: MesaDailyData[],
  filters: SlipFilters
): MesaDailyData[] {
  const { from, to } = filters.dateRange;
  const { states } = filters;
  const restrictStates = states && states.length > 0;

  return all.filter((entry) => {
    const d = new Date(entry.date);
    d.setHours(0, 0, 0, 0); // ⬅️ normalize entry date

    const normFrom = from
      ? new Date(
          from.setFullYear(from.getFullYear(), from.getMonth(), from.getDate())
        )
      : null;
    const normTo = to
      ? new Date(to.setFullYear(to.getFullYear(), to.getMonth(), to.getDate()))
      : null;

    if (normFrom) normFrom.setHours(0, 0, 0, 0);
    if (normTo) normTo.setHours(0, 0, 0, 0);

    if (normFrom && d < normFrom) return false;
    if (normTo && d > normTo) return false;
    if (!restrictStates) return true;

    return states.some((s) => s in entry.data);
  });
}

export function computeTotalsByStatus(
  filtered: MesaDailyData[],
  statuses: MesaStatusKey[],
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
      const rec = day.data[stKey];
      for (const status of statuses) {
        const v = rec?.[status] ?? 0;
        sums[status] += v;
        grand += v;
      }
    }
  }
  return { ...sums, total: grand };
}

export function buildSlipTableData(
  filtered: MesaDailyData[],
  statuses: MesaStatusKey[],
  selectedStates: string[] = []
): MesaTableRow[] {
  const stateTotals: Record<string, Record<string, number>> = {};

  for (const day of filtered) {
    for (const [state, rec] of Object.entries(day.data)) {
      // If state filtering is active, skip non-selected states
      if (selectedStates.length > 0 && !selectedStates.includes(state)) {
        continue;
      }

      if (!stateTotals[state]) {
        stateTotals[state] = Object.fromEntries(statuses.map((s) => [s, 0]));
        stateTotals[state].total = 0;
      }

      const target = stateTotals[state];
      for (const s of statuses) {
        const v = rec?.[s as MesaStatusKey] ?? 0;
        target[s] += v;
        target.total += v;
      }
    }
  }

  return Object.entries(stateTotals)
    .map(([state, stats]) => ({ state, ...stats }))
    .sort(
      (a, b) => (b.total as number) - (a.total as number)
    ) as MesaTableRow[];
}

export function topNByStatus(
  table: MesaTableRow[],
  status: MesaStatusKey,
  n = 5
) {
  return [...table]
    .sort((a, b) => (b[status] as number) - (a[status] as number))
    .slice(0, n);
}
