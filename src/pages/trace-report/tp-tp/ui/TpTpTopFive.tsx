// components/tp-tp/ui/TpTpTopFive.tsx
import { useMemo, useRef } from "react";
import ChartCard from "@/pages/agency/ui/ChartCard"; // Reusing ChartCard from your project
import { TpTpDailyData } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";

// ---------------- Types ----------------
type StatusKey = "hit" | "no_hit" | "own_state" | "inter_state";

interface StateStats {
  state: string;
  value: number;
}

interface TpTpTopFiveProps {
  allData: TpTpDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: StatusKey[];
}

// ---------------- Config ----------------
const VALID_STATUSES: StatusKey[] = [
  "hit",
  "no_hit",
  "own_state",
  "inter_state",
];

// Metrics config (you can customize or add more if needed)
const metricsConfig: { key: StatusKey; label: string }[] = [
  { key: "hit", label: "Hit" },
  { key: "no_hit", label: "No-Hit" },
  { key: "own_state", label: "Own State" },
  { key: "inter_state", label: "Inter State" },
];

const isValidStatus = (v: string): v is StatusKey =>
  (VALID_STATUSES as string[]).includes(v);

const statusLabelMap: Record<StatusKey, string> = {
  hit: "Hit",
  no_hit: "No-Hit",
  own_state: "Own State",
  inter_state: "Inter State",
};

const slugify = (text: string) =>
  text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

export default function TpTpTopFive({
  allData,
  from,
  to,
  statuses,
}: TpTpTopFiveProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const rowRefs = useRef<Record<StatusKey, HTMLDivElement | null>>({
    hit: null,
    no_hit: null,
    own_state: null,
    inter_state: null,
  });

  // Filter and ensure valid statuses
  const activeStatuses: StatusKey[] = statuses.filter(isValidStatus);

  // Compute Top 5 per status
  const topDataByStatus = useMemo(() => {
    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    // totals[state][status] -> number
    const totals: Record<string, Record<StatusKey, number>> = {};

    for (const day of allData) {
      const d = new Date(day.date).getTime();
      if (d < fromTime || d > toTime) continue;

      for (const [state, values] of Object.entries(day.data)) {
        const tpTp = values.tp_tp || {};
        if (!totals[state]) {
          totals[state] = { hit: 0, no_hit: 0, own_state: 0, inter_state: 0 };
        }
        for (const s of activeStatuses) {
          totals[state][s] += tpTp[s as keyof typeof tpTp] ?? 0;
        }
      }
    }

    // For each status, create sorted Top 5 array
    const result: Record<StatusKey, StateStats[]> = {} as Record<
      StatusKey,
      StateStats[]
    >;
    for (const s of activeStatuses) {
      const arr: StateStats[] = Object.entries(totals).map(([state, vals]) => ({
        state,
        value: vals[s] ?? 0,
      }));
      arr.sort((a, b) => b.value - a.value);
      result[s] = arr.slice(0, 5);
    }
    return result;
  }, [allData, from, to, activeStatuses]);

  // Format chart data for ChartCard consumption
  const formatChartData = (arr: StateStats[] | undefined) =>
    (arr ?? []).map((item) => ({
      state: item.state,
      value: item.value,
    }));

  // Print All button
  const handlePrintAll = () => {
    const printButtons = document.querySelectorAll(".print-hide");
    printButtons.forEach(
      (btn) => ((btn as HTMLElement).style.display = "none")
    );

    exportService.printComponent(viewRef.current, "Top 5 States Report - All");

    setTimeout(() => {
      printButtons.forEach((btn) => ((btn as HTMLElement).style.display = ""));
    }, 500);
  };

  // Export All CSV button
  const handleExportAllCSV = () => {
    const csvRows: (string | number)[][] = [];
    activeStatuses.forEach((status) => {
      const statusLabel = statusLabelMap[status];
      const statusData = topDataByStatus[status] || [];

      csvRows.push([`Top 5 - ${statusLabel}`]);
      csvRows.push(["State", "Value"]);
      statusData.forEach((item) => {
        csvRows.push([item.state, item.value]);
      });
      csvRows.push([]);
    });

    exportService.exportToCSV("top-5-report-all.csv", [], csvRows);
  };

  // Print single status block
  const handlePrintRow = (status: StatusKey) => {
    const rowEl = rowRefs.current[status];
    const buttons = rowEl?.querySelectorAll(".print-hide") as
      | NodeListOf<HTMLElement>
      | undefined;

    buttons?.forEach((btn) => (btn.style.display = "none"));

    exportService.printComponent(
      rowEl,
      `${statusLabelMap[status]} - Top 5 States`
    );

    setTimeout(() => {
      buttons?.forEach((btn) => (btn.style.display = ""));
    }, 500);
  };

  // Export CSV for single status block
  const handleExportRowCSV = (status: StatusKey) => {
    const csvRows: (string | number)[][] = [];
    const statusLabel = statusLabelMap[status];
    const statusData = topDataByStatus[status] || [];

    csvRows.push([`Top 5 - ${statusLabel}`]);
    csvRows.push(["State", "Value"]);
    statusData.forEach((item) => {
      csvRows.push([item.state, item.value]);
    });
    csvRows.push([]);

    exportService.exportToCSV(`${slugify(statusLabel)}-top-5.csv`, [], csvRows);
  };

  return (
    <Card ref={viewRef}>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Top 5 States by Status</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportAllCSV}
            className="print-hide"
          >
            <Download className="h-4 w-4 mr-1" /> CSV All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintAll}
            className="print-hide"
          >
            <Printer className="h-4 w-4 mr-1" /> Print All
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {activeStatuses.length === 0 ? (
          <div className="text-center p-3 text-muted-foreground">
            No statuses selected. Please choose at least one status.
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {activeStatuses.map((status) => {
              const label = statusLabelMap[status];
              const statusData = topDataByStatus[status];

              return (
                <ChartCard title={label} data={formatChartData(statusData)} />
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
