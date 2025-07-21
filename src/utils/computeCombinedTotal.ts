import getTotal from "./getTotal";
import { FilterState } from "@/components/filters/types/FilterTypes";

interface Totals {
  enrollment: number;
  hit: number;
  nohit: number;
  total: number;
}

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

const computeCombinedTotal = (
  filteredData: DailyData[],
  source: "tp" | "cp" | "mesa",
  filters: FilterState
): Totals => {
  let statesToUse: string[] = [];

  // Prepare statesToUse
  if (
    !filters.state ||
    filters.state === "All States" ||
    (Array.isArray(filters.state) && filters.state.length === 0)
  ) {
    statesToUse = Array.from(
      new Set(filteredData.flatMap((entry) => Object.keys(entry.data)))
    );
  } else if (Array.isArray(filters.state)) {
    statesToUse = filters.state.filter(
      (state) => state && state !== "All States"
    );
  } else {
    statesToUse = filters.state
      .split(",")
      .map((state) => state.trim())
      .filter((state) => state && state !== "All States");
  }

  const result = getTotal(filteredData, source, statesToUse);

  // Filter based on selected dataTypes
  const allowed =
    filters.dataTypes && filters.dataTypes.length > 0
      ? filters.dataTypes
      : ["enrollment", "hit", "nohit"]; // fallback to show all if nothing selected

  return {
    enrollment: allowed.includes("enrollment") ? result.enrollment : 0,
    hit: allowed.includes("hit") ? result.hit : 0,
    nohit: allowed.includes("nohit") ? result.nohit : 0,
    total: result.total, // optional: you can adjust this too based on what's selected
  };
};

export default computeCombinedTotal;
