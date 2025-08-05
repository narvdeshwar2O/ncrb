import {
  DailyData,
  StateStats,
  CategoryKey,
} from "@/pages/agency/types";

interface TopStatesResult {
  hitTop5: StateStats[];
  nohitTop5: StateStats[];
}

export function getTopStatesByDateRange(
  data: DailyData[] | undefined,
  from: Date,
  to: Date,
  selectedCategory: CategoryKey
): TopStatesResult {
  if (!Array.isArray(data)) {
    console.warn("Invalid data passed to getTopStatesByDateRange:", data);
    return {
      hitTop5: [],
      nohitTop5: [],
    };
  }

  const stateAggregate: Record<string, StateStats> = {};

  for (const day of data) {
    const date = new Date(day.date);
    if (date < from || date > to) continue;

    for (const [state, districts] of Object.entries(day.data)) {
      if (state.toLowerCase() === "total") continue;

      if (!stateAggregate[state]) {
        stateAggregate[state] = {
          state,
          hit: 0,
          nohit: 0,
          districts: [],
        };
      }

      for (const [district, categories] of Object.entries(districts)) {
        const cat = categories[selectedCategory];
        if (!cat) continue;

        const stateData = stateAggregate[state];
        const existingDistrict = stateData.districts.find(
          (d) => d.district === district
        );

        if (existingDistrict) {
          existingDistrict.hit += cat.hit;
          existingDistrict.nohit += cat.nohit;
        } else {
          stateData.districts.push({
            district,
            hit: cat.hit,
            nohit: cat.nohit,
          });
        }

        stateData.hit += cat.hit;
        stateData.nohit += cat.nohit;
      }
    }
  }

  const stateList = Object.values(stateAggregate);

  return {
    hitTop5: [...stateList].sort((a, b) => b.hit - a.hit).slice(0, 5),
    nohitTop5: [...stateList].sort((a, b) => b.nohit - a.nohit).slice(0, 5),
  };
}

export default getTopStatesByDateRange;
