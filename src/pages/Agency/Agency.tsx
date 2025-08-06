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

function Agency() {
  const { data: allData, loading } = useMonthlyData("agency");
  // //console.log("object", allData[0].data);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: getLastNDaysRange(7),
    state: [allStates[0]],
    dataTypes: [...dataTypeOptions],
    categories: [...categoryOptions],
    districts: getDistrictsForStates([allStates[0]]),
  });

  const [showTable, setShowTable] = useState(false);
  const [showCompareChart, setCompareChart] = useState(false);

  useEffect(() => {
    const autoDistricts = getDistrictsForStates(filters.state || []);
    const shouldUpdateDistricts =
      !filters.districts ||
      filters.districts.length === 0 ||
      !filters.districts.every((d) => autoDistricts.includes(d));

    if (shouldUpdateDistricts) {
      setFilters((prev) => ({
        ...prev,
        districts: autoDistricts,
      }));
    }
  }, [filters.state.join(",")]);

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
      //console.log("filter date ranges", fromDate, toDate);
      if (
        !entryDate ||
        (fromDate && entryDate < fromDate) ||
        (toDate && entryDate > toDate)
      ) {
        return false;
      }
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

  const selectedStates = filters.state ?? [];
  const noStatesSelected = selectedStates.length === 0;

  const tableData = useMemo(() => {
    console.log("Data for table", allData);
    if (filters.districts.length === 0) {
      return {
        stateResult: {},
        districtResult: {},
      };
    }
    return aggregateByState(filteredData, filters);
  }, [filteredData, filters]);

  const noDistrictsSelectedUI =
    filters.state.length > 0 && filters.districts.length === 0;

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
  //console.log("total by category", filteredData);
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
        <AgencyFilters filters={filters} onFiltersChange={setFilters} />

        {noStatesSelected ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30">
            <p className="font-medium">
              No states selected. Use the <em>States</em> filter above to select
              one or more states.
            </p>
          </div>
        ) : noDistrictsSelectedUI ? (
          <div className="w-full p-6 text-center border rounded-md shadow-sm bg-muted/30 text-red-600">
            <p className="font-medium">
              No district selected. Please choose at least one district.
            </p>
          </div>
        ) : (
          <>
            <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
              <CardContent className="py-2 px-2 text-sm text-muted-foreground flex justify-between items-center">
                <p>
                  <strong>You are currently viewing:</strong>&nbsp;
                  <strong>{filteredData.length}</strong> days of data for&nbsp;
                  <strong>{`${selectedStates.length} state${
                    selectedStates.length > 1 ? "s" : ""
                  }`}</strong>
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
                        data={tableData.stateResult}
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
