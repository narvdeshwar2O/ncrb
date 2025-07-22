// components/tp-tp/ui/CpCpTopFive.tsx
import React, { useMemo } from "react";
import ChartCard from "@/pages/agency/ui/ChartCard"; // Reusing ChartCard from your project
import { CpCpDailyData } from "../types";

export interface CpCpTopFiveProps {
  allData: CpCpDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: ("hit" | "no_hit" | "intra_state" | "inter_state")[];
}

type ChartDatum = { state: string; value: number };

const VALID_STATUSES = ["hit", "no_hit", "intra_state", "inter_state"] as const;

export default function CpCpTopFive({
  allData,
  from,
  to,
  statuses,
}: CpCpTopFiveProps) {
  // Filter valid statuses (fallback to all if none valid)
  const activeStatuses = useMemo(() => {
    const filtered = statuses.filter((s) =>
      (VALID_STATUSES as unknown as string[]).includes(s)
    );
    return filtered.length > 0 ? filtered : [...VALID_STATUSES];
  }, [statuses]);

  // Aggregate Top 5 states
  const topDataByStatus = useMemo(() => {
    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    // totals[state][status] -> number
    const totals: Record<string, Record<string, number>> = {};

    for (const day of allData) {
      const d = new Date(day.date).getTime();
      if (d < fromTime || d > toTime) continue;

      for (const [state, values] of Object.entries(day.data)) {
        const tpTp = values.cp_cp || {};
        if (!totals[state]) {
          totals[state] = { hit: 0, no_hit: 0, intra_state: 0, inter_state: 0 };
        }
        for (const s of activeStatuses) {
          totals[state][s] += tpTp[s as keyof typeof tpTp] ?? 0;
        }
      }
    }

    // Build sorted Top 5 for each status
    const result: Record<string, ChartDatum[]> = {};
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {activeStatuses.map((status) => {
        const data = topDataByStatus[status] ?? [];
        return (
          <ChartCard
            key={status}
            title={`Top 5 States - ${status.toUpperCase()}`}
            data={data}
          />
        );
      })}
    </div>
  );
}
