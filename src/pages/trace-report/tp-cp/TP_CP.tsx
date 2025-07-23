import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import {
  TpTpDailyData,
  TpTpFilters,
  TpTpStatusKey,

} from "../tp-tp/types";
import {
  getLast7DaysRange,
  extractStates,
  filterTpTpData,
  computeTotalsByStatus,
  buildTpTpTableData,
} from "../tp-tp/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TPCard } from "../tp-tp/ui/TPCard";
import { TpTpFiltersBar } from "../tp-tp/filters/TpTpFiltersBar";
import TpTpComparisonChart from "../tp-tp/ui/TpTpComparisonChart";
import TpTpTrendChart from "../tp-tp/ui/TpTpTrendChart";
import TpTpTable from "../tp-tp/ui/TpTpTable";
import TpTpTopFive from "../tp-tp/ui/TpTpTopFive";
import TpTpChart from "../tp-tp/ui/TpTpChart";

const statusLabelMap: Record<TpTpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  total: "Total",
  own_state: "Own State",
  inter_state: "Inter State",
};

const TP_TP: React.FC = () => {
  const [{ from, to }] = useState(getLast7DaysRange());
  const [allData, setAllData] = useState<TpTpDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TpTpFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  const visibleStatuses = useMemo(
    () => filters.statuses.filter((s) => s !== "total"),
    [filters.statuses]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "tp_tp" });
      setAllData(loaded as TpTpDailyData[]);
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

  const noStatesSelected = filters.states.length === 0;

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
        <TpTpFiltersBar
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
                  Showing <strong>{filteredData.length}</strong> days for{" "}
                  <strong>
                    {filters.states.length} state
                    {filters.states.length > 1 ? "s" : ""}
                  </strong>
                </p>
                <button
                  className="bg-blue-600 px-3 py-2 rounded-md text-card font-semibold text-white"
                  onClick={() => setShowTable((prev) => !prev)}
                >
                  {showTable ? "Hide Tabular Data" : "Show Tabular Data"}
                </button>
              </CardContent>
            </Card>

            {showTable ? (
              <TpTpTable rows={tableRows} statuses={visibleStatuses} />
            ) : (
              <>
                {/* Status Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {visibleStatuses.map((s) => (
                    <TPCard
                      key={s}
                      title={statusLabelMap[s]}
                      value={totalsByStatus[s] ?? 0}
                    />
                  ))}
                </div>

                {/* Trend Chart */}
                {filters.states.length === 1 ? (
                  <TpTpTrendChart
                    filteredData={filteredData}
                    selectedState={filters.states[0]}
                  />
                ) : (
                  <div className="w-full p-3 flex justify-center items-center">
                    <p className="border shadow-md p-3 rounded-md">
                      Select a single state to view its trend.
                    </p>
                  </div>
                )}

                {/* Charts Section */}
                <div className="border p-3 rounded-md flex flex-col items-end">
                  <button
                    className="bg-blue-600 px-3 py-2 rounded-md text-card font-semibold text-white max-w-[20%] text-nowrap mb-3"
                    onClick={() => setShowCompareChart((p) => !p)}
                  >
                    {showCompareChart
                      ? "Hide Comparison Chart"
                      : "Show Comparison Chart"}
                  </button>

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
                          Please select at least 2 and at most 5 states for
                          chart comparison.
                        </p>
                      </div>
                    )
                  ) : (
                    <TpTpChart
                      filteredData={filteredData}
                      selectedStatuses={visibleStatuses}
                      filters={filters}
                      title="Ten Print - Chance Print"
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
          </>
        )}
      </div>
    </div>
  );
};

export default TP_TP;
