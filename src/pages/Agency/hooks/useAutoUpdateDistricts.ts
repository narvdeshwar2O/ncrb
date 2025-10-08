import { useEffect } from "react";
import { getUpdatedDistrict } from "../utils/utils";
import { FilterState } from "@/components/filters/types/FilterTypes";

export function useAutoUpadeDistricts(
  filters: FilterState,
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
) {
  useEffect(() => {
    const updatedDistricts = getUpdatedDistrict(filters);
    if (updatedDistricts)
      setFilters((prev) => ({ ...prev, districts: updatedDistricts }));
  }, [filters.state.join(",")]);
}
