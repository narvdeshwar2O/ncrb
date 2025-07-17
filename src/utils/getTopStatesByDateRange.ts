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

interface StateStats {
  state: string;
  enrollment: number;
  hit: number;
  nohit: number;
}

interface TopStatesResult {
  enrollmentTop5: StateStats[];
  hitTop5: StateStats[];
  nohitTop5: StateStats[];
}

function getTopStatesByDateRange(
  dailyData: DailyData[],
  from: Date,
  to: Date,
  category: "tp" | "cp" | "mesha" // ✅ Dynamic category parameter
): TopStatesResult {
  const stateAggregate: Record<string, { enrollment: number; hit: number; nohit: number }> = {};

  for (const day of dailyData) {
    const dayDate = new Date(day.date);
    if (dayDate < from || dayDate > to) continue;

    for (const [state, categories] of Object.entries(day.data)) {
      if (!stateAggregate[state]) {
        stateAggregate[state] = { enrollment: 0, hit: 0, nohit: 0 };
      }

      // ✅ Aggregate only the selected category
      if (categories[category]) {
        stateAggregate[state].enrollment += categories[category].enrollment;
        stateAggregate[state].hit += categories[category].hit;
        stateAggregate[state].nohit += categories[category].nohit;
      }
    }
  }

  const result: StateStats[] = Object.entries(stateAggregate).map(([state, values]) => ({
    state,
    ...values,
  }));

  // ✅ Sort individually for each metric
  const enrollmentTop5 = [...result].sort((a, b) => b.enrollment - a.enrollment).slice(0, 5);
  const hitTop5 = [...result].sort((a, b) => b.hit - a.hit).slice(0, 5);
  const nohitTop5 = [...result].sort((a, b) => b.nohit - a.nohit).slice(0, 5);

  return { enrollmentTop5, hitTop5, nohitTop5 };
}

export default getTopStatesByDateRange;
