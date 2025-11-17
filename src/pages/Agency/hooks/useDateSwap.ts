import { FilterState } from "@/components/filters/types/FilterTypes";
import { useEffect } from "react";

export const useDateSwap = (
  filters: FilterState,
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
) => {
  useEffect(() => {
    setFilters((prev) => {
      const { from, to } = prev.dateRange;
      if (!from || !to) return prev;
      if (from > to) return { ...prev, dateRange: { from: to, to: from } };
      return prev;
    });
  }, [filters.dateRange]);
};
