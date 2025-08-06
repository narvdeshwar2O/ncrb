import React, { useMemo, useRef, useState } from "react";
import { DataTable } from "@/components/tables/DataTable";
import * as exportService from "@/utils/exportService";
import { FilterState } from "@/components/filters/types/FilterTypes";
import { Totals } from "../types";

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
  data: {
    stateResult: StateData;
    districtResult: StateData;
  };
  filters: FilterState;
}

export default function AgencyTable({ data, filters }: AgencyTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  console.log("Table data", data);
  const [viewMode, setViewMode] = useState<"state" | "district">("state");

  const allColumns = [
    {
      key: "cp",
      label: "CP",
      subColumns: [
        { key: "hit", label: "Hit" },
        { key: "nohit", label: "NoHit" },
        { key: "total", label: "Total" },
      ],
    },
    {
      key: "tp",
      label: "TP",
      subColumns: [
        { key: "hit", label: "Hit" },
        { key: "nohit", label: "NoHit" },
        { key: "total", label: "Total" },
      ],
    },
    {
      key: "mesa",
      label: "MESA",
      subColumns: [
        { key: "hit", label: "Hit" },
        { key: "nohit", label: "NoHit" },
        { key: "total", label: "Total" },
      ],
    },
  ];

  const columnConfig = useMemo(() => {
    return allColumns
      .map((group) => ({
        ...group,
        subColumns: group.subColumns.filter((sub) =>
          filters.dataTypes.includes(sub.key)
        ),
      }))
      .filter((group) => group.subColumns.length > 0);
  }, [filters.dataTypes]);

  const tableRows = useMemo<StateRow[]>(() => {
    const sourceData =
      viewMode === "district" ? data.districtResult : data.stateResult;

    if (!sourceData) return [];

    return Object.entries(sourceData)
      .map(([name, cats]) => ({
        state: name,
        tp: cats.tp,
        cp: cats.cp,
        mesa: cats.mesa,
      }))
      .filter((row) => {
        const selectedTypes = filters.dataTypes;

        if (!selectedTypes || selectedTypes.length === 0) return true;

        return columnConfig.some((group) => {
          const section = row[group.key as keyof StateRow];
          if (!section) return false;

          return selectedTypes.some((type) => {
            const value = section[type as keyof Totals];
            return value !== undefined && value !== 0;
          });
        });
      });
  }, [viewMode, data, filters.dataTypes, columnConfig]);

  const handleExportCSV = () => {
    const headers: string[] = [viewMode === "district" ? "District" : "State"];
    const dataRows: (string | number)[][] = [];

    tableRows.forEach((row, rowIndex) => {
      const dataRow: (string | number)[] = [row.state];
      columnConfig.forEach((group) => {
        group.subColumns.forEach((subCol) => {
          const value =
            row[group.key as keyof StateRow]?.[subCol.key as keyof Totals] ?? 0;
          if (
            tableRows.some(
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

    const filename =
      viewMode === "district" ? "district-table.csv" : "state-table.csv";
    exportService.exportToCSV(filename, headers, dataRows);
  };

  const handlePrint = () => {
    exportService.printComponent(
      tableRef.current,
      viewMode === "district" ? "District Table" : "State Table"
    );
  };

  return (
    <DataTable
      tableRef={tableRef}
      title={viewMode === "state" ? "State Report" : "District Report"}
      data={tableRows}
      primaryKey="state"
      primaryKeyHeader={viewMode === "state" ? "State" : "District"}
      columnConfig={columnConfig}
      onExportCSV={handleExportCSV}
      onPrint={handlePrint}
      onToggleViewMode={() =>
        setViewMode((prev) => (prev === "state" ? "district" : "state"))
      }
      viewMode={viewMode}
      noDataMessage="No data available."
    />
  );
}
