import React, { useEffect, useMemo, useState, useCallback } from "react";
import { loadAllMonthlyDataReal } from "@/utils/loadAllMonthlyDataRealData";
import { SlipDailyData, SlipFilters, STATUS_KEYS, StatusKey } from "./types";
import {
  extractStates,
  filterSlipData,
  computeTotalsByStatus,
  buildSlipTableDataByState,
  getFilteredRecords,
} from "./utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusCard } from "./ui/StatusCard";
import { SlipTable } from "./ui/SlipTable";
import { SlipComparisonChart } from "./ui/SlipComparisonChart";
import SlipTopFive from "./ui/SlipTopFive";
import { SlipFiltersBar } from "./filters/SlipFiltersBar";
import SlipCaptureChart from "./ui/SlipCaptureChart";
import { SlipCaptureTrendChart } from "./ui/SlipCaptureTrendChart";
import { getLastNDaysRange } from "@/utils/getLastNdays";
import { useLocation } from "react-router-dom";

const dataPath = {
  "/slipcapture": "slip_cp",
  "/mesa": "mesa",
};

const SlipCapture: React.FC = () => {
  const [{ from, to }] = useState(getLastNDaysRange(7));
  const [allData, setAllData] = useState<SlipDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<SlipFilters>({
    dateRange: { from, to },
    states: [],
    districts: [],
    acts: [],
    sections: [],
    statuses: [],
  });
  const [allStates, setAllStates] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);
  const location = useLocation();
  const path = location.pathname;

  const visibleStatuses = useMemo(
    () => filters.statuses.filter((s) => s !== "Total"),
    [filters.statuses]
  );

  console.log("Visible statuses:", visibleStatuses);
  console.log("All filters.statuses:", filters.dateRange);

  // Memoized filter change handler with validation
  const handleFiltersChange = useCallback(
    (newFilters: SlipFilters) => {
      console.log("Filters changing from:", filters);
      console.log("Filters changing to:", newFilters);

      // Validate the new filters before setting them
      if (newFilters.states && newFilters.states.length === 0) {
        console.log("No states selected, clearing dependent filters");
      }

      setFilters(newFilters);
    },
    [filters]
  );

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("Loading slip data...");
        const loaded = await loadAllMonthlyDataReal({ type: dataPath[path] });

        if (!loaded || !Array.isArray(loaded)) {
          throw new Error("Invalid data format received");
        }

        setAllData(loaded as SlipDailyData[]);
        console.log("Slip data loaded:", loaded.length, "records");
        console.log("Sample record:", loaded[0]);

        const states = extractStates(loaded as SlipDailyData[]);
        setAllStates(states);
        console.log("Available states:", states);
      } catch (error) {
        console.error("Error loading slip data:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  // Debug filters changes
  useEffect(() => {
    console.log("Filters updated:", {
      states: filters.states,
      districts: filters.districts,
      acts: filters.acts,
      sections: filters.sections,
      statuses: filters.statuses,
      dateRange: filters.dateRange,
    });
  }, [filters]);

  // Filter data with improved error handling
  const filteredData = useMemo(() => {
    if (filters.states.length === 0 || allData.length === 0) {
      console.log("No states selected or no data available");
      return [];
    }

    try {
      console.log("Filtering data with filters:", filters);
      console.log("Total data records:", allData.length);

      const result = filterSlipData(allData, filters);

      console.log("Filtered data result:", {
        originalRecords: allData.length,
        filteredRecords: result.length,
        filters: filters,
      });

      return result;
    } catch (error) {
      console.error("Error filtering data:", error);
      setError("Error filtering data. Please check your filter selections.");
      return [];
    }
  }, [allData, filters]);

  console.log("Filtered data length:", filteredData.length);

  // Get filtered records with error handling
  const filteredRecords = useMemo(() => {
    if (filteredData.length === 0) return [];

    try {
      const records = getFilteredRecords(allData, filters);
      console.log("Filtered records:", records.length);
      return records;
    } catch (error) {
      console.error("Error getting filtered records:", error);
      return [];
    }
  }, [allData, filters, filteredData.length]);

  // Build table data with error handling
  const tableRows = useMemo(() => {
    if (filteredData.length === 0) return [];

    try {
      console.log("Building table data with:", {
        filteredDataLength: filteredData.length,
        visibleStatuses,
        filterStates: filters.states,
      });

      const rows = buildSlipTableDataByState(
        filteredData,
        visibleStatuses,
        filters.states
      );

      console.log("Table rows built:", rows.length, "rows");
      return rows;
    } catch (error) {
      console.error("Error building table data:", error);
      return [];
    }
  }, [filteredData, visibleStatuses, filters.states]);

  // Compute totals by status with enhanced error handling and debugging
  const totalsByStatus = useMemo(() => {
    if (filteredData.length === 0) {
      console.log("No filtered data available for totals calculation");
      return {} as Record<StatusKey, number>;
    }

    if (visibleStatuses.length === 0) {
      console.log("No visible statuses available for totals calculation");
      return {} as Record<StatusKey, number>;
    }

    try {
      console.log("Computing totals with:", {
        filteredDataLength: filteredData.length,
        visibleStatuses,
        filterStates: filters.states,
      });

      const totals = computeTotalsByStatus(
        filteredData,
        visibleStatuses,
        filters.states
      );
      return totals;
    } catch (error) {
      return {} as Record<StatusKey, number>;
    }
  }, [filteredData, visibleStatuses, filters.states]);

  // Handle initial load callback
  const handleInitialLoad = useCallback(() => {
    console.log("Initial load completed");
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-48 mx-auto" />
          <p className="text-sm text-muted-foreground">Loading data...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <div className="text-center space-y-4">
          <div className="text-red-500 text-lg font-medium">Error</div>
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        {/* Filters */}
        <SlipFiltersBar
          value={filters}
          onChange={handleFiltersChange}
          allData={allData}
          onInitialLoad={handleInitialLoad}
        />

        {/* Content based on filter state */}
        {filters.states.length === 0 ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No states selected. Use the <em>States</em> filter above to select
              one or more states.
            </p>
          </div>
        ) : (
          <>
            {/* Summary Card */}
            <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
              <CardContent className="flex justify-between text-sm text-muted-foreground py-2 items-center">
                <div className="space-y-1">
                  {filters.states.length > 0 && (
                    <div className="text-xs space-y-1">
                      <div>
                        <strong>States ({filters.states.length}):</strong>{" "}
                        {filters.states.length <= 3
                          ? filters.states.join(", ")
                          : `${filters.states.slice(0, 3).join(", ")} +${
                              filters.states.length - 3
                            } more`}
                      </div>
                      {filters.districts.length > 0 && (
                        <div>
                          <strong>Districts:</strong> {filters.districts.length}{" "}
                          selected
                        </div>
                      )}
                      {filters.acts.length > 0 && (
                        <div>
                          <strong>Acts:</strong> {filters.acts.length} selected
                        </div>
                      )}
                      {filters.sections.length > 0 && (
                        <div>
                          <strong>Sections:</strong> {filters.sections.length}{" "}
                          selected
                        </div>
                      )}
                      {filters.statuses.length > 0 && (
                        <div>
                          <strong>Crime Types:</strong>{" "}
                          {filters.statuses.length} selected
                        </div>
                      )}
                      <div>
                        <strong>Total Sum by Crime Type: </strong>
                        {Object.values(totalsByStatus).reduce(
                          (sum, val) => sum + (val || 0),
                          0
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <Button size="sm" onClick={() => setShowTable((p) => !p)}>
                  {showTable ? "Hide Table" : "Show Table"}
                </Button>
              </CardContent>
            </Card>

            {/* Table or Dashboard View */}
            {showTable ? (
              <SlipTable
                rows={tableRows}
                statuses={visibleStatuses}
                filteredData={filteredData}
                selectedStates={filters.states}
                onViewChange={(viewType) => {
                  console.log("View changed to:", viewType);
                }}
              />
            ) : (
              <>
                {/* Status Summary Cards */}
                {visibleStatuses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleStatuses.map((status) => {
                      const total = totalsByStatus[status] ?? 0;
                      console.log(
                        `Rendering StatusCard for ${status} with value:`,
                        total
                      );

                      return (
                        <StatusCard key={status} title={status} value={total} />
                      );
                    })}
                  </div>
                ) : (
                  <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
                    <p className="font-medium">
                      No crime types selected. Complete your filter selection to
                      view data.
                    </p>
                  </div>
                )}

                {/* Trend Chart - only for single state */}
                {filters.states.length === 1 && visibleStatuses.length > 0 ? (
                  <SlipCaptureTrendChart
                    filteredData={filteredData}
                    selectedState={filters.states[0]}
                  />
                ) : filters.states.length > 1 ? (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md">
                      Select only one state to visualize the trend data for
                      Arrested, Suspect, and Convicted cases.
                    </p>
                  </div>
                ) : null}

                {/* Charts Section */}
                {visibleStatuses.length > 0 && (
                  <div className="border p-3 rounded-md flex flex-col items-end">
                    <Button
                      size="sm"
                      onClick={() => setShowCompareChart((p) => !p)}
                      className="mb-3 w-[15%]"
                    >
                      {showCompareChart
                        ? "Hide Comparison Chart"
                        : "Show Comparison Chart"}
                    </Button>

                    {showCompareChart ? (
                      filters.states.length >= 2 &&
                      filters.states.length <= 15 ? (
                        <SlipComparisonChart
                          rows={tableRows}
                          statuses={visibleStatuses}
                          selectedStates={filters.states}
                          categories={["Crime Status"]}
                        />
                      ) : (
                        <div className="w-full p-3 flex justify-center items-center">
                          <p className="border shadow-md p-3 rounded-md">
                            Please select at least 2 and at most 15 states for
                            chart comparison.
                          </p>
                        </div>
                      )
                    ) : (
                      <SlipCaptureChart
                        filteredData={filteredData}
                        selectedCrimeTypes={visibleStatuses}
                      />
                    )}
                  </div>
                )}

                {/* Top 5 */}
                {visibleStatuses.length > 0 &&
                  filters.dateRange.from &&
                  filters.dateRange.to && (
                    <SlipTopFive
                      allData={allData}
                      from={filters.dateRange.from}
                      to={filters.dateRange.to}
                      statuses={visibleStatuses}
                      selectedStates={filters.states}
                    />
                  )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default SlipCapture;
