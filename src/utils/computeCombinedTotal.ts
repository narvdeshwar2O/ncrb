import { DailyData } from "@/pages/agency/types";
import { FilterState } from "../components/filters/types/FilterTypes";

export default function computeCombinedTotal(
  data: DailyData[],
  category: "tp" | "cp" | "mesa",
  filters: FilterState
) {
  const total = {
    hit: 0,
    nohit: 0,
    total: 0,
    enrol: 0,
  };

  const selectedStates = filters.state ?? [];
  const selectedDistricts = filters.districts ?? [];
  

  if (selectedStates.length === 0) return total;

  data.forEach((entry, entryIndex) => {
    

    selectedStates.forEach((state) => {
      const districts = entry.data[state];
      if (!districts) {
        return;
      }

      Object.entries(districts).forEach(([districtName, districtData]) => {
        const includeDistrict =
          selectedDistricts.length === 0 ||
          selectedDistricts.some(
            (d) => d.toLowerCase() === districtName.toLowerCase()
          );

        

        if (!includeDistrict) {
          return;
        }

        if (!districtData[category]) {
          return;
        }

        const catData = districtData[category];

        total.hit += catData.hit || 0;
        total.nohit += catData.nohit || 0;
        total.total += catData.total || 0;
        total.enrol += catData.enrol || 0;
      });
    });
  });

  return total;
}
