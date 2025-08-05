import React, { useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface SubColumn {
  key: string;
  label: string;
}

interface ColumnGroup {
  key: string;
  label: string;
  subColumns: SubColumn[];
}

interface DataTableProps {
  tableRef: React.RefObject<HTMLDivElement>;
  title: string;
  data: any[];
  primaryKey: string;
  primaryKeyHeader: string;
  columnConfig: ColumnGroup[];
  onExportCSV: () => void;
  onPrint: () => void;
  onToggleViewMode: () => void;
  viewMode: "state" | "district";
  noDataMessage?: string;
}

export function DataTable({
  tableRef,
  title,
  data,
  primaryKey,
  primaryKeyHeader,
  columnConfig,
  onExportCSV,
  onPrint,
  noDataMessage,
  onToggleViewMode,
  viewMode,
}: DataTableProps) {
  const labelMap: Record<string, string> = {
    CP: "Chance Print",
    TP: "Ten Print",
  };

  const { visibleColumns, colSpans, totalVisibleCols } = useMemo(() => {
    const visibility: Record<string, Record<string, boolean>> = {};
    const spans: Record<string, number> = {};
    let totalVisible = 0;

    for (const group of columnConfig) {
      visibility[group.key] = {};
      let visibleCount = 0;
      for (const subCol of group.subColumns) {
        const isVisible = data.some(
          (row) => (row[group.key]?.[subCol.key] ?? 0) !== 0
        );
        visibility[group.key][subCol.key] = isVisible;
        if (isVisible) {
          visibleCount++;
        }
      }
      spans[group.key] = visibleCount;
      totalVisible += visibleCount;
    }
    return {
      visibleColumns: visibility,
      colSpans: spans,
      totalVisibleCols: totalVisible,
    };
  }, [data, columnConfig]);

  // No data available at all
  if (data.length === 0) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          {noDataMessage}
        </CardContent>
      </Card>
    );
  }

  if (totalVisibleCols === 0) {
    return (
      <Card className="mt-3">
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Please select at least one metric other than 'State' to view the
          table.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b">
        <CardTitle>{title}</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onToggleViewMode}>
            View: {viewMode === "state" ? "State" : "District"}
          </Button>
          <Button variant="outline" size="sm" onClick={onExportCSV}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
          <Button variant="outline" size="sm" onClick={onPrint}>
            <Printer className="h-4 w-4 mr-1" /> Print
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-3">
        <div ref={tableRef} className="overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              {/* Top header row with group names */}
              <TableRow className="text-center">
                <TableHead
                  rowSpan={2}
                  className="text-center border-r align-middle"
                >
                  {primaryKeyHeader}
                </TableHead>
                {columnConfig.map((group) =>
                  colSpans[group.key] > 0 ? (
                    <TableHead
                      key={group.key}
                      colSpan={colSpans[group.key]}
                      className="text-center border-r"
                    >
                      {labelMap[group.label] ?? group.label}
                    </TableHead>
                  ) : null
                )}
              </TableRow>

              {/* Second header row with sub-column names */}
              <TableRow>
                {columnConfig.map((group) =>
                  group.subColumns.map((subCol) => {
                    const isVisible = visibleColumns[group.key]?.[subCol.key];
                    if (!isVisible) return null;

                    const visibleSubCols = group.subColumns.filter(
                      (sc) => visibleColumns[group.key]?.[sc.key]
                    );
                    const isLastVisible =
                      visibleSubCols.at(-1)?.key === subCol.key;

                    return (
                      <TableHead
                        key={`${group.key}-${subCol.key}`}
                        className={`text-center ${
                          isLastVisible ? "border-r" : ""
                        }`}
                      >
                        {subCol.label}
                      </TableHead>
                    );
                  })
                )}
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.map((row) => (
                <TableRow key={row[primaryKey]} className="text-center">
                  <TableCell className="font-medium border-r text-center">
                    {row[primaryKey]}
                  </TableCell>
                  {columnConfig.map((group) =>
                    group.subColumns.map((subCol) => {
                      const isVisible = visibleColumns[group.key]?.[subCol.key];
                      if (!isVisible) return null;

                      const visibleSubCols = group.subColumns.filter(
                        (sc) => visibleColumns[group.key]?.[sc.key]
                      );
                      const isLastVisible =
                        visibleSubCols.at(-1)?.key === subCol.key;

                      return (
                        <TableCell
                          key={`${group.key}-${subCol.key}`}
                          className={isLastVisible ? "border-r" : ""}
                        >
                          {row[group.key]?.[subCol.key] ?? 0}
                        </TableCell>
                      );
                    })
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
