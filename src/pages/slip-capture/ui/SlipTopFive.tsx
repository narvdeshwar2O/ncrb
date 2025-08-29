"use client";
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

// ✅ Safe numeric extractor
const safeNumericValue = (data: any, fieldName: string): number => {
  if (!data || typeof data !== "object") return 0;
  // Handle case where data is an array of records
  if (Array.isArray(data)) {
    return data.reduce((sum, record) => {
      const val = Number(record[fieldName]);
      return sum + (isNaN(val) ? 0 : val);
    }, 0);
  }
  const val = Number(data[fieldName]);
  return isNaN(val) ? 0 : val;
};

export default function SlipTopFive({
  allData,
  from,
  to,
  statuses,
  selectedStates = [],
}: SlipTopFiveProps) {
  console.log("allData received:", JSON.stringify(allData, null, 2)); // Debug input data
  const viewRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("state");

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

  // ✅ Compute top data
  const topDataByStatus = useMemo(() => {
    if (!activeStatuses.length) {
      console.log("No active statuses selected");
      return {};
    }
    if (!isDistrictViewValid) {
      console.log("District view invalid: ", { selectedStates });
      return {};
    }

    const fromTime = from ? from.getTime() : Number.NEGATIVE_INFINITY;
    const toTime = to ? to.getTime() : Number.POSITIVE_INFINITY;

    if (viewMode === "state") {
      const stateTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          console.log("Invalid or missing date in day:", day);
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;

        if (!day.data?.state) {
          console.log("No state data in day:", day);
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
              console.log(`No fieldName for status: ${status}`);
              continue;
            }

            let stateTotal = 0;

            safeObjectEntries(stateData).forEach(([districtName, districtData]) => {
              safeObjectEntries(districtData).forEach(([actName, actData]) => {
                safeObjectEntries(actData).forEach(([sectionName, sectionData]) => {
                  stateTotal += safeNumericValue(sectionData, fieldName);
                });
              });
            });

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
      console.log("State view result:", result);
      return result;
    } else {
      const districtTotals: Record<string, Record<StatusKey, number>> = {};

      for (const day of allData) {
        if (!day?.date) {
          console.log("Invalid or missing date in day:", day);
          continue;
        }

        const dayTime = new Date(day.date).getTime();
        if (dayTime < fromTime || dayTime > toTime) continue;
        if (!day.data?.state) {
          console.log("No state data in day:", day);
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

          safeObjectEntries(stateData).forEach(([districtName, districtData]) => {
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
                console.log(`No fieldName for status: ${status}`);
                continue;
              }

              let districtTotal = 0;
              safeObjectEntries(districtData).forEach(([actName, actData]) => {
                safeObjectEntries(actData).forEach(([sectionName, sectionData]) => {
                  districtTotal += safeNumericValue(sectionData, fieldName);
                });
              });

              districtTotals[districtKey][status] += districtTotal;
            }
          });
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
      console.log("District view result:", result);
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