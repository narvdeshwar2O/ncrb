import { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import { SlipTableRow, StatusKey } from "../types";
import * as exportService from "@/utils/exportService";
import { Card, CardContent } from "@/components/ui/card";

interface SlipTableProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
}

export function SlipTable({ rows, statuses }: SlipTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  // Handle Print
  const handlePrint = () => {
    exportService.printComponent(tableRef.current, "Slip Table Report");
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = ["State", ...statuses];
    const csvRows: (string | number)[][] = rows.map((row) => [
      row.state,
      ...statuses.map((status) => row[status] as number),
    ]);

    exportService.exportToCSV("slip-table.csv", headers, csvRows);
  };

  return (
    <>
      {statuses.length === 0 ? (
        <Card className="mt-3">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Please select some metrics other than <strong> states</strong> to
            view the table.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-1" /> Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="h-4 w-4 mr-1" /> Print
            </Button>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded-md border" ref={tableRef}>
            <Table>
              {/* Table Header */}
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r text-center">State</TableHead>
                  {statuses.map((status) => (
                    <TableHead key={status} className="text-center">
                      {status}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.state} className="text-center">
                    <TableCell className="font-medium border-r">
                      {row.state}
                    </TableCell>
                    {statuses.map((status) => (
                      <TableCell key={`${row.state}-${status}`}>
                        {(row[status] as number).toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}
