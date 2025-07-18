import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import { FilterState } from "../../components/filters/types/FilterTypes";
import RenderCard from "./comp/RenderCard";
import { AgencyFilters } from "./comp/AgencyFilters";
import computeCombinedTotal from "@/utils/computeCombinedTotal";
import { MultipleChart } from "./comp/MultipleChart";
import { Top5DataView } from "./comp/Top5DataView";
import AgencyTable from "./comp/AgencyTable";
import aggregateByState from "@/utils/agregateByStateForTable";
import computeStateTotals from "@/utils/computeStateTotals";
import { StateComparisonChart } from "./comp/StateComparisonChart";
import { Skeleton } from "@/components/ui/skeleton";

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
const getLast7DaysRange = () => {
  const today = new Date();
  const to = today;
  const from = new Date();
  from.setDate(today.getDate() - 7);
  return { from, to };
};
const dataTypeOptions = ["enrollment", "hit", "nohit"] as const;
const categoryOptions = ["tp", "cp", "mesha"] as const;

function Agency() {
  const [allData, setAllData] = useState<DailyData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: getLast7DaysRange(),
    state: [],
    dataTypes: [...dataTypeOptions],
    categories: [...categoryOptions],
  });
  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setCompareChart] = useState(false);
  const [loading, setLoading] = useState(true);
  console.log("All data", allData);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyData({ type: "cfpb" });
      setAllData(loaded);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter((entry) => {
      const {
        dateRange: { from, to },
        state,
        categories,
      } = filters;

      const entryDate = new Date(entry.date);

      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;

      if (!state || state === "All States") return true;

      let stateArray: string[] = [];
      if (Array.isArray(state)) {
        stateArray = state;
      } else if (typeof state === "string" && state.includes(",")) {
        stateArray = state.split(",").map((s) => s.trim());
      } else {
        stateArray = [state];
      }

      const validStates = stateArray.filter((s) => s && s !== "All States");
      if (validStates.length === 0) return true;

      return validStates.some((selectedState) => {
        // Check if the selected state exists AND category filter applies
        if (!(selectedState in entry.data)) return false;

        const categoryKeys = Object.keys(entry.data[selectedState]);
        const activeCategories = categories?.length
          ? categories
          : ["tp", "cp", "mesha"];

        return categoryKeys.some((cat) => activeCategories.includes(cat));
      });
    });
  }, [allData, filters]);

  const selectedStates = useMemo(() => {
    if (!filters.state || filters.state === "All States") return [];

    if (Array.isArray(filters.state)) return filters.state;

    // Handle comma-separated string or single string
    return filters.state.includes(",")
      ? filters.state.split(",").map((s) => s.trim())
      : [filters.state];
  }, [filters.state]);
  const tableData = useMemo(() => {
    return aggregateByState(filteredData, filters);
  }, [filteredData, filters]);

  const selectedStateCount = selectedStates.filter(
    (s) => s && s !== "All States"
  ).length;
  const activeCategories = filters.categories?.length
    ? filters.categories
    : ["tp", "cp", "mesha"];

  const totalsByCategory = useMemo(() => {
    const map: Record<string, Totals> = {};
    activeCategories.forEach((cat) => {
      map[cat] = computeCombinedTotal(
        filteredData,
        cat as "tp" | "cp" | "mesha",
        filters
      );
    });
    return map;
  }, [filteredData, filters, activeCategories]);
  const stateComp = useMemo(
    () => computeStateTotals(filteredData),
    [filteredData]
  );

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
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
        <AgencyFilters onFiltersChange={setFilters} />
        <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
          <CardContent className="py-2 px-2 text-sm text-muted-foreground flex justify-between items-center">
            <p>
              <strong>You are currently viewing:</strong>{" "}
              <strong>{filteredData.length}</strong> days of data containing
              states and union territories:{" "}
              <strong>
                {selectedStateCount === 0 ? "All states" : selectedStateCount}
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
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {activeCategories.map((cat) => (
                <RenderCard
                  key={cat}
                  title={cat.toUpperCase()}
                  total={totalsByCategory[cat]}
                  selectedDataTypes={filters.dataTypes}
                />
              ))}
            </div>
            <div className="border p-3 rounded-md flex flex-col items-end">
              <button
                className={`bg-blue-600 px-3 py-2 rounded-md text-card font-semibold text-white max-w-[20%] text-nowrap`}
                onClick={() => setCompareChart((prev) => !prev)}
              >
                {showCompareChart
                  ? "Hide Comparison Chart"
                  : "Show Comparision Chart"}
              </button>

              {showCompareChart ? (
                selectedStates.length >= 2 && selectedStates.length <= 5 ? (
                  <>
                    {selectedStates.length >= 2 && (
                      <StateComparisonChart
                        data={tableData}
                        selectedStates={selectedStates}
                      />
                    )}
                  </>
                ) : (
                  <>
                    <div className="w-full p-3 flex justify-center items-center">
                      <p className="border shadow-md p-3 rounded-md">
                        Please select at least 2 and at most 5 states for chart
                        comparison.
                      </p>
                    </div>
                  </>
                )
              ) : (
                <MultipleChart
                  filteredData={filteredData}
                  filters={filters}
                  activeCategories={filters.categories}
                  totalsByCategory={{
                    tp: computeCombinedTotal(filteredData, "tp", filters),
                    cp: computeCombinedTotal(filteredData, "cp", filters),
                    mesha: computeCombinedTotal(filteredData, "mesha", filters),
                  }}
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
        )}
      </div>
    </div>
  );
}

export default Agency;
