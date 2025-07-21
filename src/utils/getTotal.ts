export default function getTotal(
  data: {
    date: string;
    data: Record<
      string,
      Record<
        string,
        { enrollment: number; hit: number; nohit: number; total: number }
      >
    >;
  }[],
  type: "tp" | "cp" | "mesa",
  filterState?: string | string[] // support both single or multiple
): { enrollment: number; hit: number; nohit: number; total: number } {
  const total = { enrollment: 0, hit: 0, nohit: 0, total: 0 };

  for (const day of data) {
    let states: string[] = [];

    if (!filterState || filterState === "All States") {
      // Include all states in the day's data
      states = Object.keys(day.data);
    } else if (Array.isArray(filterState)) {
      // Use array of selected states (multi-select)
      states = filterState;
    } else {
      // Single state selected
      states = [filterState];
    }

    for (const state of states) {
      const record = day.data[state]?.[type];
      if (record) {
        total.enrollment += record.enrollment ?? 0;
        total.hit += record.hit ?? 0;
        total.nohit += record.nohit ?? 0;
        total.total += record.total ?? record.hit + record.nohit;
      }
    }
  }

  return total;
}
