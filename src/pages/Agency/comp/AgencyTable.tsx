import React, { useMemo, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { FilterState } from "../../../components/filters/types/FilterTypes";
import { exportToCSV, printHTMLElement } from "@/utils/exportHelpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
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

export default function AgencyTable({ data }: AgencyTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const rows = useMemo<StateRow[]>(() => {
    return Object.entries(data).map(([state, cats]) => ({
      state,
      tp: cats.tp,
      cp: cats.cp,
      mesa: cats.mesa,
    }));
  }, [data]);

  // Determine which sub-columns to show
  const showCPEnroll = rows.some((r) => (r.cp?.enrollment ?? 0) !== 0);
  const showCPHit = rows.some((r) => (r.cp?.hit ?? 0) !== 0);
  const showCPNoHit = rows.some((r) => (r.cp?.nohit ?? 0) !== 0);

  const showTPEnroll = rows.some((r) => (r.tp?.enrollment ?? 0) !== 0);
  const showTPHit = rows.some((r) => (r.tp?.hit ?? 0) !== 0);
  const showTPNoHit = rows.some((r) => (r.tp?.nohit ?? 0) !== 0);

  const showMESAEnroll = rows.some((r) => (r.mesa?.enrollment ?? 0) !== 0);
  const showMESAHIT = rows.some((r) => (r.mesa?.hit ?? 0) !== 0);
  const showMESANoHit = rows.some((r) => (r.mesa?.nohit ?? 0) !== 0);

  // Helper to count visible sub-columns for a group
  const cpColSpan = [showCPEnroll, showCPHit, showCPNoHit].filter(Boolean).length;
  const tpColSpan = [showTPEnroll, showTPHit, showTPNoHit].filter(Boolean).length;
  const mesaColSpan = [showMESAEnroll, showMESAHIT, showMESANoHit].filter(Boolean).length;

  const handleExportCSV = () => {
    const headers = ["State"];
    if (showCPEnroll) headers.push("CP Enroll");
    if (showCPHit) headers.push("CP Hit");
    if (showCPNoHit) headers.push("CP NoHit");
    if (showTPEnroll) headers.push("TP Enroll");
    if (showTPHit) headers.push("TP Hit");
    if (showTPNoHit) headers.push("TP NoHit");
    if (showMESAEnroll) headers.push("MESA Enroll");
    if (showMESAHIT) headers.push("MESA Hit");
    if (showMESANoHit) headers.push("MESA NoHit");

    const csvRows: (string | number)[][] = [];
    rows.forEach((r) => {
      const row: (string | number)[] = [r.state];
      if (showCPEnroll) row.push(r.cp?.enrollment ?? 0);
      if (showCPHit) row.push(r.cp?.hit ?? 0);
      if (showCPNoHit) row.push(r.cp?.nohit ?? 0);
      if (showTPEnroll) row.push(r.tp?.enrollment ?? 0);
      if (showTPHit) row.push(r.tp?.hit ?? 0);
      if (showTPNoHit) row.push(r.tp?.nohit ?? 0);
      if (showMESAEnroll) row.push(r.mesa?.enrollment ?? 0);
      if (showMESAHIT) row.push(r.mesa?.hit ?? 0);
      if (showMESANoHit) row.push(r.mesa?.nohit ?? 0);
      csvRows.push(row);
    });

    exportToCSV("agency-table.csv", headers, csvRows);
  };

  const handlePrint = () => {
    printHTMLElement(tableRef.current, "Agency Table");
  };

  return (
    <Card className="mt-3 w-full">
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

      <CardContent className="p-0">
        <div ref={tableRef} className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              {/* Top row with CP, TP, MESA */}
              <TableRow>
                <TableHead rowSpan={2} className="text-center border-r">
                  State
                </TableHead>
                {cpColSpan > 0 && (
                  <TableHead colSpan={cpColSpan} className="text-center border-r">
                    CP
                  </TableHead>
                )}
                {tpColSpan > 0 && (
                  <TableHead colSpan={tpColSpan} className="text-center border-r">
                    TP
                  </TableHead>
                )}
                {mesaColSpan > 0 && (
                  <TableHead colSpan={mesaColSpan} className="text-center border-r">
                    MESA
                  </TableHead>
                )}
              </TableRow>

              {/* Second row with sub-columns */}
              <TableRow>
                {showCPEnroll && <TableHead className="text-center">Enroll</TableHead>}
                {showCPHit && <TableHead className="text-center">Hit</TableHead>}
                {showCPNoHit && <TableHead className="text-center border-r">NoHit</TableHead>}

                {showTPEnroll && <TableHead className="text-center">Enroll</TableHead>}
                {showTPHit && <TableHead className="text-center">Hit</TableHead>}
                {showTPNoHit && <TableHead className="text-center border-r">NoHit</TableHead>}

                {showMESAEnroll && <TableHead className="text-center">Enroll</TableHead>}
                {showMESAHIT && <TableHead className="text-center">Hit</TableHead>}
                {showMESANoHit && <TableHead className="text-center border-r">NoHit</TableHead>}
              </TableRow>
            </TableHeader>

            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.state} className="text-center">
                  <TableCell className="font-medium border-r text-left">
                    {r.state}
                  </TableCell>

                  {showCPEnroll && <TableCell>{r.cp?.enrollment ?? 0}</TableCell>}
                  {showCPHit && <TableCell>{r.cp?.hit ?? 0}</TableCell>}
                  {showCPNoHit && <TableCell className="border-r">{r.cp?.nohit ?? 0}</TableCell>}

                  {showTPEnroll && <TableCell>{r.tp?.enrollment ?? 0}</TableCell>}
                  {showTPHit && <TableCell>{r.tp?.hit ?? 0}</TableCell>}
                  {showTPNoHit && <TableCell className="border-r">{r.tp?.nohit ?? 0}</TableCell>}

                  {showMESAEnroll && <TableCell>{r.mesa?.enrollment ?? 0}</TableCell>}
                  {showMESAHIT && <TableCell>{r.mesa?.hit ?? 0}</TableCell>}
                  {showMESANoHit && <TableCell className="border-r">{r.mesa?.nohit ?? 0}</TableCell>}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
