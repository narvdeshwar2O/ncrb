export interface LoadParams {
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
    | "agency"
    | "agency_consoldated";
}

export async function loadAllMonthlyDataReal({
  startDate,
  endDate,
  stateFilter,
  type,
}: LoadParams): Promise<{ date: string; data: any }[]> {
  const results: { date: string; data: any }[] = [];

  const start = startDate ? new Date(startDate) : new Date("2025-01-01");
  const end = endDate ? new Date(endDate) : new Date("2025-12-31");

  const configMap: Record<string, { basePath: string; filePrefix: string }> = {
    cfpb: { basePath: "", filePrefix: "" },
    slip_cp: {
      basePath: "/assets/data/slip_capture/2025",
      filePrefix: "final_nested_state_district_acts",
    },
    mesa: { basePath: "/assets/data/mesa/2025", filePrefix: "final_nested_state_district_acts" },
    tp_tp: { basePath: "", filePrefix: "" },
    tp_cp: { basePath: "", filePrefix: "" },
    cp_cp: { basePath: "", filePrefix: "" },
    cp_tp: { basePath: "", filePrefix: "" },
    pp_pp: { basePath: "", filePrefix: "" },
    agency: {
      basePath: "/assets/data/enr_report/2025",
      filePrefix: "final_nested_state_district",
    },
    agency_consoldated: {
      basePath: "/assets/data/enr_report",
      filePrefix: "all_consolidated_data.json",
    },
  };

  const config = configMap[type];
  if (!config?.basePath || !config?.filePrefix) {
    console.warn(`No config found for type: ${type}`);
    return [];
  }

  const { basePath, filePrefix } = config;

  // ✅ Handle consolidated data separately
  if (type === "agency_consoldated") {
    const filePath = `${basePath}/${filePrefix}`;
    try {
      const res = await fetch(filePath);
      if (!res.ok) throw new Error("File not found");

      const json = await res.json();

      let filteredData = json;
      if (stateFilter) {
        // If JSON is an object with states as keys
        if (typeof json === "object" && !Array.isArray(json)) {
          filteredData = json[stateFilter]
            ? { [stateFilter]: json[stateFilter] }
            : {};
        } else if (Array.isArray(json)) {
          filteredData = json.filter((item: any) => item.state === stateFilter);
        }
      }

      results.push({
        date: "ALL",
        data: filteredData,
      });
    } catch (err) {
      console.warn(`Failed to load ${filePath}:`, err);
    }

    return results;
  }

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
      // Ignore missing files silently
    }

    current.setDate(current.getDate() + 1);
  }

  return results;
}
