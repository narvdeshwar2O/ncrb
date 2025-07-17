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
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { states } from "../../../components/filters/data/statesData";
import {
  FilterState,
  DashboardFiltersProps,
} from "../../../components/filters/types/FilterTypes";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";

const dataTypeOptions = ["enrollment", "hit", "nohit"];

// --- helper ---
function getLastNDaysRange(n: number) {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n - 1));
  return { from, to };
}

export const AgencyFilters = ({
  onFiltersChange,
  showCrimeTypeFilter = false,
}: DashboardFiltersProps) => {
  // default last 7 days
  const initialRange = getLastNDaysRange(7);

  const [filters, setFilters] = useState<FilterState>({
    dateRange: initialRange,
    state: "All States",
    dataTypes: dataTypeOptions,
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>([]);
  const [selectedDataTypes, setSelectedDataTypes] =
    useState<string[]>(dataTypeOptions);

  // Track the N-days select so UI shows which preset is active
  const [daysPreset, setDaysPreset] = useState<"7" | "30" | "90" | "custom">(
    "7"
  );

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    updateFilters({ dateRange: range });
    // user manually changed date => mark preset as custom
    setDaysPreset("custom");
  };

  const resetFilters = () => {
    const resetRange = getLastNDaysRange(7);
    const resetState: FilterState = {
      dateRange: resetRange,
      state: "All States",
      dataTypes: dataTypeOptions,
    };
    setFilters(resetState);
    onFiltersChange(resetState);
    setSelectedStates([]);
    setSelectedDataTypes(dataTypeOptions);
    setDaysPreset("7");
  };

  // preset handler
  const setLastNDays = (n: number) => {
    const range = getLastNDaysRange(n);
    updateFilters({ dateRange: range });
    // sync preset selector
    setDaysPreset((n as 7 | 30 | 90).toString() as "7" | "30" | "90");
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
            <label className="text-sm font-medium">Select the range of days</label>
            <Select
              value={daysPreset === "custom" ? "" : daysPreset}
              onValueChange={(value) => {
                if (!value) {
                  setDaysPreset("custom");
                  return;
                }
                setDaysPreset(value as "7" | "30" | "90");
                setLastNDays(parseInt(value, 10));
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Custom Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 Days</SelectItem>
                <SelectItem value="30">Last 30 Days</SelectItem>
                <SelectItem value="90">Last 90 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* States multiselect */}
          <MultiSelectCheckbox
            label="States"
            options={states}
            selected={selectedStates}
            onChange={(newStates) => {
              setSelectedStates(newStates);
              updateFilters({ state: newStates.join(", ") });
            }}
          />

          {/* DataType multiselect */}
          <MultiSelectCheckbox
            label="Data Types"
            options={dataTypeOptions}
            selected={selectedDataTypes}
            onChange={(newTypes) => {
              setSelectedDataTypes(newTypes);
              updateFilters({ dataTypes: newTypes });
            }}
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
