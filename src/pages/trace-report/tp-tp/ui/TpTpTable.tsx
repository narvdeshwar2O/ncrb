import React, { useMemo, useRef } from "react";
import { DataTable } from "@/components/tables/DataTable";
import * as exportService from "@/utils/exportService";
import { TpTpTableRow, TpTpStatusKey } from "../types";

/**
 * Table configuration for TP-TP.
 * We exclude "total" because you mentioned it's not needed for display.
 */
const TP_TP_TABLE_CONFIG = [
  {
    key: "tp_tp",
    label: "TP-TP",
    subColumns: [
      { key: "hit", label: "Hit" },
      { key: "no_hit", label: "No Hit" },
      { key: "own_state", label: "Own State" },
      { key: "inter_state", label: "Inter State" },
    ],
  },
];

interface TpTpTableProps {
  rows: TpTpTableRow[];
  statuses: TpTpStatusKey[];
}

export default function TpTpTable({ rows, statuses }: TpTpTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // Prepare rows for DataTable
  const formattedRows = useMemo(() => {
    return rows.map((row) => {
      // Build a nested "tp_tp" object for DataTable
      const metrics: Record<string, number> = {};
      statuses
        .filter((s) => s !== "total")
        .forEach((status) => {
          metrics[status] = Number(row[status] ?? 0); // ✅ Force number
        });

      return {
        state: row.state,
        tp_tp: metrics,
      };
    });
  }, [rows, statuses]);

  const handleExportCSV = () => {
    const headers: string[] = ["State", ...TP_TP_TABLE_CONFIG[0].subColumns.map((col) => col.label)];
    const dataRows: (string | number)[][] = formattedRows.map((row) => [
      row.state,
      ...TP_TP_TABLE_CONFIG[0].subColumns.map((col) => row.tp_tp[col.key] ?? 0),
    ]);
    exportService.exportToCSV("tp-tp-table.csv", headers, dataRows);
  };

  const handlePrint = () => {
    exportService.printComponent(tableRef.current, "TP-TP Table");
  };

  return (
    <DataTable
      tableRef={tableRef}
      title="TP-TP Table"
      data={formattedRows}
      primaryKey="state"
      primaryKeyHeader="State"
      columnConfig={TP_TP_TABLE_CONFIG}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      noDataMessage="No TP-TP data to display for the selected filters."
    />
  );
}
