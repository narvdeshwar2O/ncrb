import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import {
  CpCpDailyData,
  CpCpFilters,
  CpCpStatusKey,
  CP_CP_STATUS_KEYS,
  CpCpRecord,
} from "../cp-cp/types";
import {
  getLast7DaysRange,
  extractStates,
  filterCpCpData,
  computeTotalsByStatus,
  buildCpCpTableData,
} from "../cp-cp/utils";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CpCard } from "../cp-cp/ui/CPCard";
import { CpCpFiltersBar } from "../cp-cp/filters/CpCpFiltersBar";
import CpCpComparisonChart from "../cp-cp/ui/CpCpComparisonChart";
import CpCpTrendChart from "../cp-cp/ui/CpCpTrendChart";
import  CpCpTable  from "../cp-cp/ui/CpCpTable";
import CpCpTopFive from "../cp-cp/ui/CpCpTopFive";
import CpCpChart from "../cp-cp/ui/CpCpChart";

const statusLabelMap: Record<CpCpStatusKey, string> = {
  hit: "Hit",
  no_hit: "No Hit",
  total: "Total",
  intra_state: "Intra State",
  inter_state: "Inter State",
};

const CP_TP: React.FC = () => {
  const [{ from, to }] = useState(getLast7DaysRange());
  const [allData, setAllData] = useState<CpCpDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CpCpFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [...CP_CP_STATUS_KEYS],
  });

  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  // Filter visible statuses
  const visibleStatuses = useMemo(
    () => filters.statuses.filter((s) => s !== "total"),
    [filters.statuses]
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "cp_tp" });

      // Transform cp_tp -> cp_cp for internal reuse
      const transformed = loaded.map((entry: any) => ({
        date: entry.date,
        data: Object.fromEntries(
          Object.entries(entry.data).map(([state, val]) => {
            const v = val as { cp_tp: CpCpRecord };
            return [state, { cp_cp: v.cp_tp }];
          })
        ),
      }));

      setAllData(transformed as CpCpDailyData[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const allStates = useMemo(() => extractStates(allData), [allData]);
  const filteredData = useMemo(
    () => filterCpCpData(allData, filters),
    [allData, filters]
  );
  const tableRows = useMemo(
    () => buildCpCpTableData(filteredData, visibleStatuses, filters.states),
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
        {/* Filters Bar */}
        <CpCpFiltersBar
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
              <CpCpTable rows={tableRows} statuses={visibleStatuses} />
            ) : (
              <>
                {/* Status Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {visibleStatuses.map((s) => (
                    <CpCard
                      key={s}
                      title={statusLabelMap[s]}
                      value={totalsByStatus[s] ?? 0}
                    />
                  ))}
                </div>

                {/* Trend Chart */}
                {filters.states.length === 1 ? (
                  <CpCpTrendChart
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
                    filters.states.length >= 2 &&
                    filters.states.length <= 15 ? (
                      <CpCpComparisonChart
                        rows={tableRows}
                        statuses={visibleStatuses}
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
                    <CpCpChart
                      filteredData={filteredData}
                      selectedStatuses={visibleStatuses}
                      title="Chance Print - Ten Print"
                    />
                  )}
                </div>

                {/* Top 5 */}
                <CpCpTopFive
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

export default CP_TP;
