interface LoadParams {
  startDate?: string;
  endDate?: string;
  stateFilter?: string;
  type:
    | "cfpb"
    | "slip_cp"
    | "mesa"
    | "tp_tp"
    | "tp_cp"
    | "cp_cp"
    | "cp_tp"
    | "pp_pp"
    | "agency";
}

export async function loadAllMonthlyDataReal({
  startDate,
  endDate,
  stateFilter,
  type,
}: LoadParams): Promise<{ date: string; data: any }[]> {
  const results: { date: string; data: any }[] = [];

  const start = startDate ? new Date(startDate) : new Date("2025-08-01");
  const end = endDate ? new Date(endDate) : new Date("2025-08-31");

  const configMap: Record<string, { basePath: string; filePrefix: string }> = {
    cfpb: { basePath: "", filePrefix: "" },
    slip_cp: { basePath: "", filePrefix: "" },
    mesa: { basePath: "", filePrefix: "" },
    tp_tp: { basePath: "", filePrefix: "" },
    tp_cp: { basePath: "", filePrefix: "" },
    cp_cp: { basePath: "", filePrefix: "" },
    cp_tp: { basePath: "", filePrefix: "" },
    pp_pp: { basePath: "", filePrefix: "" },
    agency: {
      basePath: "/assets/data/enr_report/2025",
      filePrefix: "final_nested_state_district",
    },
  };

  const config = configMap[type];
  if (!config?.basePath || !config?.filePrefix) {
    console.warn(`No config found for type: ${type}`);
    return [];
  }

  const { basePath, filePrefix } = config;

  const current = new Date(start);
  while (current <= end) {
    const year = current.getFullYear();
    const month = String(current.getMonth() + 1).padStart(2, "0");
    const day = String(current.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    const fileName = `${filePrefix}_${day}_structured.json`;
    const filePath = `${basePath}/${month}/${day}/${fileName}`;

    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error("File not found");

      const json = await res.json();
      

      let filteredData = json;
      if (stateFilter) {
        filteredData = Array.isArray(json)
          ? json.filter((item: any) => item.state === stateFilter)
          : json.state === stateFilter
          ? json
          : null;
      }

      if (
        filteredData &&
        (Array.isArray(filteredData) ? filteredData.length > 0 : true)
      ) {
        results.push({
          date: dateStr,
          data: filteredData,
        });
      }
    } catch (err) {
      // console.warn(`Failed to load ${filePath}:`, err);
    }

    current.setDate(current.getDate() + 1); // move to next day
  }

  return results;
}
