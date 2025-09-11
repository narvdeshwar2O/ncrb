import { useRef, useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download, Printer } from "lucide-react";
import { SlipTableRow, StatusKey, SlipDailyData } from "../types";
import * as exportService from "@/utils/exportService";
import { Card, CardContent } from "@/components/ui/card";
import { buildSlipTableDataByDistrict } from "../utils";

type ViewType = "state" | "district";

interface SlipTableProps {
  rows: SlipTableRow[];
  statuses: StatusKey[];
  // Add these props for district data support
  filteredData?: SlipDailyData[];
  selectedStates?: string[];
  onViewChange?: (viewType: ViewType) => void;
}

export function SlipTable({ 
  rows, 
  statuses, 
  filteredData = [],
  selectedStates = [],
  onViewChange 
}: SlipTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const [selectedView, setSelectedView] = useState<ViewType>("state");

  // Build district data when needed
  const districtRows = useMemo(() => {
    if (selectedView === "district" && filteredData.length > 0) {
      try {
        return buildSlipTableDataByDistrict(filteredData, statuses, selectedStates);
      } catch (error) {
        console.error("Error building district data:", error);
        return [];
      }
    }
    return [];
  }, [selectedView, filteredData, statuses, selectedStates]);

  // Determine which data to display based on selected view
  const displayRows = selectedView === "state" ? rows : districtRows;
  const locationLabel = selectedView === "state" ? "State" : "District";

  // Handle view change
  const handleViewChange = (value: ViewType) => {
    setSelectedView(value);
    onViewChange?.(value);
  };

  // Handle Print
  const handlePrint = () => {
    const reportTitle = `${locationLabel} Wise Slip Table Report`;
    exportService.printComponent(tableRef.current, reportTitle);
  };

  // Handle CSV Export
  const handleExportCSV = () => {
    const headers = [locationLabel, ...statuses];
    const csvRows: (string | number)[][] = displayRows.map((row) => [
      selectedView === "state" ? row.state : row.district || row.state,
      ...statuses.map((status) => row[status] as number),
    ]);

    const fileName = `slip-table-${selectedView}-wise.csv`;
    exportService.exportToCSV(fileName, headers, csvRows);
  };

  return (
    <>
      {statuses.length === 0 ? (
        <Card className="mt-3">
          <CardContent className="p-4 text-center text-sm text-muted-foreground">
            Please select some metrics other than <strong>states</strong> to
            view the table.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {/* View Selection and Action Buttons */}
          <div className="flex items-center justify-between">
            {/* View Selection Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">View:</span>
              <Select value={selectedView} onValueChange={handleViewChange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="state">State Wise</SelectItem>
                  <SelectItem value="district">District Wise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="h-4 w-4 mr-1" /> Export CSV
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-auto rounded-md border" ref={tableRef}>
            <Table>
              {/* Table Header */}
              <TableHeader>
                <TableRow>
                  <TableHead className="border-r text-center">
                    {locationLabel}
                  </TableHead>
                  {statuses.map((status) => (
                    <TableHead key={status} className="text-center">
                      {status}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>

              {/* Table Body */}
              <TableBody>
                {displayRows.length > 0 ? (
                  displayRows.map((row) => (
                    <TableRow key={`${selectedView}-${row.state}-${row.district || ''}`} className="text-center">
                      <TableCell className="font-medium border-r">
                        {selectedView === "state" ? row.state : `${row.district || row.state}`}
                        {selectedView === "district" && row.state && (
                          <div className="text-xs text-muted-foreground">({row.state})</div>
                        )}
                      </TableCell>
                      {statuses.map((status) => (
                        <TableCell key={`${row.state}-${row.district || ''}-${status}`}>
                          {(row[status] as number).toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell 
                      colSpan={statuses.length + 1} 
                      className="text-center text-muted-foreground py-8"
                    >
                      No {selectedView} data available
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </>
  );
}