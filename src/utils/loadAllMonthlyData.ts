interface LoadParams {
  startDate?: string;
  endDate?: string;
  stateFilter?: string;
  type: "cfpb" | "slip_cp"|"mesa"|"tp_tp"|"tp_cp"|"cp_cp"
}

export async function loadAllMonthlyData({
  startDate,
  endDate,
  stateFilter,
  type,
}: LoadParams): Promise<{ date: string; data: any }[]> {
  const results: { date: string; data: any }[] = [];

  const defaultMonths = ["04", "05", "06", "07"];

  const start = startDate ? new Date(startDate) : undefined;
  const end = endDate ? new Date(endDate) : undefined;

  // Define dynamic path and filename patterns based on `type`
  const config = {
    cfpb: {
      basePath: "/assets/data/cfpb_generic_report/2025",
      filePrefix: "cfpb_gr_output",
    },
    slip_cp: {
      basePath: "/assets/data/slip_capture/2025",
      filePrefix: "slip_cp_output",
    },
    mesa: {
      basePath: "/assets/data/mesa/2025",
      filePrefix: "mesa_tp_output",
    },
    tp_tp: {
      basePath: "/assets/data/trace_report_tp_tp/2025",
      filePrefix: "tp_tp_output",
    },
    tp_cp: {
      basePath: "/assets/data/trace_report_tp_cp/2025",
      filePrefix: "tp_cp_output",
    },
    cp_cp: {
      basePath: "/assets/data/trace_report_cp_cp/2025",
      filePrefix: "cp_cp_output",
    },
  };

  const { basePath, filePrefix } = config[type];

  for (const month of defaultMonths) {
    for (let day = 1; day <= 31; day++) {
      const dayStr = String(day).padStart(2, "0");
      const fullDateStr = `2025-${month}-${dayStr}`;
      const currentDate = new Date(fullDateStr);

      // Skip if out of optional date range
      if ((start && currentDate < start) || (end && currentDate > end)) {
        continue;
      }

      // Build file name & path dynamically
      const fileName = `${filePrefix}_${month}_${dayStr}_2025.json`;
      console.log("fileName",fileName)
      const filePath = `${basePath}/${month}/daily/${fileName}`;
      
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

        if (
          filteredData &&
          (Array.isArray(filteredData) ? filteredData.length > 0 : true)
        ) {
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
  console.log("result", results);
  return results;
}
