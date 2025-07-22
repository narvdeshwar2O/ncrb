import getTopStatesByDateRange from "@/utils/getTopStatesByDateRange";
import ChartCard from "./ChartCard";
import { useMemo } from "react";
import type { DailyData } from "../Agency";

type Category = "tp" | "cp" | "mesa";
type DataTypeKey = "enrollment" | "hit" | "nohit";

interface Top5DataViewProps {
  allData: DailyData[];
  from: Date;
  to: Date;
  categories: string[];
  dataTypes: string[];
}

// Valid categories
const VALID_CATEGORIES: Category[] = ["tp", "cp", "mesa"];
const isValidCategory = (v: string): v is Category =>
  (VALID_CATEGORIES as string[]).includes(v);

// Friendly labels for categories
const categoryLabelMap: Record<Category, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

export function Top5DataView({
  allData,
  from,
  to,
  categories,
  dataTypes,
}: Top5DataViewProps) {
  // Filter categories safely
  const safeCategories: Category[] = categories.filter(isValidCategory);
  const activeCategories = safeCategories.length
    ? safeCategories
    : VALID_CATEGORIES;

  // Precompute top states per category
  const topDataByCategory = useMemo(() => {
    const result: Record<
      Category,
      ReturnType<typeof getTopStatesByDateRange>
    > = {
      tp: getTopStatesByDateRange(allData, from, to, "tp"),
      cp: getTopStatesByDateRange(allData, from, to, "cp"),
      mesa: getTopStatesByDateRange(allData, from, to, "mesa"),
    };
    return result;
  }, [allData, from, to]);

  // Utility: Format data for ChartCard
  const formatData = (
    arr: { state: string; enrollment: number; hit: number; nohit: number }[],
    key: DataTypeKey
  ) =>
    arr.map((item) => ({
      state: item.state,
      value: item[key],
    }));

  // Which metrics to show
  const showEnrollment = dataTypes.includes("enrollment");
  const showHit = dataTypes.includes("hit");
  const showNoHit = dataTypes.includes("nohit");

  return (
    <div className="space-y-6">
      {activeCategories.map((category) => {
        const label = categoryLabelMap[category];
        const catData = topDataByCategory[category];

        return (
          <div key={category} className="border p-3 rounded-md">
            <h3 className="text-lg font-semibold mb-3 text-center">
              {label} - Top 5 States
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showEnrollment && (
                <ChartCard
                  title={`${label} (Enrollment)`}
                  data={formatData(catData.enrollmentTop5, "enrollment")}
                />
              )}
              {showHit && (
                <ChartCard
                  title={`${label} (Hit)`}
                  data={formatData(catData.hitTop5, "hit")}
                />
              )}
              {showNoHit && (
                <ChartCard
                  title={`${label} (NoHit)`}
                  data={formatData(catData.nohitTop5, "nohit")}
                />
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
