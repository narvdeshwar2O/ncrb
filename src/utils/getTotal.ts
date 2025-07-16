export default function getTotal(
  data: {
    date: string;
    data: Record<string, Record<string, { enrollment: number; hit: number; nohit: number; total: number }>>;
  }[],
  type: "tp" | "cp" | "mesha",
  filterState?: string // optional state filter
): { enrollment: number; hit: number; nohit: number; total: number } {
  const total = { enrollment: 0, hit: 0, nohit: 0, total: 0 };

  for (const day of data) {
    const states = filterState === "All States" || !filterState
      ? Object.keys(day.data)
      : [filterState];

    for (const state of states) {
      const record = day.data[state]?.[type];
      if (record) {
        total.enrollment += record.enrollment ?? 0;
        total.hit += record.hit ?? 0;
        total.nohit += record.nohit ?? 0;
        total.total += record.total ?? (record.hit + record.nohit);
      }
    }
  }

  return total;
}
