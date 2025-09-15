import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface CountryTotal {
  country: string;
  agency?: string;
  total: number;
}

interface InterpoleTableProps {
  countryTotals: CountryTotal[];
}

const InterpoleTable: React.FC<InterpoleTableProps> = ({ countryTotals }) => {
  console.log("tables", countryTotals);
  return (
    <div className="overflow-auto rounded-md border mt-3">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="border-r text-center">Country</TableHead>
            <TableHead className="text-center">Count</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {countryTotals.length > 0 ? (
            countryTotals.map((row) => (
              <TableRow key={row.country} className="text-center">
                <TableCell className="font-medium border-r">
                  {row.country}
                </TableCell>
                <TableCell>
                  {row.total !== undefined ? row.total.toLocaleString() : "0"}
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                colSpan={2}
                className="text-center py-8 text-muted-foreground"
              >
                No data available for selected filters
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default InterpoleTable;
