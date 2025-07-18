import { FilterState } from "@/components/filters/types/FilterTypes";
import { DailyData } from "@/pages/Agency/Agency";
import { StateData } from "@/pages/Agency/comp/AgencyTable";

function aggregateByState(filteredData: DailyData[], filters: FilterState): StateData {
  const result: StateData = {};

  filteredData.forEach((day) => {
    Object.entries(day.data).forEach(([state, categories]) => {
      // Check state filter
      if (
        filters.state.length &&
        !filters.state.includes(state) &&
        filters.state !== "All States"
      ) {
        return;
      }

      if (!result[state]) {
        result[state] = {
          tp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          cp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          mesha: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
        };
      }

      Object.entries(categories).forEach(([cat, values]) => {
        if (!filters.categories.includes(cat)) return;

        const categoryData = result[state][cat as "tp" | "cp" | "mesha"];
        filters.dataTypes.forEach((type) => {
          categoryData[type] += values[type];
        });
        categoryData.total += values.total;
      });
    });
  });

  return result;
}


export default aggregateByState;