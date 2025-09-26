import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChartCard from "@/pages/agency/ui/ChartCard";
import * as exportService from "@/utils/exportService";
import { Download, Printer } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import {
  SlipDailyData,
  STATUS_KEY_MAP,
  STATUS_KEYS,
  StatusKey,
} from "../types";

interface SlipTopFiveProps {
  allData: SlipDailyData[];
  from: Date | null;
  to: Date | null;
  statuses: string[];
  selectedStates?: string[];
}

type ViewMode = "state" | "district";

const VALID_STATUSES: StatusKey[] = [...STATUS_KEYS];
const isValidStatus = (v: string): v is StatusKey =>
  (VALID_STATUSES as unknown as string[]).includes(v);

// ✅ Safe object entries
const safeObjectEntries = (obj: any): [string, any][] => {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj).filter(([key]) => typeof key === "string");
};

// Helper function to aggregate array metrics (same as in types.ts)
function aggregateArrayMetrics(sectionData: any): any {
  const aggregated = {
    arrest_act: "",
    arrest_section: "",
    arresty_received_tp: 0,
    convicted_received_tp: 0,
    externee_received_tp: 0,
    absconder_received_tp: 0,
    deportee_received_tp: 0,
    deadbody_received_tp: 0,
    uifp_received_tp: 0,
    suspect_received_tp: 0,
    udb_received_tp: 0,
  };

  const dataArray = Array.isArray(sectionData) ? sectionData : [sectionData];

  dataArray.forEach((item: any) => {
    if (!item || typeof item !== "object") return;

    if (!aggregated.arrest_act && item.arrest_act) {
      aggregated.arrest_act = item.arrest_act;
    }
    if (!aggregated.arrest_section && item.arrest_section) {
      aggregated.arrest_section = item.arrest_section;
    }

    aggregated.arresty_received_tp += item.arresty_received_tp || 0;
    aggregated.convicted_received_tp += item.convicted_received_tp || 0;
    aggregated.externee_received_tp += item.externee_received_tp || 0;
    aggregated.absconder_received_tp += item.absconder_received_tp || 0;
    aggregated.deportee_received_tp += item.deportee_received_tp || 0;
    aggregated.deadbody_received_tp += item.deadbody_received_tp || 0;
    aggregated.uifp_received_tp += item.uifp_received_tp || 0;
    aggregated.suspect_received_tp += item.suspect_received_tp || 0;
    aggregated.udb_received_tp += item.udb_received_tp || 0;
  });

  return aggregated;
}

// ✅ FIXED: Safe numeric extractor with proper gender level handling
const safeNumericValue = (data: any, fieldName: string): number => {
  if (!data || typeof data !== "object") return 0;

  // Use the aggregateArrayMetrics helper function
  const aggregated = aggregateArrayMetrics(data);
  const val = Number(aggregated[fieldName]);
  return isNaN(val) ? 0 : val;
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
  console.log("from date", from, "to date", to, "all data", allData);

  const activeStatuses: StatusKey[] = useMemo(() => {
    const narrowed = statuses
      .filter(isValidStatus)
      .filter((s) => s !== "Total");
    return narrowed.length ? narrowed : [];
  }, [statuses]);

  const isDistrictViewValid = useMemo(() => {
    if (viewMode === "state") return true;
    return selectedStates.length === 1;
  }, [viewMode, selectedStates]);

  const selectedStateName = useMemo(
    () => (selectedStates.length === 1 ? selectedStates[0] : null),
    [selectedStates]
  );

  // ✅ FIXED: Compute top data with proper gender level handling
  const topDataByStatus = useMemo(() => {
    if (!activeStatuses.length) {
      return {};
    }
    if (!isDistrictViewValid) {
      return {};
    }

    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    if (viewMode === "state") {
      const stateTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;

        if (!day.data?.state) {
          continue;
        }

        safeObjectEntries(day.data.state).forEach(([stateName, stateData]) => {
          if (!stateName.trim()) return;

          if (!stateTotals[stateName]) {
            stateTotals[stateName] = {} as Record<StatusKey, number>;
            for (const s of VALID_STATUSES) stateTotals[stateName][s] = 0;
          }

          for (const status of activeStatuses) {
            const fieldName = STATUS_KEY_MAP[status.toLowerCase()];
            if (!fieldName) {
              continue;
            }

            let stateTotal = 0;

            safeObjectEntries(stateData).forEach(
              ([districtName, districtData]) => {
                safeObjectEntries(districtData).forEach(
                  ([actName, actData]) => {
                    // FIXED: Add gender level iteration
                    safeObjectEntries(actData).forEach(
                      ([genderName, genderData]) => {
                        safeObjectEntries(genderData).forEach(
                          ([sectionName, sectionData]) => {
                            const value = safeNumericValue(
                              sectionData,
                              fieldName
                            );
                            stateTotal += value;
                            if (value > 0) {
                            }
                          }
                        );
                      }
                    );
                  }
                );
              }
            );

            stateTotals[stateName][status] += stateTotal;
          }
        });
      }

      const result: Record<StatusKey, any[]> = {} as any;
      for (const status of activeStatuses) {
        const arr = safeObjectEntries(stateTotals)
          .map(([stateName, vals]) => ({
            state: stateName.trim(),
            value: (vals as Record<StatusKey, number>)[status] ?? 0,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        result[status] = arr;
      }
      return result;
    } else {
      // District view
      const districtTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;
        if (!day.data?.state) {
          continue;
        }

        safeObjectEntries(day.data.state).forEach(([stateName, stateData]) => {
          if (!stateName.trim()) return;
          if (
            selectedStateName &&
            stateName.trim().toLowerCase() !== selectedStateName.toLowerCase()
          ) {
            return;
          }

          safeObjectEntries(stateData).forEach(
            ([districtName, districtData]) => {
              if (!districtName.trim()) return;
              const districtKey = `${stateName.trim()} - ${districtName.trim()}`;

              if (!districtTotals[districtKey]) {
                districtTotals[districtKey] = {} as Record<StatusKey, number>;
                for (const s of VALID_STATUSES)
                  districtTotals[districtKey][s] = 0;
              }

              for (const status of activeStatuses) {
                const fieldName = STATUS_KEY_MAP[status.toLowerCase()];
                if (!fieldName) {
                  continue;
                }

                let districtTotal = 0;
                safeObjectEntries(districtData).forEach(
                  ([actName, actData]) => {
                    // FIXED: Add gender level iteration
                    safeObjectEntries(actData).forEach(
                      ([genderName, genderData]) => {
                        safeObjectEntries(genderData).forEach(
                          ([sectionName, sectionData]) => {
                            const value = safeNumericValue(
                              sectionData,
                              fieldName
                            );
                            districtTotal += value;
                            if (value > 0) {
                            }
                          }
                        );
                      }
                    );
                  }
                );

                districtTotals[districtKey][status] += districtTotal;
              }
            }
          );
        });
      }

      const result: Record<StatusKey, any[]> = {} as any;
      for (const status of activeStatuses) {
        const arr = safeObjectEntries(districtTotals)
          .map(([districtKey, vals]) => ({
            state: districtKey.trim(),
            value: (vals as Record<StatusKey, number>)[status] ?? 0,
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 5);

        result[status] = arr;
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

  const hideButtons = (hide: boolean) => {
    document.querySelectorAll(".print-hide").forEach((btn) => {
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
      csvRows.push([
        `Top 5 ${viewMode === "state" ? "States" : "Districts"} - ${status}`,
      ]);
      csvRows.push(headers);

      topList.forEach((item) => {
        const name = typeof item.state === "string" ? item.state : "Unknown";
        const value = typeof item.value === "number" ? item.value : 0;
        csvRows.push([name, value]);
      });
      csvRows.push([]);
    });

    exportService.exportToCSV(`top-5-${viewMode}-slip-report.csv`, [], csvRows);
    hideButtons(false);
  };

  const getTitle = () =>
    viewMode === "state"
      ? "Top 5 States by Crime Status"
      : selectedStateName
      ? `Top 5 Districts in ${selectedStateName} by Crime Status`
      : "Top 5 Districts by Crime Status (Select Single State)";

  return (
    <Card ref={viewRef} className="mt-4">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>{getTitle()}</CardTitle>
        <div className="flex items-center gap-2">
          <Select
            value={viewMode}
            onValueChange={(v) => setViewMode(v as ViewMode)}
          >
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
                title={`${status}`}
                data={topDataByStatus[status] || []}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
