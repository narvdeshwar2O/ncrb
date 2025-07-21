// components/tp-tp/ui/CpCpTable.tsx
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CpCpTableRow, CpCpStatusKey } from "../types";

/**
 * Friendly display labels for each metric.
 */
const LABELS: Record<CpCpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  intra_state: "Intra State",
  inter_state: "Inter State",
  total: "Total",
};

export interface CpCpTableProps {
  rows: CpCpTableRow[];
  /** Metrics to show (excluding "total"). */
  statuses: CpCpStatusKey[];
  /** Optional heading shintra over the metrics group. */
  groupLabel?: string;
}

export function CpCpTable({
  rows,
  statuses,
  groupLabel = "Metrics",
}: CpCpTableProps) {
  // Filter out total
  const displayStatuses = React.useMemo<CpCpStatusKey[]>(
    () => statuses.filter((s): s is CpCpStatusKey => s !== "total"),
    [statuses]
  );

  if (!rows.length) {
    return (
      <div className="overflow-auto rounded-md border p-4 text-center text-sm text-muted-foreground">
        No data available for the selected filters.
      </div>
    );
  }

  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        {/* Header */}
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="border-r text-center">
              State
            </TableHead>
            <TableHead
              colSpan={displayStatuses.length}
              className="text-center border-r"
            >
              {groupLabel}
            </TableHead>
          </TableRow>
          <TableRow>
            {displayStatuses.map((status) => (
              <TableHead key={status} className="text-center">
                {LABELS[status]}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        {/* Body */}
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.state} className="text-center">
              <TableCell className="font-medium border-r whitespace-nowrap">
                {row.state}
              </TableCell>
              {displayStatuses.map((status) => (
                <TableCell key={`${row.state}-${status}`}>
                  {Number(row[status] ?? 0).toLocaleString()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
