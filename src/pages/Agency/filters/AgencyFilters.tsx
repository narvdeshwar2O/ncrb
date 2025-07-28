import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Filter as FilterIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import { states as allStates } from "../../../components/filters/data/statesData";
import {
  FilterState,
  DashboardFiltersProps,
} from "../../../components/filters/types/FilterTypes";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { CustomCaption } from "@/components/ui/CustomCaption";
import { quickRanges } from "@/utils/quickRanges";
import { getLastNDaysRange } from "@/utils/getLastNdays";

const dataTypeOptions = ["enrollment", "hit", "nohit"] as const;
const categoryOptions = ["tp", "cp", "mesa"] as const;

const categoryLabelMap: Record<string, string> = {
  tp: "Ten Print",
  cp: "Chance Print",
  mesa: "MESA",
};

interface ControlledAgencyFiltersProps extends DashboardFiltersProps {
  filters: FilterState; // controlled
}

export const AgencyFilters = ({
  filters,
  onFiltersChange,
}: ControlledAgencyFiltersProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const selectedStates = filters.state ?? [];
  const selectedDataTypes = filters.dataTypes ?? [...dataTypeOptions];
  const selectedCategories = filters.categories ?? [...categoryOptions];

  const noStatesSelected = selectedStates.length === 0;

  const updateFilters = (patch: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...patch });
  };

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    updateFilters({ dateRange: range });
  };

  const resetFilters = () => {
    updateFilters({
      dateRange: getLastNDaysRange(7),
      state: [...allStates],
      dataTypes: [...dataTypeOptions],
      categories: [...categoryOptions],
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FilterIcon className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-3">
          {/* Date Range */}
          <div className="space-y-2 col-span-1">
            <label className="text-sm font-medium">Date Range</label>

            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal overflow-hidden whitespace-nowrap text-ellipsis",
                    !filters.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateRange.from ? (
                    filters.dateRange.to ? (
                      <>
                        {format(filters.dateRange.from, "LLL dd, y")} -{" "}
                        {format(filters.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(filters.dateRange.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={filters.dateRange}
                  onSelect={handleDateSelect}
                  components={{
                    Caption: CustomCaption,
                  }}
                />
                <div className="bg-card grid grid-cols-2 sm:grid-cols-2 mx-auto w-[90%] mb-3 gap-2">
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() =>
                      updateFilters({ dateRange: getLastNDaysRange(7) })
                    }
                  >
                    Last 7 Days
                  </button>
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() =>
                      updateFilters({ dateRange: getLastNDaysRange(30) })
                    }
                  >
                    Last 30 Days
                  </button>
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() =>
                      updateFilters({ dateRange: getLastNDaysRange(90) })
                    }
                  >
                    Last 90 Days
                  </button>
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() => {
                      alert("Logic for 'All Data' is not implemented yet!");
                    }}
                  >
                    All Data
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
            {/* States */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={(newStates) => updateFilters({ state: newStates })}
          />

          {/* Data Types (disabled if no states) */}
          <MultiSelectCheckbox
            label="Data Types"
            options={[...dataTypeOptions]}
            selected={selectedDataTypes}
            onChange={(newTypes) => updateFilters({ dataTypes: newTypes })}
            disabled={noStatesSelected}
            disabledText="Select states first"
          />

          {/* Categories (disabled if no states) */}
          <MultiSelectCheckbox
            label="Categories"
            options={[...categoryOptions]}
            selected={selectedCategories}
            onChange={(newCategories) =>
              updateFilters({ categories: newCategories })
            }
            disabled={noStatesSelected}
            disabledText="Select states first"
            getOptionLabel={(v) => categoryLabelMap[v] ?? v}
          />

          {/* Reset */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Reset</label>
            <Button variant="outline" onClick={resetFilters} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
