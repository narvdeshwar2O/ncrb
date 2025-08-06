import { DailyData } from "@/pages/agency/types";
import { FilterState } from "../components/filters/types/FilterTypes";
import { StateData } from "@/pages/agency/ui/AgencyTable";

export default function aggregateByState(
  data: DailyData[],
  filters: FilterState
): { stateResult: StateData; districtResult: StateData } {
  const selectedDistricts = filters.districts ?? [];
  const selectedStates = filters.state ?? [];

  // Always return objects with correct structure
  const stateResult: StateData = {};
  const districtResult: StateData = {};

  if (selectedDistricts.length === 0) {
    // console.warn("No districts selected, returning empty results");
    return { stateResult, districtResult };
  }

  data.forEach((entry, index) => {
    // console.log(`Processing entry ${index + 1}`);

    selectedStates.forEach((state) => {
      const normalizedState = state.trim().toLowerCase();

      // Find matching state key from entry (case-insensitive)
      const stateKey = Object.keys(entry.data).find(
        (s) => s.trim().toLowerCase() === normalizedState
      );

      if (!stateKey) {
        // console.warn(`State "${state}" not found in entry ${index + 1}`);
        return;
      }

      const districts = entry.data[stateKey];
      if (!districts) return;

      // Initialize state aggregation if not present
      if (!stateResult[stateKey]) {
        stateResult[stateKey] = {};
        filters.categories.forEach((cat) => {
          stateResult[stateKey][cat] = {
            enrol: 0,
            hit: 0,
            nohit: 0,
            total: 0,
          };
        });
      }

      Object.entries(districts).forEach(
        ([districtName, districtData]: [string, any]) => {
          const includeDistrict = selectedDistricts.some(
            (d) => d.trim().toLowerCase() === districtName.trim().toLowerCase()
          );

          // console.log(
          //   `Checking district: "${districtName}" => Include: ${includeDistrict}`
          // );

          if (!includeDistrict) return;
          // console.log("Matched district:", districtName);

          // Initialize district aggregation if not present
          if (!districtResult[districtName]) {
            districtResult[districtName] = {};
            filters.categories.forEach((cat) => {
              districtResult[districtName][cat] = {
                enrol: 0,
                hit: 0,
                nohit: 0,
                total: 0,
              };
            });
          }

          filters.categories.forEach((cat) => {
            if (!districtData[cat]) return;

            // Add to state-level totals
            stateResult[stateKey][cat].enrol += districtData[cat].enrol || 0;
            stateResult[stateKey][cat].hit += districtData[cat].hit || 0;
            stateResult[stateKey][cat].nohit += districtData[cat].nohit || 0;
            stateResult[stateKey][cat].total += districtData[cat].total || 0;

            // Add to district-level totals
            districtResult[districtName][cat].enrol +=
              districtData[cat].enrol || 0;
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
