import React, { useMemo, useRef } from "react";
import { DataTable } from "@/components/tables/DataTable";
import * as exportService from "@/utils/exportService";
import { MesaTableRow, MesaStatusKey } from "../types";

interface MesaTableProps {
  rows: MesaTableRow[];
  statuses: MesaStatusKey[];
}

export function MesaTable({ rows, statuses }: MesaTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // Convert flat rows to nested structure
  const nestedRows = useMemo(
    () =>
      rows.map((row) => ({
        state: row.state,
        arrestStatus: statuses.reduce(
          (acc, status) => ({
            ...acc,
            [status]: row[status] ?? 0,
          }),
          {}
        ),
      })),
    [rows, statuses]
  );

  // Column configuration
  const mesaTableConfig = [
    {
      key: "arrestStatus",
      label: "Arrest Status",
      subColumns: statuses.map((status) => ({
        key: status,
        label: status,
      })),
    },
  ];

  // CSV Export Handler
  const handleExportCSV = () => {
    const headers: string[] = ["State", ...statuses];
    const dataRows: (string | number)[][] = rows.map((row) => [
      row.state,
      ...statuses.map((status) => row[status] ?? 0),
    ]);

    exportService.exportToCSV("mesa-table.csv", headers, dataRows);
  };

  // Print Handler
  const handlePrint = () => {
    exportService.printComponent(tableRef.current, "Mesa Table");
  };

  return (
    <DataTable
      tableRef={tableRef}
      title="Mesa Table"
      data={nestedRows}
      primaryKey="state"
      primaryKeyHeader="State"
      columnConfig={mesaTableConfig}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      noDataMessage="No mesa data available for the selected filters."
    />
  );
}
