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

interface DistrictStats {
  district: string;
  enrollment: number;
  hit: number;
  nohit: number;
}

interface StateStats {
  state: string;
  enrollment: number;
  hit: number;
  nohit: number;
  districts: DistrictStats[];
}

interface TopStatesResult {
  enrollmentTop5: StateStats[];
  hitTop5: StateStats[];
  nohitTop5: StateStats[];
}

export function getTopStatesByDateRange(
  data: DailyData[] | undefined,
  from: Date,
  to: Date,
  selectedCategory: "tp" | "cp" | "mesa"
): TopStatesResult {
  if (!Array.isArray(data)) {
    console.warn("Invalid data passed to getTopStatesByDateRange:", data);
    return {
      enrollmentTop5: [],
      hitTop5: [],
      nohitTop5: [],
    };
  }

  const stateAggregate: Record<string, StateStats> = {};

  for (const day of data) {
    const date = new Date(day.date);
    if (date < from || date > to) continue;

    for (const [state, districts] of Object.entries(day.data)) {
      if (!stateAggregate[state]) {
        stateAggregate[state] = {
          state,
          enrollment: 0,
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
          existingDistrict.enrollment += cat.enrollment;
          existingDistrict.hit += cat.hit;
          existingDistrict.nohit += cat.nohit;
        } else {
          stateData.districts.push({
            district,
            enrollment: cat.enrollment,
            hit: cat.hit,
            nohit: cat.nohit,
          });
        }

        stateData.enrollment += cat.enrollment;
        stateData.hit += cat.hit;
        stateData.nohit += cat.nohit;
      }
    }
  }

  const stateList = Object.values(stateAggregate);

  return {
    enrollmentTop5: [...stateList]
      .sort((a, b) => b.enrollment - a.enrollment)
      .slice(0, 5),
    hitTop5: [...stateList].sort((a, b) => b.hit - a.hit).slice(0, 5),
    nohitTop5: [...stateList].sort((a, b) => b.nohit - a.nohit).slice(0, 5),
  };
}

export default getTopStatesByDateRange;
