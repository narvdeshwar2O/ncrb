import { DailyData } from "@/pages/agency/types";
import { FilterState } from "../components/filters/types/FilterTypes";
import { StateData } from "@/pages/agency/ui/AgencyTable";
export default function aggregateByState(
  data: DailyData[],
  filters: FilterState
): { stateResult: StateData; districtResult: StateData } {
  const selectedDistricts = filters.districts ?? [];

  // Always return objects with correct structure
  const stateResult: StateData = {};
  const districtResult: StateData = {};

  // If no districts selected, return empty but valid structure
  if (selectedDistricts.length === 0) {
    return { stateResult, districtResult };
  }

  data.forEach((entry) => {
    filters.state.forEach((state) => {
      const districts = entry.data[state];
      if (!districts) return;

      if (!stateResult[state]) {
        stateResult[state] = {};
        filters.categories.forEach((cat) => {
          stateResult[state][cat] = {
            hit: 0,
            nohit: 0,
            total: 0,
          };
        });
      }

      Object.entries(districts).forEach(
        ([districtName, districtData]: [string, any]) => {
          if (!selectedDistricts.includes(districtName)) return;

          if (!districtResult[districtName]) {
            districtResult[districtName] = {};
            filters.categories.forEach((cat) => {
              districtResult[districtName][cat] = {
               
                hit: 0,
                nohit: 0,
                total: 0,
              };
            });
          }

          filters.categories.forEach((cat) => {
            if (!districtData[cat]) return;

            stateResult[state][cat].hit += districtData[cat].hit || 0;
            stateResult[state][cat].nohit += districtData[cat].nohit || 0;
            stateResult[state][cat].total += districtData[cat].total || 0;

            districtResult[districtName][cat].hit += districtData[cat].hit || 0;
            districtResult[districtName][cat].nohit +=
              districtData[cat].nohit || 0;
            districtResult[districtName][cat].total +=
              districtData[cat].total || 0;
          });
        }
      );
    });
  });

  return { stateResult, districtResult };
}
