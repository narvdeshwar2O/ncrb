import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import {
  extractStates,
  filterSlipData,
  computeTotalsByStatus,
  buildSlipTableData,
} from "./utils";

import { MesaFiltersBar } from "./filters/MesaFiltersBar";
import { SlipFilters, MESA_STATUS_KEYS, MesaDailyData } from "./types";

import { MesaCard } from "./ui/MesaCard";
import { MesaTable } from "./ui/MesaTable";
import MesaComparisonChart from "./ui/MesaComparisonChart";
import MesaTopFive from "./ui/MesaTopFive";
import MesaCaptureChart from "./ui/MesaCaptureChart";
import { MesaCaptureTrendChart } from "./ui/MesaCaptureTrendChart";

function MesaTP() {
  const [allData, setAllData] = useState<MesaDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  // Filters – no default 7-day filter, show all data
  const [filters, setFilters] = useState<SlipFilters>({
    dateRange: { from: null, to: null }, // No restriction
    states: [],
    statuses: [...MESA_STATUS_KEYS],
  });

  // --- Load Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "mesa" });
      setAllData(loaded as MesaDailyData[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  // --- All States
  const allStates = useMemo(() => extractStates(allData), [allData]);

  // --- Filtered Data
  const filteredData = useMemo(
    () => filterSlipData(allData, filters),
    [allData, filters]
  );

  // --- Table Data
  const tableRows = useMemo(
    () => buildSlipTableData(filteredData, filters.statuses, filters.states),
    [filteredData, filters.statuses, filters.states]
  );

  // --- Totals by Status
  const totalsByStatus = useMemo(
    () => computeTotalsByStatus(filteredData, filters.statuses, filters.states),
    [filteredData, filters.statuses, filters.states]
  );

  const noStatesSelected = filters.states.length === 0;

  // --- Loading State
  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <Skeleton className="h-8 w-48 mb-2 flex justify-center items-center">
          Loading...
        </Skeleton>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        {/* Filters */}
        <MesaFiltersBar
          allStates={allStates}
          value={filters}
          onChange={setFilters}
        />

        {noStatesSelected ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No states selected. Use the <em>States</em> filter above to select
              one or more states.
            </p>
          </div>
        ) : (
          <>
            {/* Info Bar */}
            <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
              <CardContent className="py-2 px-2 text-sm text-muted-foreground flex justify-between items-center">
                <p>
                  <strong>You are currently viewing:</strong>{" "}
                  <strong>{filteredData.length}</strong> days of data for{" "}
                  <strong>
                    {`${filters.states.length} state${
                      filters.states.length > 1 ? "s" : ""
                    }`}
                  </strong>
                </p>
                <Button size="sm" onClick={() => setShowTable((prev) => !prev)}>
                  {showTable ? "Hide Tabular Data" : "Show Tabular Data"}
                </Button>
              </CardContent>
            </Card>

            {showTable ? (
              <MesaTable rows={tableRows} statuses={filters.statuses} />
            ) : (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {filters.statuses.map((s) => (
                    <MesaCard
                      key={s}
                      title={s}
                      value={totalsByStatus[s] ?? 0}
                    />
                  ))}
                </div>

                {/* Charts */}
                {filters.states.length === 1 ? (
                  <MesaCaptureTrendChart
                    filteredData={filteredData}
                    selectedState={filters.states[0]}
                  />
                ) : (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md">
                      Select at least one state to visualize Arrested, Convicted
                      and Suspect data.
                    </p>
                  </div>
                )}

                <div className="border p-3 rounded-md flex flex-col items-end">
                  <Button
                    size="sm"
                    onClick={() => setShowCompareChart((p) => !p)}
                    className="mb-3 w-[20%] text-nowrap"
                  >
                    {showCompareChart
                      ? "Hide Comparison Chart"
                      : "Show Comparison Chart"}
                  </Button>

                  {showCompareChart ? (
                    filters.states.length >= 2 && filters.states.length <= 5 ? (
                      <MesaComparisonChart
                        rows={tableRows}
                        statuses={filters.statuses}
                        selectedStates={filters.states}
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
                    <MesaCaptureChart
                      filteredData={filteredData}
                      selectedCrimeTypes={filters.statuses}
                    />
                  )}
                </div>

                <MesaTopFive
                  allData={allData}
                  from={filters.dateRange.from!}
                  to={filters.dateRange.to!}
                  statuses={filters.statuses}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default MesaTP;
