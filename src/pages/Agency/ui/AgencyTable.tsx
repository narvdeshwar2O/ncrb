// src/components/AgencyTable.tsx

import React, { useMemo, useRef } from "react";
import { DataTable } from "@/components/tables/DataTable";
// 1. Import the new modular service
import * as exportService from "@/utils/exportService";
import { FilterState } from "@/components/filters/types/FilterTypes";

// Keep your existing type definitions
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
export type StateData = Record<
  string,
  { tp?: Totals; cp?: Totals; mesa?: Totals }
>;

interface AgencyTableProps {
  data: StateData;
  filters: FilterState;
}

// Keep the specific configuration for the Agency Table
const agencyTableConfig = [
  {
    key: "cp",
    label: "CP",
    subColumns: [
      { key: "enrollment", label: "Enroll" },
      { key: "hit", label: "Hit" },
      { key: "nohit", label: "NoHit" },
    ],
  },
  {
    key: "tp",
    label: "TP",
    subColumns: [
      { key: "enrollment", label: "Enroll" },
      { key: "hit", label: "Hit" },
      { key: "nohit", label: "NoHit" },
    ],
  },
  {
    key: "mesa",
    label: "MESA",
    subColumns: [
      { key: "enrollment", label: "Enroll" },
      { key: "hit", label: "Hit" },
      { key: "nohit", label: "NoHit" },
    ],
  },
];

export default function AgencyTable({ data }: AgencyTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  // The data transformation logic remains the same
  const rows = useMemo<StateRow[]>(() => {
    return Object.entries(data).map(([state, cats]) => ({
      state,
      tp: cats.tp,
      cp: cats.cp,
      mesa: cats.mesa,
    }));
  }, [data]);

  // 2. Update the CSV export handler
  const handleExportCSV = () => {
    const headers: string[] = ["State"];
    const dataRows: (string | number)[][] = [];

    // This logic correctly prepares the CSV data based on visible columns
    rows.forEach((row, rowIndex) => {
      const dataRow: (string | number)[] = [row.state];
      agencyTableConfig.forEach((group) => {
        group.subColumns.forEach((subCol) => {
          const value =
            row[group.key as keyof StateRow]?.[subCol.key as keyof Totals] ?? 0;
          if (
            rows.some(
              (r) =>
                (r[group.key as keyof StateRow]?.[subCol.key as keyof Totals] ??
                  0) !== 0
            )
          ) {
            if (rowIndex === 0) {
              headers.push(`${group.label} ${subCol.label}`);
            }
            dataRow.push(value);
          }
        });
      });
      dataRows.push(dataRow);
    });

    // Delegate the actual export task to the service
    exportService.exportToCSV("agency-table.csv", headers, dataRows);
  };

  // 3. Update the print handler
  const handlePrint = () => {
    // Delegate the print task to the service
    exportService.printComponent(tableRef.current, "Agency Table");
  };

  return (
    <DataTable
      tableRef={tableRef}
      title="Agency Table"
      data={rows}
      primaryKey="state"
      primaryKeyHeader="State"
      columnConfig={agencyTableConfig}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      noDataMessage="No agency data to display for the selected filters."
    />
  );
}
