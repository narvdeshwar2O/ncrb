import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { loadAllMonthlyData } from "@/utils/loadAllMonthlyData";
import { FilterState } from "../../components/filters/types/FilterTypes";
import RenderCard from "./comp/RenderCard";
import { AgencyFilters } from "./comp/AgencyFilters";
import computeCombinedTotal from "@/utils/computeCombinedTotal";
import { MultipleChart } from "./comp/MultipleChart";

interface DailyData {
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

function Agency() {
  const [allData, setAllData] = useState<DailyData[]>([]);
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    state: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      const loaded = await loadAllMonthlyData();
      setAllData(loaded);
    };
    fetchData();
  }, []);

  const filteredData = useMemo(() => {
    return allData.filter((entry) => {
      const {
        dateRange: { from, to },
        state,
      } = filters;

      // Date filtering
      const entryDate = new Date(entry.date);
      if (from && entryDate < from) return false;
      if (to && entryDate > to) return false;

      // State filtering - FIXED LOGIC
      if (!state || state === "All States") {
        return true;
      }

      let stateArray: string[] = [];
      if (Array.isArray(state)) {
        stateArray = state;
      } else if (typeof state === "string" && state.includes(",")) {
        // Handle comma-separated string
        stateArray = state.split(",").map((s) => s.trim());
      } else {
        stateArray = [state];
      }

      // Remove empty states and "All States" from the array
      const validStates = stateArray.filter((s) => s && s !== "All States");

      if (validStates.length === 0) {
        // No valid states selected, include all entries
        return true;
      }

      // Check if the entry has data for at least one of the selected states
      const hasMatchingState = validStates.some((selectedState) => {
        return selectedState in entry.data;
      });

      // Debug logging
      console.log("Entry date:", entry.date);
      console.log("Selected states:", validStates);
      console.log("Available states in entry:", Object.keys(entry.data));
      console.log("Has matching state:", hasMatchingState);

      return hasMatchingState;
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

  const selectedStateCount = selectedStates.filter(
    (s) => s && s !== "All States"
  ).length;

  // Debug logging for filtered data
  console.log("All data length:", allData.length);
  console.log("Filtered data length:", filteredData.length);
  console.log("Current filters:", filters);

  const tpTotal = useMemo(
    () => computeCombinedTotal(filteredData, "tp", filters),
    [filteredData, filters]
  );

  const cpTotal = useMemo(
    () => computeCombinedTotal(filteredData, "cp", filters),
    [filteredData, filters]
  );

  const meshaTotal = useMemo(
    () => computeCombinedTotal(filteredData, "mesha", filters),
    [filteredData, filters]
  );

  return (
    <div className="p-3">
      <div className="p-3 space-y-3 bg-background rounded-md shadow-lg border">
        <AgencyFilters onFiltersChange={setFilters} />
        <Card className="border-l-4 border-blue-600 bg-card shadow-sm">
          <CardContent className="py-4 px-6 text-sm text-muted-foreground">
            <p>
              <strong>You are currently viewing:</strong>{" "}
              <strong>{filteredData.length}</strong> days of data containing
              states and union territories:{" "}
              <strong>
                {selectedStateCount===0 ? "All states" : selectedStateCount}
              </strong>
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <RenderCard title="TP" total={tpTotal} />
          <RenderCard title="CP" total={cpTotal} />
          <RenderCard title="MESHA" total={meshaTotal} />
        </div>
        <MultipleChart
          tpTotal={tpTotal}
          cpTotal={cpTotal}
          mesaTotal={meshaTotal}
          filteredData={filteredData}
          filters={filters}
        />
      </div>
    </div>
  );
}

export default Agency;
