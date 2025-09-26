import { useEffect, useState } from "react";

import { DailyData } from "@/pages/agency/types";
import { loadAllMonthlyDataReal } from "@/utils/loadAllMonthlyDataRealData";

type DataType =
  | "cfpb"
  | "mesa"
  | "slip_cp"
  | "tp_tp"
  | "tp_cp"
  | "cp_cp"
  | "cp_tp"
  | "pp_pp"
  | "agency"
  | "agency_consoldated"
  | "interpol";

type UseMonthlyDataReturn = {
  data: DailyData[];
  loading: boolean;
};

export function useMonthlyData(type: DataType): UseMonthlyDataReturn {
  const [data, setData] = useState<DailyData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const loaded = await loadAllMonthlyDataReal({ type });

      const normalized = loaded.map((entry) => ({
        ...entry,
        data: entry.data.state,
      }));

      setData(normalized);
      setLoading(false);
    };

    fetchData();
  }, [type]);

  return { data, loading };
}
