import React, { useEffect, useMemo, useState } from "react";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import { SlipDailyData, SlipFilters, STATUS_KEYS, StatusKey } from "./types";
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
import { StatusCard } from "./ui/StatusCard";
import { SlipTable } from "./ui/SlipTable";
import SlipComparisonChart from "./ui/SlipComparisonChart";
import SlipTop5 from "./ui/SlipTopFive";
import { SlipFiltersBar } from "./filters/SlipFiltersBar";

const SlipCapture: React.FC = () => {
  const [{ from, to }] = useState(getLast7DaysRange());
  const [allData, setAllData] = useState<SlipDailyData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SlipFilters>({
    dateRange: { from, to },
    states: [],
    statuses: [...STATUS_KEYS],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setShowCompareChart] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "slip_cp" });
      console.log("All data", loaded);
      setAllData(loaded as unknown as SlipDailyData[]);
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
    () => buildSlipTableData(filteredData, filters.statuses),
    [filteredData, filters.statuses]
  );
  const totalsByStatus = useMemo(
    () => computeTotalsByStatus(filteredData, filters.statuses, filters.states),
    [filteredData, filters.statuses, filters.states]
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <Skeleton className="h-8 w-48 mb-2">Loading...</Skeleton>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <SlipFiltersBar
          allStates={allStates}
          value={filters}
          onChange={setFilters}
        />

        <Card>
          <CardContent className="flex justify-between text-sm text-muted-foreground py-2">
            <p>
              Showing <strong>{filteredData.length}</strong> days, States:{" "}
              <strong>{filters.states.length || "All"}</strong>
            </p>
            <Button size="sm" onClick={() => setShowTable((p) => !p)}>
              {showTable ? "Hide Table" : "Show Table"}
            </Button>
          </CardContent>
        </Card>

        {showTable ? (
          <SlipTable rows={tableRows} statuses={filters.statuses} />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {filters.statuses.map((s) => (
                <StatusCard key={s} title={s} value={totalsByStatus[s] ?? 0} />
              ))}
            </div>

            <div className="border p-3 rounded-md">
              <Button
                size="sm"
                onClick={() => setShowCompareChart((p) => !p)}
                className="mb-3"
              >
                {showCompareChart ? "Hide Chart" : "Show Chart"}
              </Button>

              {showCompareChart &&
                (filters.states.length >= 2 && filters.states.length <= 5 ? (
                  <SlipComparisonChart
                    rows={tableRows}
                    statuses={filters.statuses}
                    selectedStates={filters.states}
                  />
                ) : (
                  <p className="text-center text-muted-foreground">
                    Select 2–5 states for comparison chart.
                  </p>
                ))}
            </div>

            <SlipTop5
              rows={tableRows}
              status={(filters.statuses[0] ?? "Arrested") as StatusKey}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default SlipCapture;
