export async function loadAllMonthlyData(
  startDate?: string,  // Optional: e.g., "2025-04-10"
  endDate?: string,    // Optional: e.g., "2025-06-20"
  stateFilter?: string // Optional: e.g., "Maharashtra"
): Promise<{ date: string; data: any }[]> {
  const results: { date: string; data: any }[] = [];

  const defaultMonths = ["04", "05", "06","07"];

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  for (const month of defaultMonths) {
    for (let day = 1; day <= 31; day++) {
      const dayStr = String(day).padStart(2, "0");
      const fullDateStr = `2025-${month}-${dayStr}`;
      const currentDate = new Date(fullDateStr);

      // Skip if out of optional date range
      if (
        (start && currentDate < start) ||
        (end && currentDate > end)
      ) {
        continue;
      }

      const fileName = `cfpb_gr_output_${month}_${dayStr}_2025.json`;
      const filePath = `/assets/data/cfpb_generic_report/2025/${month}/daily/${fileName}`;

      try {
        const res = await fetch(filePath);
        if (!res.ok) throw new Error("File not found");

        const json = await res.json();

        // Filter by state (if provided)
        let filteredData = json;
        if (stateFilter) {
          filteredData = Array.isArray(json)
            ? json.filter((item: any) => item.state === stateFilter)
            : json.state === stateFilter
            ? json
            : null;
        }

        if (filteredData && (Array.isArray(filteredData) ? filteredData.length > 0 : true)) {
          results.push({
            date: fullDateStr,
            data: filteredData,
          });
        }
      } catch (err) {
        continue;
      }
    }
  }

  return results;
}
