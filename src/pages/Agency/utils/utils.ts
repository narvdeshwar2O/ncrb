/**
 * Utility functions for filtering and processing state/district data.
 * 
 * - getDistrictsForStates: Returns a sorted list of unique districts for the given states.
 * - filterData: Filters the provided dataset based on date range, selected states, and active categories.
 * - getUpdatedDistrict: Returns updated districts based on selected states; returns null if no update is needed.
 */

import { FilterState } from "@/components/filters/types/FilterTypes";
import { normalizeDate } from "@/utils/dateNormalization";
import { stateWithDistrict } from "@/utils/statesDistricts";

/**
 * Returns a sorted list of unique districts corresponding to the provided states.
 * @param states Array of state names
 */
export function getDistrictsForStates(states: string[]) {
  const districts = states.flatMap((state) => stateWithDistrict[state] || []);
  return [...new Set(districts)].sort();
}

/**
 * Filters the dataset based on the provided filters and category options.
 * @param allData Array of data entries
 * @param filters FilterState object containing dateRange, states, districts, and categories
 * @param categoryOptions Array of available categories
 */
export const filterData = (allData, filters, categoryOptions) => {
  return allData.filter((entry) => {
    const {
      dateRange: { from, to },
      state,
      categories,
    } = filters;

    const entryDate = normalizeDate(new Date(entry.date));
    const fromDate = normalizeDate(from);
    const toDate = normalizeDate(to);
    if (
      !entryDate ||
      (fromDate && entryDate < fromDate) ||
      (toDate && entryDate > toDate)
    )
      return false;

    if (!state || state.length === 0) return false;

    const activeCategories = categories?.length
      ? categories
      : [...categoryOptions];

    return state.some((selectedState) => {
      const districts = entry.data[selectedState];
      if (!districts) return false;

      return Object.values(districts).some((districtData: any) =>
        Object.keys(districtData).some((cat) => activeCategories.includes(cat))
      );
    });
  });
};

/**
 * Returns updated districts based on selected states.
 * If districts are already valid, returns null (no update needed)
 * @param filters FilterState object containing current states and districts
 */
export const getUpdatedDistrict = (filters: FilterState) => {
  const autoDistricts = getDistrictsForStates(filters.state);
  const shouldUpdateDistricts =
    !filters.districts ||
    filters.districts.length === 0 ||
    !filters.districts.every((d) => autoDistricts.includes(d));

  return shouldUpdateDistricts ? autoDistricts : null;
};
