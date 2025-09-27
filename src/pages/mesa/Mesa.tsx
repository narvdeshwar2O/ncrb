import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getLastNDaysRange } from "@/utils/getLastNdays";
import { loadAllMonthlyDataReal } from "@/utils/loadAllMonthlyDataRealData";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { SlipFiltersBar } from "../slip-capture/filters/SlipFiltersBar";
import { SlipDailyData, SlipFilters, StatusKey } from "../slip-capture/types";
import { GenderBasedChart } from "../slip-capture/ui/GenderBasedChart";
import SlipCaptureChart from "../slip-capture/ui/SlipCaptureChart";
import { SlipCaptureTrendChart } from "../slip-capture/ui/SlipCaptureTrendChart";
import { SlipComparisonChart } from "../slip-capture/ui/SlipComparisonChart";
import { SlipTable } from "../slip-capture/ui/SlipTable";
import SlipTopFive from "../slip-capture/ui/SlipTopFive";
import { StatusCard } from "../slip-capture/ui/StatusCard";
import {
  buildSlipTableDataByDistrict,
  buildSlipTableDataByState,
  computeTotalsByStatus,
  extractStates,
  filterSlipData,
} from "../slip-capture/utils";

const dataPath = {
  "/mesa": "mesa",
};

// Comparison type enum
const COMPARISON_TYPES = {
  STATE: "state",
  DISTRICT: "district",
} as const;

type ComparisonType = (typeof COMPARISON_TYPES)[keyof typeof COMPARISON_TYPES];

const Mesa: React.FC = () => {
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
    genders: [],
  });
  const [allStates, setAllStates] = useState<string[]>([]);
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);
  const [comparisonType, setComparisonType] = useState<ComparisonType>(
    COMPARISON_TYPES.STATE
  );
  const location = useLocation();
  const path = location.pathname;

  const visibleStatuses = useMemo(
    () => filters.statuses.filter((s) => s !== "Total"),
    [filters.statuses]
  );

  // Memoized filter change handler with validation
  const handleFiltersChange = useCallback(
    (newFilters: SlipFilters) => {
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
        const loaded = await loadAllMonthlyDataReal({ type: dataPath[path] });
        // // console.log("loaded data", loaded);
        if (!loaded || !Array.isArray(loaded)) {
          throw new Error("Invalid data format received");
        }

        setAllData(loaded as SlipDailyData[]);

        const states = extractStates(loaded as SlipDailyData[]);
        setAllStates(states);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  // Filter data with improved error handling
  const filteredData = useMemo(() => {
    if (filters.states.length === 0 || allData.length === 0) {
      return [];
    }

    try {
      const result = filterSlipData(allData, filters);
      return result;
    } catch (error) {
      setError("Error filtering data. Please check your filter selections.");
      return [];
    }
  }, [allData, filters]);

  // Build table data with error handling - support both state and district views
  const tableRows = useMemo(() => {
    if (filteredData.length === 0) return [];

    try {
      if (comparisonType === COMPARISON_TYPES.DISTRICT) {
        const rows = buildSlipTableDataByDistrict(
          filteredData,
          visibleStatuses,
          filters.states
        );
        return rows;
      } else {
        const rows = buildSlipTableDataByState(
          filteredData,
          visibleStatuses,
          filters.states
        );
        return rows;
      }
    } catch (error) {
      // console.error("Error building table data:", error);
      return [];
    }
  }, [filteredData, visibleStatuses, filters.states, comparisonType]);

  // Compute totals by status with enhanced error handling
  const totalsByStatus = useMemo(() => {
    if (filteredData.length === 0) {
      return {} as Record<StatusKey, number>;
    }

    if (visibleStatuses.length === 0) {
      return {} as Record<StatusKey, number>;
    }

    try {
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
  // // console.log("filtered", filteredData);

  // Validation logic for comparison charts
  const getComparisonValidation = useCallback(() => {
    if (comparisonType === COMPARISON_TYPES.STATE) {
      return {
        isValid: filters.states.length >= 2 && filters.states.length <= 15,
        message: `Please select at least 2 and at most 15 states for chart comparison. Currently selected: ${filters.states.length}`,
      };
    } else {
      // District comparison
      if (filters.states.length !== 1) {
        return {
          isValid: false,
          message: `For district comparison, please select exactly one state. Currently selected: ${filters.states.length} states`,
        };
      }

      const districtCount = filters.districts.length;
      if (districtCount < 2 || districtCount > 15) {
        return {
          isValid: false,
          message: `For district comparison, please select at least 2 and at most 15 districts. Currently selected: ${districtCount} districts`,
        };
      }

      return { isValid: true, message: "" };
    }
  }, [comparisonType, filters.states, filters.districts]);

  // Handle initial load callback
  const handleInitialLoad = useCallback(() => {}, []);

  // Handle comparison type change
  const handleComparisonTypeChange = useCallback((value: ComparisonType) => {
    setComparisonType(value);
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

  const comparisonValidation = getComparisonValidation();

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
              />
            ) : (
              <>
                {/* Status Summary Cards */}
                {visibleStatuses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {visibleStatuses.map((status) => {
                      const total = totalsByStatus[status] ?? 0;

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
                    dateRange={filters.dateRange}
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
                  <>
                    <div className="border p-3 rounded-md">
                      <div className="flex justify-between items-center mb-3">
                        {/* Comparison Type Selector */}

                        <div className="flex justify-end w-full gap-3">
                          <div className="flex items-center gap-2">
                            {showCompareChart && (
                              <>
                                <span className="text-sm font-medium">
                                  Comparison View:
                                </span>
                                <Select
                                  value={comparisonType}
                                  onValueChange={handleComparisonTypeChange}
                                >
                                  <SelectTrigger className="w-40">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value={COMPARISON_TYPES.STATE}>
                                      State Comparison
                                    </SelectItem>
                                    <SelectItem
                                      value={COMPARISON_TYPES.DISTRICT}
                                    >
                                      District Comparison
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </>
                            )}
                          </div>
                          <Button
                            size="sm"
                            onClick={() => setShowCompareChart((p) => !p)}
                            className="w-[15%]"
                          >
                            {showCompareChart
                              ? "Hide Comparison Chart"
                              : "Show Comparison Chart"}
                          </Button>
                        </div>
                      </div>

                      {showCompareChart ? (
                        comparisonValidation.isValid ? (
                          <div className="w-full">
                            <h3 className="text-lg font-medium mb-2">
                              {comparisonType === COMPARISON_TYPES.STATE
                                ? "State"
                                : "District"}{" "}
                              Comparison
                            </h3>
                            <SlipComparisonChart
                              rows={tableRows}
                              statuses={visibleStatuses}
                              selectedStates={filters.states}
                              selectedDistricts={filters.districts}
                              categories={["Crime Status"]}
                              comparisonType={comparisonType}
                            />
                          </div>
                        ) : (
                          <div className="w-full p-3 flex justify-center items-center">
                            <p className="border shadow-md p-3 rounded-md bg-card">
                              {comparisonValidation.message}
                            </p>
                          </div>
                        )
                      ) : (
                        <div className="w-full">
                          <SlipCaptureChart
                            filteredData={filteredData}
                            selectedCrimeTypes={visibleStatuses}
                            dateRange={filters.dateRange}
                          />
                        </div>
                      )}
                    </div>
                    <GenderBasedChart
                      filteredData={filteredData}
                      selectedState={filters.states}
                      selectedStatuses={visibleStatuses}
                      title="Crime Cases by Gender"
                    />
                    <SlipTopFive
                      allData={filteredData}
                      statuses={visibleStatuses}
                      selectedStates={filters.states}
                    />
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Mesa;
