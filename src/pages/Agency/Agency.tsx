import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import aggregateByState from "@/utils/agregateByStateForTable";
import computeCombinedTotal from "@/utils/computeCombinedTotal";

import RenderCard from "./ui/RenderCard";
import { AgencyFilters } from "./filters/AgencyFilters";
import { MultipleChart } from "./ui/MultipleChart";
import { Top5DataView } from "./ui/Top5DataView";
import AgencyTable from "./ui/AgencyTable";
import { StateComparisonChart } from "./ui/StateComparisonChart";

import { states as allStates } from "../../components/filters/data/statesData";
import { FilterState } from "../../components/filters/types/FilterTypes";
import { getLastNDaysRange } from "@/utils/getLastNdays";

export interface DailyData {
  date: string;
  data: Record<
    string,
    Record<
      string,
      { enrollment: number; hit: number; nohit: number; total: number }
    >
  >;
}

interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
  total?: number;
}

const dataTypeOptions = ["enrollment", "hit", "nohit"] as const;
const categoryOptions = ["tp", "cp", "mesa"] as const;

/** Friendly display names for categories. */
const categoryLabelMap: Record<string, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

function Agency() {
  const [allData, setAllData] = useState<DailyData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getLastNDaysRange(7),
    state: [...allStates],
    dataTypes: [...dataTypeOptions],
    categories: [...categoryOptions],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setCompareChart] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log("datarange", filters.dateRange);
  // --- Ensure valid date range whenever filters.dateRange changes
  useEffect(() => {
    setFilters((prev) => {
      const { from, to } = prev.dateRange;
      if (!from || !to) return prev;
      if (from > to) {
        return { ...prev, dateRange: { from: to, to: from } };
      }
      return prev;
    });
  }, [filters.dateRange]);

  // --- Load data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { from, to } = filters.dateRange;

      const startDate = from?.toISOString().split("T")[0];
      const endDate = to?.toISOString().split("T")[0];
      console.log("frwe", typeof filters.dateRange);
      const loaded = await loadAllMonthlyData({
        startDate,
        endDate,
        type: "cfpb",
      });
      setAllData(loaded);
      setLoading(false);
    };
    fetchData();
  }, [filters.dateRange]);

  // --- Filtered Data
  const filteredData = useMemo(() => {
    return allData.filter((entry) => {
      const {
        dateRange: { from, to },
        state,
        categories,
      } = filters;

      const normalize = (d: Date | undefined | null) =>
        d instanceof Date && !isNaN(d.getTime())
          ? new Date(d.getFullYear(), d.getMonth(), d.getDate())
          : undefined;

      const entryDate = normalize(new Date(entry.date));
      const fromDate = normalize(from);
      const toDate = normalize(to);

      // Skip if entryDate is invalid
      if (!entryDate) return false;

      if (fromDate && entryDate < fromDate) return false;
      if (toDate && entryDate > toDate) return false;

      const activeCategories = categories?.length
        ? categories
        : [...categoryOptions];

      // Empty state array => show no data
      if (!state || state.length === 0) return false;

      return state.some((selectedState) => {
        if (!(selectedState in entry.data)) return false;
        const categoryKeys = Object.keys(entry.data[selectedState]);
        return categoryKeys.some((cat) => activeCategories.includes(cat));
      });
    });
  }, [allData, filters]);

  console.log("data", filteredData);

  // Selected states
  const selectedStates = filters.state;
  const noStatesSelected = selectedStates.length === 0;

  // Table Data
  const tableData = useMemo(
    () => aggregateByState(filteredData, filters),
    [filteredData, filters]
  );

  const activeCategories = filters.categories?.length
    ? filters.categories
    : [...categoryOptions];

  // Totals by Category
  const totalsByCategory = useMemo(() => {
    const map: Record<string, Totals> = {};
    activeCategories.forEach((cat) => {
      map[cat] = computeCombinedTotal(
        filteredData,
        cat as "tp" | "cp" | "mesa",
        filters
      );
    });
    return map;
  }, [filteredData, filters, activeCategories]);

  // Loading
  if (loading) {
    return (
      <div className="p-6 flex justify-center max-w-80 items-center h-[calc(100vh-48px)]">
        <div className="flex flex-col items-center gap-2">
          <Skeleton className="h-8 w-48 mb-2 flex items-center justify-center">
            Loading...
          </Skeleton>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <AgencyFilters filters={filters} onFiltersChange={setFilters} />

        {noStatesSelected ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No states selected. Use the <em>States</em> filter above to select
              one or more states.
            </p>
          </div>
        ) : (
          <>
            <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
              <CardContent className="py-2 px-2 text-sm text-muted-foreground flex justify-between items-center">
                <p>
                  <strong>You are currently viewing:</strong>{" "}
                  <strong>{filteredData.length}</strong> days of data for{" "}
                  <strong>
                    {`${selectedStates.length} state${
                      selectedStates.length > 1 ? "s" : ""
                    }`}
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
              <AgencyTable data={tableData} filters={filters} />
            ) : filters.dataTypes.length > 0 &&
              filters.categories.length > 0 ? (
              <>
                {/* Summary Cards w/ friendly category names */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {activeCategories.map((cat) => (
                    <RenderCard
                      key={cat}
                      title={categoryLabelMap[cat] ?? cat.toUpperCase()}
                      total={totalsByCategory[cat]}
                      selectedDataTypes={filters.dataTypes}
                    />
                  ))}
                </div>

                <div className="border p-3 rounded-md flex flex-col items-end">
                  <button
                    className="bg-blue-600 px-3 py-2 rounded-md text-card font-semibold text-white max-w-[20%] text-nowrap"
                    onClick={() => setCompareChart((prev) => !prev)}
                  >
                    {showCompareChart
                      ? "Hide Comparison Chart"
                      : "Show Comparison Chart"}
                  </button>

                  {showCompareChart ? (
                    selectedStates.length >= 2 &&
                    selectedStates.length <= 15 ? (
                      <StateComparisonChart
                        data={tableData}
                        selectedStates={selectedStates}
                        dataTypes={filters.dataTypes}
                        categories={filters.categories}
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
                    <MultipleChart
                      filteredData={filteredData}
                      filters={filters}
                      activeCategories={filters.categories}
                      totalsByCategory={{
                        tp: computeCombinedTotal(filteredData, "tp", filters),
                        cp: computeCombinedTotal(filteredData, "cp", filters),
                        mesa: computeCombinedTotal(
                          filteredData,
                          "mesa",
                          filters
                        ),
                      }}
                      categoryLabelMap={categoryLabelMap}
                    />
                  )}
                </div>

                <Top5DataView
                  allData={allData}
                  from={filters.dateRange.from}
                  to={filters.dateRange.to}
                  categories={filters.categories}
                  dataTypes={filters.dataTypes}
                />
              </>
            ) : (
              <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
                <p className="font-medium">
                  No data type selected. Use the <em>Data Types</em> or{" "}
                  <em>Categories</em> filter above to select one or more data
                  types.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Agency;
