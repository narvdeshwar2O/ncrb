import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import { TpTpDailyData, TpTpFilters, TP_TP_STATUS_KEYS, TpTpStatusKey } from "../tp-tp/types";
import {
  getLast7DaysRange,
  extractStates,
  filterTpTpData,
  computeTotalsByStatus,
  buildTpTpTableData,
} from "../tp-tp/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { TPCard } from "../tp-tp/ui/TPCard";
import { TpTpTable } from "../tp-tp/ui/TpTpTable";
import TpTpComparisonChart from "../tp-tp/ui/TpTpComparisonChart";
import TpTpTopFive from "../tp-tp/ui/TpTpTopFive";
import { TpTpFiltersBar } from "../tp-tp/filters/TpTpFiltersBar";
import TpTpChart from "../tp-tp/ui/TpTpChart";
import TpTpTrendChart from "../tp-tp/ui/TpTpTrendChart"; 

const TP_CP: React.FC = () => {
  const [{ from, to }] = useState(getLast7DaysRange());
  const [allData, setAllData] = useState<TpTpDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TpTpFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [...TP_TP_STATUS_KEYS], // hit, no_hit, own_state, inter_state, total
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  // Remove "total" from visible statuses
  const visibleStatuses = useMemo(
    () => filters.statuses.filter((s) => s !== "total"),
    [filters.statuses]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "tp_cp" });
      setAllData(loaded as unknown as TpTpDailyData[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const allStates = useMemo(() => extractStates(allData), [allData]);
  const filteredData = useMemo(
    () => filterTpTpData(allData, filters),
    [allData, filters]
  );
  const tableRows = useMemo(
    () => buildTpTpTableData(filteredData, visibleStatuses, filters.states),
    [filteredData, visibleStatuses, filters.states]
  );

  const totalsByStatus = useMemo(
    () => computeTotalsByStatus(filteredData, visibleStatuses, filters.states),
    [filteredData, visibleStatuses, filters.states]
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <Skeleton className="h-8 w-48 mb-2 flex justify-center items-center">Loading...</Skeleton>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        {/* Filters Bar */}
        <TpTpFiltersBar
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
          <TpTpTable rows={tableRows} statuses={visibleStatuses} />
        ) : (
          <>
            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {visibleStatuses.map((s) => (
                <TPCard key={s} title={s} value={totalsByStatus[s] ?? 0} />
              ))}
            </div>

            {filters.states.length === 1 ? (
              <TpTpTrendChart
                filteredData={filteredData}
                selectedState={filters.states[0]}
              />
            ) : (
              <div className="w-full p-3 flex justify-center items-center">
                <p className="border shadow-md p-3 rounded-md">
                  Select at least one state to visualize hit/no_hit/own_state/inter_state data.
                </p>
              </div>
            )}

            {/* Charts Section */}
            <div className="border p-3 rounded-md flex flex-col items-end">
              <Button
                size="sm"
                onClick={() => {
                  setShowCompareChart((p) => !p);
                }}
                className="mb-3 w-[15%]"
              >
                {showCompareChart
                  ? "Hide Comparison Chart"
                  : "Show Comparison Chart"}
              </Button>

              {showCompareChart ? (
                filters.states.length >= 2 && filters.states.length <= 5 ? (
                  <TpTpComparisonChart
                    rows={tableRows}
                    statuses={visibleStatuses}
                    selectedStates={filters.states}
                  />
                ) : (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md">
                      Please select at least 2 and at most 5 states for chart comparison.
                    </p>
                  </div>
                )
              ) : (
                <TpTpChart
                  filteredData={filteredData}
                  selectedStatuses={visibleStatuses}
                />
              )}
            </div>

            {/* Top 5 */}
            <TpTpTopFive
              allData={allData}
              from={filters.dateRange.from!}
              to={filters.dateRange.to!}
              statuses={visibleStatuses}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TP_CP;
