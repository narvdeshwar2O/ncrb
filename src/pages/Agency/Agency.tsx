import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useMonthlyData } from "@/hooks/useMonthlyData";
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
import {
  categoryLabelMap,
  categoryOptions,
  dataTypeOptions,
  Totals,
} from "./types";
import { getDistrictsForStates } from "./utils";
import { LoadParams } from "@/utils/loadAllMonthlyDataRealData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function Agency() {
  const [loadAllData, setLoadAllData] = useState<LoadParams["type"]>("agency");
  const { data: allData, loading } = useMonthlyData(loadAllData);
  const isConsolidated = loadAllData === "agency_consoldated";

  const [filters, setFilters] = useState<FilterState>({
    dateRange: getLastNDaysRange(7),
    state: allStates,
    dataTypes: [...dataTypeOptions],
    categories: [...categoryOptions],
    districts: getDistrictsForStates(allStates),
  });

  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setCompareChart] = useState(false);
  const [comparisonType, setComparisonType] = useState<"state" | "district">(
    "state"
  );

  // keep districts synced with states
  useEffect(() => {
    const autoDistricts = getDistrictsForStates(filters.state || []);
    const shouldUpdateDistricts =
      !filters.districts ||
      filters.districts.length === 0 ||
      !filters.districts.every((d) => autoDistricts.includes(d));
    if (shouldUpdateDistricts)
      setFilters((prev) => ({ ...prev, districts: autoDistricts }));
  }, [filters.state.join(",")]);

  // fix swapped from/to
  useEffect(() => {
    setFilters((prev) => {
      const { from, to } = prev.dateRange;
      if (!from || !to) return prev;
      if (from > to) return { ...prev, dateRange: { from: to, to: from } };
      return prev;
    });
  }, [filters.dateRange]);

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
      if (
        !entryDate ||
        (fromDate && entryDate < fromDate) ||
        (toDate && entryDate > toDate)
      )
        return false;
      if (!state || state.length === 0) return false;
      const activeCategories = categories?.length
        ? categories
        : [...categoryOptions];
      return state.some((selectedState) => {
        const districts = entry.data[selectedState];
        if (!districts) return false;
        return Object.values(districts).some((districtData: any) =>
          Object.keys(districtData).some((cat) =>
            activeCategories.includes(cat)
          )
        );
      });
    });
  }, [allData, filters]);

  const tableData = useMemo(() => {
    if (!filters.districts || filters.districts.length === 0)
      return { stateResult: {}, districtResult: {} };
    return aggregateByState(filteredData, filters);
  }, [filteredData, filters]);

  const selectedStates = filters.state ?? [];
  const noStatesSelected = selectedStates.length === 0;
  const noDistrictsSelected = !filters.districts || filters.districts.length === 0;

  const activeCategories = filters.categories?.length
    ? filters.categories
    : [...categoryOptions];

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

  if (loading)
    return (
      <div className="p-6 flex justify-center items-center h-[calc(100vh-48px)]">
        <Skeleton className="h-8 w-48 mb-2 flex justify-center items-center">
          Loading...
        </Skeleton>
      </div>
    );

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <AgencyFilters
          filters={filters}
          onFiltersChange={setFilters}
          onLoadAllData={() => setLoadAllData("agency_consoldated")}
          onLoadDailyData={() => setLoadAllData("agency")}
        />

        {/* 🔹 guard checks */}
        {noStatesSelected ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No states selected. Use the <em>States</em> filter above.
            </p>
          </div>
        ) : noDistrictsSelected ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No districts selected. Use the <em>Districts</em> filter above.
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
                    {selectedStates.length} state
                    {selectedStates.length > 1 ? "s" : ""}
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
                {/* totals cards */}
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

                {/* charts */}
                <div className="border p-3 rounded-md">
                  <div className="flex flex-col-reverse">
                    {showCompareChart ? (
                      <></>
                    ) : (
                      <MultipleChart
                        filteredData={filteredData}
                        filters={filters}
                        activeCategories={filters.categories}
                        totalsByCategory={{
                          tp: computeCombinedTotal(filteredData, "tp", filters),
                          cp: computeCombinedTotal(filteredData, "cp", filters),
                          mesa: computeCombinedTotal(filteredData, "mesa", filters),
                        }}
                        categoryLabelMap={categoryLabelMap}
                      />
                    )}
                    <div className="flex justify-end gap-2 items-center">
                      {showCompareChart && (
                        <>
                          <label className="font-medium text-sm">Compare by:</label>
                          <Select
                            value={comparisonType}
                            onValueChange={(value) =>
                              setComparisonType(value as "state" | "district")
                            }
                          >
                            <SelectTrigger className="w-[140px] text-sm">
                              <SelectValue placeholder="Select comparison" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="state">State</SelectItem>
                              <SelectItem value="district">District</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                      <button
                        className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-md text-white text-sm font-medium w-fit"
                        onClick={() => setCompareChart((prev) => !prev)}
                      >
                        {showCompareChart
                          ? "Hide Comparison Chart"
                          : "Show Comparison Chart"}
                      </button>
                    </div>
                  </div>

                  {showCompareChart && (
                    <StateComparisonChart
                      data={tableData}
                      selectedStates={filters.state}
                      selectedDistricts={
                        comparisonType === "district" &&
                        selectedStates.length === 1
                          ? Object.keys(tableData.districtResult)
                          : filters.districts
                      }
                      dataTypes={filters.dataTypes}
                      categories={filters.categories}
                      comparisonType={comparisonType}
                    />
                  )}
                </div>

                {/* top 5 view */}
                <Top5DataView
                  allData={allData}
                  from={filters.dateRange.from}
                  to={filters.dateRange.to}
                  categories={filters.categories}
                  dataTypes={filters.dataTypes}
                  selectedStates={filters.state}
                />
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Agency;
