import React, { useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { FilterState } from "../../../components/filters/types/FilterTypes";
import { exportToCSV, printHTMLElement } from "@/utils/exportHelpers";

export interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
  total?: number;
}
export interface StateRow {
  state: string;
  tp?: Totals;
  cp?: Totals;
  mesa?: Totals;
}
export type StateData = Record<string, { tp?: Totals; cp?: Totals; mesa?: Totals }>;

interface AgencyTableProps {
  data: StateData;
  filters: FilterState;
}

export default function AgencyTable({ data, filters }: AgencyTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // flatten to rows for rendering & CSV
  const rows = useMemo<StateRow[]>(() => {
    return Object.entries(data).map(([state, cats]) => ({
      state,
      tp: cats.tp,
      cp: cats.cp,
      mesa: cats.mesa,
    }));
  }, [data]);

  // computed totals for table footer?
  const showTotalCol = true;

  // ----- CSV Export -----
  const handleExportCSV = () => {
    const headers = ["State", "Category", "Enrollment", "Hit", "NoHit", "Total"];
    const csvRows: (string | number)[][] = [];

    rows.forEach((r) => {
      (["tp", "cp", "mesa"] as const).forEach((cat) => {
        const t = r[cat];
        if (!t) return;
        const total = t.total ?? t.enrollment + t.hit + t.nohit;
        csvRows.push([r.state, cat.toUpperCase(), t.enrollment, t.hit, t.nohit, total]);
      });
    });

    exportToCSV("agency-table.csv", headers, csvRows);
  };

  // ----- Print -----
  const handlePrint = () => {
    printHTMLElement(tableRef.current, "Agency Table");
  };

  return (
    <Card ref={tableRef} className="mt-3 w-full overflow-x-auto">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <CardTitle>Agency Table</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportCSV}>
            <Download className="h-4 w-4 mr-1" />
            CSV
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-1" />
            Print
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-2 py-1 text-left">State</th>
              <th className="px-2 py-1 text-right">TP Enroll</th>
              <th className="px-2 py-1 text-right">TP Hit</th>
              <th className="px-2 py-1 text-right">TP NoHit</th>
              <th className="px-2 py-1 text-right">CP Enroll</th>
              <th className="px-2 py-1 text-right">CP Hit</th>
              <th className="px-2 py-1 text-right">CP NoHit</th>
              <th className="px-2 py-1 text-right">MESA Enroll</th>
              <th className="px-2 py-1 text-right">MESA Hit</th>
              <th className="px-2 py-1 text-right">MESA NoHit</th>
              {showTotalCol && (
                <th className="px-2 py-1 text-right">Grand Total</th>
              )}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const tpT = r.tp;
              const cpT = r.cp;
              const mesaT = r.mesa;
              const grand =
                (tpT?.enrollment ?? 0) +
                (tpT?.hit ?? 0) +
                (tpT?.nohit ?? 0) +
                (cpT?.enrollment ?? 0) +
                (cpT?.hit ?? 0) +
                (cpT?.nohit ?? 0) +
                (mesaT?.enrollment ?? 0) +
                (mesaT?.hit ?? 0) +
                (mesaT?.nohit ?? 0);

              return (
                <tr key={r.state} className="border-b">
                  <td className="px-2 py-1 text-left font-medium">{r.state}</td>
                  <td className="px-2 py-1 text-right">{tpT?.enrollment ?? 0}</td>
                  <td className="px-2 py-1 text-right">{tpT?.hit ?? 0}</td>
                  <td className="px-2 py-1 text-right">{tpT?.nohit ?? 0}</td>
                  <td className="px-2 py-1 text-right">{cpT?.enrollment ?? 0}</td>
                  <td className="px-2 py-1 text-right">{cpT?.hit ?? 0}</td>
                  <td className="px-2 py-1 text-right">{cpT?.nohit ?? 0}</td>
                  <td className="px-2 py-1 text-right">{mesaT?.enrollment ?? 0}</td>
                  <td className="px-2 py-1 text-right">{mesaT?.hit ?? 0}</td>
                  <td className="px-2 py-1 text-right">{mesaT?.nohit ?? 0}</td>
                  {showTotalCol && (
                    <td className="px-2 py-1 text-right font-semibold">
                      {grand}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
