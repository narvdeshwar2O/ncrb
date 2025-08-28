import { useMemo, useRef, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Printer } from "lucide-react";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import * as exportService from "@/utils/exportService";
import ChartCard from "@/pages/agency/ui/ChartCard";
import { SlipDailyData, STATUS_KEYS, StatusKey } from "../types";

interface SlipTopFiveProps {
  allData: SlipDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: string[];
  selectedStates?: string[]; // Add selected states from filters
}

type ViewMode = "state" | "district";

const VALID_STATUSES: StatusKey[] = [...STATUS_KEYS];
const isValidStatus = (v: string): v is StatusKey =>
  (VALID_STATUSES as unknown as string[]).includes(v);

// Field mapping for status keys
const STATUS_KEY_MAP: Record<string, string> = {
  arrested: "arresty_received_tp",
  convicted: "convicted_received_tp",
  externee: "externee_received_tp",
  deportee: "deportee_received_tp",
  uifp: "uifp_received_tp",
  suspect: "suspect_received_tp",
  udb: "deadbody_received_tp",
  absconder: "absconder_received_tp",
};

// Helper function to safely get object entries with string keys
const safeObjectEntries = (obj: any): [string, any][] => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).filter(([key]) => key && typeof key === "string");
};

// Helper function to safely extract numeric value
const safeNumericValue = (data: any, fieldName: string): number => {
  if (!data || typeof data !== "object") return 0;
  const value = data[fieldName];
  const numValue = Number(value);
  return isNaN(numValue) ? 0 : numValue;
};

export default function SlipTopFive({
  allData,
  from,
  to,
  statuses,
  selectedStates = [],
}: SlipTopFiveProps) {
  const viewRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("state");

  const activeStatuses: StatusKey[] = useMemo(() => {
    const narrowed = statuses
      .filter(isValidStatus)
      .filter((s) => s !== "Total");
    return narrowed.length ? narrowed : [];
  }, [statuses]);

  //
  //
  //

  // Check if district view is valid
  const isDistrictViewValid = useMemo(() => {
    if (viewMode === "state") return true;
    // For district view, require exactly one state to be selected
    return selectedStates.length === 1;
  }, [viewMode, selectedStates]);

  const selectedStateName = useMemo(() => {
    return selectedStates.length === 1 ? selectedStates[0] : null;
  }, [selectedStates]);

  const topDataByStatus = useMemo(() => {
    if (!activeStatuses.length) return {};
    if (!isDistrictViewValid) return {}; // Don't process if district view is invalid

    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    //

    if (viewMode === "state") {
      // Aggregate by state
      const stateTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          //
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;

        //

        if (!day.data?.state) {
          //
          continue;
        }

        // Iterate through states with safe entries
        safeObjectEntries(day.data.state).forEach(([stateName, stateData]) => {
          if (!stateName || stateName.trim() === "") {
            //
            return;
          }

          //

          if (!stateTotals[stateName]) {
            stateTotals[stateName] = {} as Record<StatusKey, number>;
            for (const s of VALID_STATUSES) stateTotals[stateName][s] = 0;
          }

          // Aggregate data for this state across all districts/acts/sections
          for (const status of activeStatuses) {
            const fieldName = STATUS_KEY_MAP[status.toLowerCase()];
            if (!fieldName) {
              //
              continue;
            }

            let stateTotal = 0;

            // Traverse nested structure: state > district > act > section
            safeObjectEntries(stateData).forEach(
              ([districtName, districtData]) => {
                if (!districtName) return;

                safeObjectEntries(districtData).forEach(
                  ([actName, actData]) => {
                    if (!actName) return;

                    safeObjectEntries(actData).forEach(
                      ([sectionName, sectionData]) => {
                        if (!sectionName) return;

                        const value = safeNumericValue(sectionData, fieldName);
                        stateTotal += value;
                      }
                    );
                  }
                );
              }
            );

            stateTotals[stateName][status] += stateTotal;
            // console.log(`    ${status}: +${stateTotal} (total: ${stateTotals[stateName][status]})`);
          }
        });
      }

      // Create top 5 lists for each status
      const result: Record<StatusKey, any[]> = {} as any;
      for (const status of activeStatuses) {
        const arr: any[] = safeObjectEntries(stateTotals)
          .filter(([stateName]) => stateName && stateName.trim() !== "")
          .map(([stateName, vals]) => ({
            state: stateName.trim(), // Changed from 'name' to 'state' to match ChartCard interface
            value: (vals as Record<StatusKey, number>)[status] ?? 0,
          }));

        arr.sort((a, b) => b.value - a.value);
        result[status] = arr.slice(0, 5);
        //
      }

      return result;
    } else {
      // Aggregate by district
      const districtTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          //
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;

        //

        if (!day.data?.state) {
          //
          continue;
        }

        // Iterate through states and districts with safe entries
        safeObjectEntries(day.data.state).forEach(([stateName, stateData]) => {
          if (!stateName || stateName.trim() === "") return;

          // Filter by selected state if specified
          if (
            selectedStateName &&
            stateName.trim().toLowerCase() !== selectedStateName.toLowerCase()
          ) {
            return; // Skip this state if it's not the selected one
          }

          safeObjectEntries(stateData).forEach(
            ([districtName, districtData]) => {
              if (!districtName || districtName.trim() === "") return;

              const districtKey = `${stateName.trim()} - ${districtName.trim()}`;
              //

              if (!districtTotals[districtKey]) {
                districtTotals[districtKey] = {} as Record<StatusKey, number>;
                for (const s of VALID_STATUSES)
                  districtTotals[districtKey][s] = 0;
              }

              // Aggregate data for this district across all acts/sections
              for (const status of activeStatuses) {
                const fieldName = STATUS_KEY_MAP[status.toLowerCase()];
                if (!fieldName) {
                  //
                  continue;
                }

                let districtTotal = 0;

                safeObjectEntries(districtData).forEach(
                  ([actName, actData]) => {
                    if (!actName) return;

                    safeObjectEntries(actData).forEach(
                      ([sectionName, sectionData]) => {
                        if (!sectionName) return;

                        const value = safeNumericValue(sectionData, fieldName);
                        districtTotal += value;
                      }
                    );
                  }
                );

                districtTotals[districtKey][status] += districtTotal;
                // console.log(`    ${status}: +${districtTotal} (total: ${districtTotals[districtKey][status]})`);
              }
            }
          );
        });
      }

      // Create top 5 lists for each status
      const result: Record<StatusKey, any[]> = {} as any;
      for (const status of activeStatuses) {
        const arr: any[] = safeObjectEntries(districtTotals)
          .filter(([districtKey]) => districtKey && districtKey.trim() !== "")
          .map(([districtKey, vals]) => ({
            state: districtKey.trim(), // Changed from 'name' to 'state' to match ChartCard interface
            value: (vals as Record<StatusKey, number>)[status] ?? 0,
          }));

        arr.sort((a, b) => b.value - a.value);
        result[status] = arr.slice(0, 5);
        //
      }

      return result;
    }
  }, [
    allData,
    from,
    to,
    activeStatuses,
    viewMode,
    isDistrictViewValid,
    selectedStateName,
  ]);

  /** Hide buttons before printing */
  const hideButtons = (hide: boolean) => {
    const buttons = document.querySelectorAll(".print-hide");
    buttons.forEach((btn) => {
      (btn as HTMLElement).style.display = hide ? "none" : "";
    });
  };

  const handlePrintAll = () => {
    hideButtons(true);
    exportService.printComponent(
      viewRef.current,
      `Top 5 ${
        viewMode === "state" ? "States" : "Districts"
      } by Crime Status Report`
    );
    setTimeout(() => hideButtons(false), 500);
  };

  const handleExportAllCSV = () => {
    hideButtons(true);

    const csvRows: (string | number)[][] = [];
    const headers = [viewMode === "state" ? "State" : "District", "Value"];

    activeStatuses.forEach((status) => {
      const topList = topDataByStatus[status] || [];

      // Add a subheading for each status section
      csvRows.push([
        `Top 5 ${viewMode === "state" ? "States" : "Districts"} - ${status}`,
      ]);
      csvRows.push(headers);

      topList.forEach((item) => {
        // Additional safety check for item.state (changed from item.name)
        const name =
          item.state && typeof item.state === "string"
            ? item.state.trim()
            : "Unknown";
        const value = typeof item.value === "number" ? item.value : 0;
        csvRows.push([name, value]);
      });
      csvRows.push([]); // Blank line for spacing between sections
    });

    exportService.exportToCSV(`top-5-${viewMode}-slip-report.csv`, [], csvRows);
    hideButtons(false);
  };

  const handleViewModeChange = (value: string) => {
    if (value === "state" || value === "district") {
      setViewMode(value);
    }
  };

  // Create dynamic title based on view mode and selection
  const getTitle = () => {
    if (viewMode === "state") {
      return "Top 5 States by Crime Status";
    } else {
      if (selectedStateName) {
        return `Top 5 Districts in ${selectedStateName} by Crime Status`;
      } else {
        return "Top 5 Districts by Crime Status (Select Single State)";
      }
    }
  };

  return (
    <Card ref={viewRef} className="mt-4">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{getTitle()}</CardTitle>
        <div className="flex items-center gap-2">
          <Select value={viewMode} onValueChange={handleViewModeChange}>
            <SelectTrigger className="w-[120px] print-hide">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="state">By State</SelectItem>
              <SelectItem value="district">By District</SelectItem>
            </SelectContent>
          </Select>
          {activeStatuses.length > 0 && isDistrictViewValid && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportAllCSV}
                className="print-hide"
              >
                <Download className="h-4 w-4 mr-1" /> CSV All
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintAll}
                className="print-hide"
              >
                <Printer className="h-4 w-4 mr-1" /> Print All
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-4">
        {activeStatuses.length === 0 ? (
          <div className="text-center p-4 text-muted-foreground">
            No crime status selected. Please select at least one crime type.
          </div>
        ) : !isDistrictViewValid ? (
          <div className="text-center p-4 text-muted-foreground">
            <div className="text-lg font-semibold mb-2">
              Select Single State Required
            </div>
            <div>
              To view top districts, please select exactly one state from the
              filters. Currently{" "}
              {selectedStates.length === 0
                ? "no states are"
                : `${selectedStates.length} states are`}{" "}
              selected.
            </div>
            {selectedStates.length > 1 && (
              <div className="mt-2 text-sm">
                Selected states: {selectedStates.join(", ")}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeStatuses.map((status) => (
              <ChartCard
                key={status}
                title={`${status} (Top 5 ${
                  viewMode === "state" ? "States" : "Districts"
                })`}
                data={topDataByStatus[status] || []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
