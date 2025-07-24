import React, { useMemo, useRef } from "react";
import { DataTable } from "@/components/tables/DataTable";
import * as exportService from "@/utils/exportService";
import { TpTpTableRow, TpTpStatusKey } from "../types";

interface TpTpTableProps {
  rows: TpTpTableRow[];
  statuses: TpTpStatusKey[];
  title: string;
  label: string;
}

export default function TpTpTable({ rows, statuses, title, label }: TpTpTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // 👇 Create the column config with dynamic label
  const columnConfig = useMemo(() => [
    {
      key: "tp_tp",
      label: label, // 👈 use dynamic label here
      subColumns: [
        { key: "hit", label: "Hit" },
        { key: "no_hit", label: "No Hit" },
        { key: "own_state", label: "Own State" },
        { key: "inter_state", label: "Inter State" },
      ],
    },
  ], [label]);

  const formattedRows = useMemo(() => {
    return rows.map((row) => {
      const metrics: Record<string, number> = {};
      statuses
        .filter((s) => s !== "total")
        .forEach((status) => {
          metrics[status] = Number(row[status] ?? 0);
        });

      return {
        state: row.state,
        tp_tp: metrics,
      };
    });
  }, [rows, statuses]);

  const handleExportCSV = () => {
    const headers: string[] = ["State", ...columnConfig[0].subColumns.map((col) => col.label)];
    const dataRows: (string | number)[][] = formattedRows.map((row) => [
      row.state,
      ...columnConfig[0].subColumns.map((col) => row.tp_tp[col.key] ?? 0),
    ]);
    exportService.exportToCSV("tp-tp-table.csv", headers, dataRows);
  };

  const handlePrint = () => {
    exportService.printComponent(tableRef.current, "TP-TP Table");
  };

  return (
    <DataTable
      tableRef={tableRef}
      title={title}
      data={formattedRows}
      primaryKey="state"
      primaryKeyHeader="State"
      columnConfig={columnConfig}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      noDataMessage="No TP-TP data to display for the selected filters."
    />
  );
}
