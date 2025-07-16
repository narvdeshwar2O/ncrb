interface TypeData {
  enrollment: number;
  hit: number;
  nohit: number;
  total: number;
}

interface AggregatedStateData {
  [state: string]: {
    tp: TypeData;
    cp: TypeData;
    mesha: TypeData;
  };
}
export function aggregateStateData(
  data: {
    date: string;
    data: Record<string, Record<"tp" | "cp" | "mesha", TypeData>>;
  }[],
  selectedState: string = "All States"
): AggregatedStateData {
  const result: AggregatedStateData = {};

  for (const day of data) {
    for (const state in day.data) {
      if (selectedState !== "All States" && state !== selectedState) continue;

      if (!result[state]) {
        result[state] = {
          tp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          cp: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
          mesha: { enrollment: 0, hit: 0, nohit: 0, total: 0 },
        };
      }

      for (const type of ["tp", "cp", "mesha"] as const) {
        const current = day.data[state]?.[type];
        if (!current) continue;

        result[state][type].enrollment += current.enrollment ?? 0;
        result[state][type].hit += current.hit ?? 0;
        result[state][type].nohit += current.nohit ?? 0;
        result[state][type].total += current.total ?? 0;
      }
    }
  }

  return result;
}
