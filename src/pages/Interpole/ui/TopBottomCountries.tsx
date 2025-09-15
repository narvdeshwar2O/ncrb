"use client";

import { useMemo } from "react";
import getTopCountriesByDateRange from "../utils";
import ChartCard from "@/pages/agency/ui/ChartCard";

interface Props {
  allData: {
    date: string;
    data: { country: string; agency: string; count: number }[];
  }[];
  from: Date;
  to: Date;
}

const TopBottomCountries = ({ allData, from, to }: Props) => {
  const { top5, bottom5 } = useMemo(
    () => getTopCountriesByDateRange(allData, from, to),
    [allData, from, to]
  );

  return (
    <div className="grid grid-cols-2 gap-3">
      {/* Top 5 */}
      <div>
        <h2 className="text-lg font-bold mb-3">Top 5 Countries</h2>
        <ChartCard
          title="Top 5 Countries"
          data={top5.map((c) => ({ state: c.country, value: c.total }))}
        />
      </div>

      {/* Bottom 5 */}
      <div>
        <h2 className="text-lg font-bold mb-3">Bottom 5 Countries</h2>
        <ChartCard
          title="Bottom 5 Countries"
          data={bottom5.map((c) => ({ state: c.country, value: c.total }))}
        />
      </div>
    </div>
  );
};

export default TopBottomCountries;
