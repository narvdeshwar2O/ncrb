import { DailyData } from "@/pages/agency/utils";
import { FilterState } from "../components/filters/types/FilterTypes";

export default function aggregateByState(
  data: DailyData[],
  filters: FilterState
) {
  const result: Record<string, any> = {};
  const selectedDistricts = filters.districts ?? [];

  data.forEach((entry) => {
    filters.state.forEach((state) => {
      const districts = entry.data[state];
      if (!districts) return;

      if (!result[state]) {
        result[state] = {};
        filters.categories.forEach((cat) => {
          result[state][cat] = {
            enrollment: 0,
            hit: 0,
            nohit: 0,
          };
        });
      }

      Object.entries(districts).forEach(
        ([districtName, districtData]: [string, any]) => {
          const includeDistrict =
            selectedDistricts.length === 0 || selectedDistricts.includes(districtName);

          if (!includeDistrict) return;

          filters.categories.forEach((cat) => {
            if (!districtData[cat]) return;
            result[state][cat].enrollment += districtData[cat].enrollment || 0;
            result[state][cat].hit += districtData[cat].hit || 0;
            result[state][cat].nohit += districtData[cat].nohit || 0;
          });
        }
      );
    });
  });

  return result;
}
