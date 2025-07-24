import { useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import * as exportService from "@/utils/exportService";
import ChartCard from "@/pages/agency/ui/ChartCard";
import { MesaDailyData, MesaStatusKey, MESA_STATUS_KEYS } from "../types";

interface MesaTopFiveProps {
  allData: MesaDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: string[];
}

type ChartDatum = { state: string; value: number };

const VALID_STATUSES: MesaStatusKey[] = MESA_STATUS_KEYS.filter(
  (status) => status !== "Total"
);

const isValidStatus = (v: string): v is MesaStatusKey =>
  (VALID_STATUSES as unknown as string[]).includes(v);

export default function MesaTopFive({
  allData,
  from,
  to,
  statuses,
}: MesaTopFiveProps) {
  const viewRef = useRef<HTMLDivElement>(null);

  // Active statuses (filter out Total)
  const activeStatuses: MesaStatusKey[] = useMemo(() => {
    const narrowed = statuses.filter(isValidStatus);
    return narrowed; // No fallback to VALID_STATUSES
  }, [statuses]);

  // Compute top 5 states for each active status
  const topDataByStatus = useMemo(() => {
    if (!activeStatuses.length) return {};

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

  /** Hide buttons before printing */
  const hideButtons = (hide: boolean) => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = hide ? "none" : "";
    });
  };

  const handlePrintAll = () => {
    hideButtons(true);
    exportService.printComponent(
      viewRef.current,
      "Top 5 Crime Status Report (Mesa)"
    );
    setTimeout(() => hideButtons(false), 500);
  };

  const handleExportAllCSV = () => {
    hideButtons(true);
    const csvRows: (string | number)[][] = [];
    activeStatuses.forEach((status) => {
      const topList = topDataByStatus[status] || [];
      csvRows.push([`Top 5 - ${status}`]);
      csvRows.push(["State", "Value"]);
      topList.forEach((item) => csvRows.push([item.state, item.value]));
      csvRows.push([]);
    });
    exportService.exportRawDataToCSV("top-5-mesa-report.csv", csvRows);
    hideButtons(false);
  };
  return (
    <Card ref={viewRef} className="mt-4">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>Top 5 States by Crime Status</CardTitle>
        {activeStatuses.length > 0 && (
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
        )}
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {activeStatuses.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No crime status selected. Please select at least one crime type.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStatuses.map((status) => (
              <ChartCard
                key={status}
                title={status}
                data={topDataByStatus[status] || []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
