import getTopStatesByDateRange from "@/utils/getTopStatesByDateRange";
import ChartCard from "./ChartCard";
import { useMemo } from "react";
import { DailyData } from "../Agency";

interface Top5DataViewProps {
  allData: DailyData[];
  from: Date;
  to: Date;
}

export function Top5DataView({ allData, from, to }: Top5DataViewProps) {
  const { tp, cp, mesha } = useMemo(() => {
    return {
      tp: getTopStatesByDateRange(allData, from, to, "tp"),
      cp: getTopStatesByDateRange(allData, from, to, "cp"),
      mesha: getTopStatesByDateRange(allData, from, to, "mesha"),
    };
  }, [allData, from, to]);

  const formatData = (
    arr: { state: string; enrollment: number; hit: number; nohit: number }[],
    key: "enrollment" | "hit" | "nohit"
  ) =>
    arr.map((item) => ({
      state: item.state,
      value: item[key],
    }));

  return (
    <div className="space-y-3">
      {/* TP Section */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChartCard
          title="Top 5 States TP (Enrollment)"
          data={formatData(tp.enrollmentTop5, "enrollment")}
        />
        <ChartCard
          title="Top 5 States TP (Hit)"
          data={formatData(tp.hitTop5, "hit")}
        />
        <ChartCard
          title="Top 5 States TP (NoHit)"
          data={formatData(tp.nohitTop5, "nohit")}
        />
      </div>

      {/* CP Section */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChartCard
          title="Top 5 States CP (Enrollment)"
          data={formatData(cp.enrollmentTop5, "enrollment")}
        />
        <ChartCard
          title="Top 5 States CP (Hit)"
          data={formatData(cp.hitTop5, "hit")}
        />
        <ChartCard
          title="Top 5 States CP (NoHit)"
          data={formatData(cp.nohitTop5, "nohit")}
        />
      </div>

      {/* MESHA Section */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <ChartCard
          title="Top 5 States MESA (Enrollment)"
          data={formatData(mesha.enrollmentTop5, "enrollment")}
        />
        <ChartCard
          title="Top 5 States MESA (Hit)"
          data={formatData(mesha.hitTop5, "hit")}
        />
        <ChartCard
          title="Top 5 States MESA (NoHit)"
          data={formatData(mesha.nohitTop5, "nohit")}
        />
      </div>
    </div>
  );
}
