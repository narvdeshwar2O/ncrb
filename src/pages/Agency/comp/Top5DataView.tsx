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
  categories: string[]; // <- loosen
  dataTypes: string[]; // <- loosen
}

const VALID_CATEGORIES: Category[] = ["tp", "cp", "mesa"];
const isValidCategory = (v: string): v is Category =>
  (VALID_CATEGORIES as string[]).includes(v);

export function Top5DataView({
  allData,
  from,
  to,
  categories,
  dataTypes,
}: Top5DataViewProps) {
  // Narrow + default to all if none valid
  const safeCategories: Category[] = categories.filter(isValidCategory);
  const activeCategories = safeCategories.length
    ? safeCategories
    : VALID_CATEGORIES;

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

  const formatData = (
    arr: { state: string; enrollment: number; hit: number; nohit: number }[],
    key: DataTypeKey
  ) =>
    arr.map((item) => ({
      state: item.state,
      value: item[key],
    }));

  // Filter which dataTypes to show
  const showEnrollment = dataTypes.includes("enrollment");
  const showHit = dataTypes.includes("hit");
  const showNoHit = dataTypes.includes("nohit");

  return (
    <div className="space-y-6">
      {activeCategories.map((category) => {
        const catData = topDataByCategory[category];
        return (
          <div key={category}>
            <h3 className="text-lg font-semibold mb-3">
              {category.toUpperCase()} - Top 5 States
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {showEnrollment && (
                <ChartCard
                  title={`${category.toUpperCase()} (Enrollment)`}
                  data={formatData(catData.enrollmentTop5, "enrollment")}
                />
              )}
              {showHit && (
                <ChartCard
                  title={`${category.toUpperCase()} (Hit)`}
                  data={formatData(catData.hitTop5, "hit")}
                />
              )}
              {showNoHit && (
                <ChartCard
                  title={`${category.toUpperCase()} (NoHit)`}
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
