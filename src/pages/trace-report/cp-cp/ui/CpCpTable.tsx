import React, { useMemo, useRef } from "react";
import { DataTable } from "@/components/tables/DataTable";
import * as exportService from "@/utils/exportService";
import { CpCpTableRow, CpCpStatusKey } from "../types";

/**
 * Table configuration for CP-CP (with dynamic label).
 */
const CP_CP_TABLE_CONFIG = (statuses: CpCpStatusKey[], label: string) => [
  {
    key: "cp_cp",
    label: label, // 👈 dynamic label
    subColumns: statuses
      .filter((s) => s !== "total")
      .map((status) => ({
        key: status,
        label:
          status === "hit"
            ? "Hit"
            : status === "no_hit"
            ? "No Hit"
            : status === "intra_state"
            ? "Intra State"
            : status === "inter_state"
            ? "Inter State"
            : status,
      })),
  },
];

interface CpCpTableProps {
  rows: CpCpTableRow[];
  statuses: CpCpStatusKey[];
  title: string; // 👈 dynamic title
  label: string; // 👈 dynamic label
}

export default function CpCpTable({ rows, statuses, title, label }: CpCpTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const visibleStatuses = statuses.filter((s) => s !== "total");

  // Prepare rows
  const formattedRows = useMemo(() => {
    return rows.map((row) => {
      const metrics: Record<string, number> = {};
      visibleStatuses.forEach((status) => {
        metrics[status] = Number(row[status] ?? 0);
      });
      return { state: row.state, cp_cp: metrics };
    });
  }, [rows, visibleStatuses]);

  const handleExportCSV = () => {
    const headers: string[] = [
      "State",
      ...visibleStatuses.map((status) => {
        switch (status) {
          case "hit":
            return "Hit";
          case "no_hit":
            return "No Hit";
          case "intra_state":
            return "Intra State";
          case "inter_state":
            return "Inter State";
          default:
            return status;
        }
      }),
    ];

    const dataRows: (string | number)[][] = formattedRows.map((row) => [
      row.state,
      ...visibleStatuses.map((status) => row.cp_cp[status] ?? 0),
    ]);

    exportService.exportToCSV(`${label.toLowerCase().replace(/\s/g, "-")}-table.csv`, headers, dataRows);
  };

  const handlePrint = () => {
    exportService.printComponent(tableRef.current, title);
  };

  // ✅ Conditional fallback
  if (visibleStatuses.length === 0) {
    return (
      <div className="overflow-auto rounded-md border p-4 text-center text-sm text-muted-foreground">
        No metrics selected. Please choose at least one metric to view the table.
      </div>
    );
  }

  return (
    <DataTable
      tableRef={tableRef}
      title={title}
      data={formattedRows}
      primaryKey="state"
      primaryKeyHeader="State"
      columnConfig={CP_CP_TABLE_CONFIG(visibleStatuses, label)}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      noDataMessage={`No ${label} data to display for the selected filters.`}
    />
  );
}
