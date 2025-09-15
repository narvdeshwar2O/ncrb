import React, { useRef } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Download } from "lucide-react";
import { exportToCSV, printComponent } from "../../../utils/exportService";

interface CountryTotal {
  country: string;
  agency: string;
  total: number;
}

interface InterpoleTableProps {
  countryTotals: CountryTotal[];
}

const InterpoleTable: React.FC<InterpoleTableProps> = ({ countryTotals }) => {
  const tableRef = useRef<HTMLDivElement>(null);

  // Prepare CSV data
  const csvHeaders = ["Country", "Agency", "Count"];
  const csvRows = countryTotals.map((row) => [
    row.country,
    row.agency,
    row.total,
  ]);

  const handlePrint = () => {
    if (tableRef.current) {
      printComponent(tableRef.current, "Interpol Table");
    }
  };

  const handleExportCSV = () => {
    exportToCSV("interpol_table.csv", csvHeaders, csvRows);
  };

  return (
    <div className="space-y-3">
      {/* Buttons */}
      <div className="flex justify-end gap-3">
        <Button onClick={handlePrint} variant="outline" size="sm">
          <Printer className="w-4 h-4 mr-1" /> Print
        </Button>
        <Button onClick={handleExportCSV} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-1" /> CSV
        </Button>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-auto rounded-md border mt-3">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="border-r text-center">Country</TableHead>
              <TableHead className="border-r text-center">Agency</TableHead>
              <TableHead className="text-center">Count</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countryTotals.length > 0 ? (
              countryTotals.map((row) => (
                <TableRow key={`${row.country}-${row.agency}`} className="text-center">
                  <TableCell className="font-medium border-r">
                    {row.country}
                  </TableCell>
                  <TableCell className="font-medium border-r">
                    {row.agency}
                  </TableCell>
                  <TableCell>
                    {row.total !== undefined ? row.total.toLocaleString() : "0"}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={3}
                  className="text-center py-8 text-muted-foreground"
                >
                  No data available for selected filters
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default InterpoleTable;
