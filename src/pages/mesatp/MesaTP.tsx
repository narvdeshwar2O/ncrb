import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import {
  MesaDailyData,
  SlipFilters,
  MESA_STATUS_KEYS,
  MesaStatusKey,
} from "./types";
import {
  getLast7DaysRange,
  extractStates,
  filterSlipData,
  computeTotalsByStatus,
  buildSlipTableData,
} from "./utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MesaCard } from "./ui/MesaCard";
import { SlipTable } from "./ui/MesaTable";
import MesaComparisonChart from "./ui/MesaComparisonChart";
import MesaTopFive from "./ui/MesaTopFive";
import { MesaFiltersBar } from "./filters/MesaFiltersBar";
import MesaCaptureChart from "./ui/MesaCaptureChart";
import { MesaCaptureTrendChart } from "./ui/MesaCaptureTrendChart";

const MesaTP: React.FC = () => {
  const [{ from, to }] = useState(getLast7DaysRange());
  const [allData, setAllData] = useState<MesaDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SlipFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [...MESA_STATUS_KEYS],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "mesa" });
      console.log("All data", loaded);
      setAllData(loaded as unknown as MesaDailyData[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const allStates = useMemo(() => extractStates(allData), [allData]);
  const filteredData = useMemo(
    () => filterSlipData(allData, filters),
    [allData, filters]
  );
  const tableRows = useMemo(
    () => buildSlipTableData(filteredData, filters.statuses, filters.states),
    [filteredData, filters.statuses, filters.states]
  );

  const totalsByStatus = useMemo(
    () => computeTotalsByStatus(filteredData, filters.statuses, filters.states),
    [filteredData, filters.statuses, filters.states]
  );

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

        {/* Info Bar */}
        <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
          <CardContent className="flex justify-between text-sm text-muted-foreground py-2 items-center">
            <p>
              Showing <strong>{filteredData.length}</strong> days, States:{" "}
              <strong>{filters.states.length || "All"}</strong>
            </p>
            <Button size="sm" onClick={() => setShowTable((p) => !p)}>
              {showTable ? "Hide Table" : "Show Table"}
            </Button>
          </CardContent>
        </Card>

        {/* Table or Charts */}
        {showTable ? (
          <SlipTable rows={tableRows} statuses={filters.statuses} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.statuses.map((s) => (
                <MesaCard key={s} title={s} value={totalsByStatus[s] ?? 0} />
              ))}
            </div>

            {filters.states.length === 1 ? (
              <MesaCaptureTrendChart
                filteredData={filteredData}
                selectedState={filters.states[0]}
              />
            ) : (
              <div className="w-full p-3 flex justify-center items-center">
                <p className="border shadow-md p-3 rounded-md">
                  Select at least one state to visualize Arrested, Convicted,
                  Suspect data.
                </p>
              </div>
            )}

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
                filters.states.length >= 2 && filters.states.length <= 5 ? (
                  <MesaComparisonChart
                    rows={tableRows}
                    statuses={filters.statuses}
                    selectedStates={filters.states}
                  />
                ) : (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md">
                      Please select at least 2 and at most 5 states for chart
                      comparison.
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
      </div>
    </div>
  );
};

export default MesaTP;
