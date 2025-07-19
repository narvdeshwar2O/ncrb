import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { SlipTableRow, StatusKey } from "../types";

interface SlipTableProps {
  rows: SlipTableRow[]; // aggregated per state
  statuses: StatusKey[]; // which statuses to show
}

export function SlipTable({ rows, statuses }: SlipTableProps) {
  return (
    <div className="overflow-auto rounded-md border">
      <Table>
        {/* Table Header */}
        <TableHeader>
          <TableRow>
            <TableHead rowSpan={2} className="border-r text-center">
              State
            </TableHead>
            <TableHead
              colSpan={statuses.length + 1}
              className="text-center border-r"
            >
              Arrest Status
            </TableHead>
          </TableRow>
          <TableRow>
            {statuses.map((status) => (
              <TableHead key={status} className="text-center">
                {status}
              </TableHead>
            ))}
            <TableHead className="text-center border-r">Total</TableHead>
          </TableRow>
        </TableHeader>

        {/* Table Body */}
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.state} className="text-center">
              <TableCell className="font-medium border-r">{row.state}</TableCell>
              {statuses.map((status) => (
                <TableCell key={`${row.state}-${status}`}>
                  {(row[status] as number).toLocaleString()}
                </TableCell>
              ))}
              <TableCell className="font-semibold border-r">
                {(row.total as number).toLocaleString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
