import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { states } from "../../../components/filters/data/statesData";
import {
  FilterState,
  DashboardFiltersProps,
} from "../../../components/filters/types/FilterTypes";
import { subDays, startOfDay, endOfDay } from "date-fns";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
const dataTypeOptions = ["enrollment", "hit", "nohit"];

export const AgencyFilters = ({
  onFiltersChange,
  showCrimeTypeFilter = false,
}: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    state: "All States",
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] =
    useState<string[]>(dataTypeOptions);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (range) {
      updateFilters({ dateRange: range });
    }
  };

  const resetFilters = () => {
    const resetState = {
      dateRange: { from: undefined, to: undefined },
      state: "All States",
    };
    setFilters(resetState);
    onFiltersChange(resetState);
  };

  //  for the purpose of getting the last n days
  const setLastNDays = (n: number) => {
    const to = endOfDay(new Date());
    const from = startOfDay(subDays(to, n - 1));
    updateFilters({ dateRange: { from, to } });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filters
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {/* Date Range Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
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
                  initialFocus
                  mode="range"
                  defaultMonth={filters.dateRange.from}
                  selected={{
                    from: filters.dateRange.from,
                    to: filters.dateRange.to,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* N days filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Select the range of days
            </label>
            <Select onValueChange={(value) => setLastNDays(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Present Range" />
              </SelectTrigger>
              <SelectContent>
                {["7", "30", "90"].map((item) => (
                  <SelectItem key={item} value={item}>
                    Last {item} Days
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <MultiSelectCheckbox
            label="States"
            options={states}
            selected={selectedStates}
            onChange={(newStates) => {
              setSelectedStates(newStates);
              updateFilters({ state: newStates.join(", ") });
            }}
          />
          <MultiSelectCheckbox
            label="Data Types"
            options={["enrollment", "hit", "nohit"]}
            selected={selectedDataTypes}
            onChange={(newTypes) => {
              setSelectedDataTypes(newTypes);
              updateFilters({ dataTypes: newTypes });
            }}
          />

          {/* Reset Button */}
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
