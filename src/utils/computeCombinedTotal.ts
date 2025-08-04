import { DailyData } from "@/pages/agency/types";
import { FilterState } from "../components/filters/types/FilterTypes";

export default function computeCombinedTotal(
  data: DailyData[],
  category: "tp" | "cp" | "mesa",
  filters: FilterState
) {
  const total = {
    enrollment: 0,
    hit: 0,
    nohit: 0,
    others: 0,
  };

  const selectedDistricts = filters.districts ?? []; // Default to empty array

  data.forEach((entry) => {
    filters.state.forEach((state) => {
      const districts = entry.data[state];
      if (!districts) return;

      Object.entries(districts).forEach(
        ([districtName, districtData]: [string, any]) => {
          const includeDistrict =
            selectedDistricts.length === 0 ||
            selectedDistricts.includes(districtName);
          if (!includeDistrict || !districtData[category]) return;

          const catData = districtData[category];
          total.enrollment += catData.enrollment || 0;
          total.hit += catData.hit || 0;
          total.nohit += catData.nohit || 0;
          total.others += catData.others || 0;
        }
      );
    });
  });

  return total;
}
