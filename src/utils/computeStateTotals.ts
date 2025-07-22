import { DailyData } from "@/pages/agency/Agency";
import { StateData } from "@/pages/agency/ui/AgencyTable";

function computeStateTotals(filteredData: DailyData[]): StateData {
  const stateMap: StateData = {};
  filteredData.forEach((day) => {
    for (const [state, cats] of Object.entries(day.data)) {
      if (!stateMap[state]) {
        stateMap[state] = {
          tp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          cp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          mesa: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
        };
      }
      for (const [cat, values] of Object.entries(cats)) {
        stateMap[state][cat as "tp" | "cp" | "mesa"].enrollment +=
          values.enrollment;
        stateMap[state][cat as "tp" | "cp" | "mesa"].hit += values.hit;
        stateMap[state][cat as "tp" | "cp" | "mesa"].nohit += values.nohit;
        stateMap[state][cat as "tp" | "cp" | "mesa"].total += values.total;
      }
    }
  });
  return stateMap;
}

export default computeStateTotals;
