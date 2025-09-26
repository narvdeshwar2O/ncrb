import { CategoryKey, DailyData, StateStats } from "@/pages/agency/types/types";

interface TopStatesResult {
  hitTop5: StateStats[];
  nohitTop5: StateStats[];
  enrolTop5: StateStats[];
  deleteTop5: StateStats[];
}

export function getTopStates(
  data: DailyData[] | undefined,
  selectedCategory: CategoryKey
): TopStatesResult {
  if (!Array.isArray(data)) {
    console.warn("Invalid data passed to getTopStates:", data);
    return { hitTop5: [], nohitTop5: [], enrolTop5: [], deleteTop5: [] };
  }

  const stateAggregate: Record<string, StateStats> = {};

  for (const day of data) {
    for (const [state, districts] of Object.entries(day.data)) {
      if (state.toLowerCase() === "total") continue;

      if (!stateAggregate[state]) {
        stateAggregate[state] = {
          state,
          hit: 0,
          nohit: 0,
          enrol: 0,
          delete: 0,
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
          existingDistrict.hit += cat.hit ?? 0;
          existingDistrict.nohit += cat.nohit ?? 0;
          existingDistrict.enrol += cat.enrol ?? 0;
          existingDistrict.delete += cat.delete ?? 0;
        } else {
          stateData.districts.push({
            district,
            hit: cat.hit ?? 0,
            nohit: cat.nohit ?? 0,
            enrol: cat.enrol ?? 0,
            delete: cat.delete ?? 0,
          });
        }

        stateData.hit += cat.hit ?? 0;
        stateData.nohit += cat.nohit ?? 0;
        stateData.enrol += cat.enrol ?? 0;
        stateData.delete += cat.delete ?? 0;
      }
    }
  }

  const stateList = Object.values(stateAggregate);

  return {
    hitTop5: [...stateList].sort((a, b) => b.hit - a.hit).slice(0, 5),
    nohitTop5: [...stateList].sort((a, b) => b.nohit - a.nohit).slice(0, 5),
    enrolTop5: [...stateList].sort((a, b) => b.enrol - a.enrol).slice(0, 5),
    deleteTop5: [...stateList].sort((a, b) => b.delete - a.delete).slice(0, 5),
  };
}

export default getTopStates;
