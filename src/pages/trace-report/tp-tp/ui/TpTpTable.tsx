// components/tp-tp/ui/TpTpTable.tsx
import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TpTpTableRow, TpTpStatusKey } from "../types";

/**
 * Friendly display labels for each metric.
 */
const LABELS: Record<TpTpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  own_state: "Own State",
  inter_state: "Inter State",
  total: "Total", // kept for label mapping but won't be rendered
};

export interface TpTpTableProps {
  rows: TpTpTableRow[];
  /** Metrics to show (excluding "total"). */
  statuses: TpTpStatusKey[];
  /** Optional heading shown over the metrics group. */
  groupLabel?: string;
}

export function TpTpTable({
  rows,
  statuses,
  groupLabel = "TP‑TP Metrics",
}: TpTpTableProps) {
  // Filter out total
  const displayStatuses = React.useMemo<TpTpStatusKey[]>(
    () => statuses.filter((s): s is TpTpStatusKey => s !== "total"),
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
