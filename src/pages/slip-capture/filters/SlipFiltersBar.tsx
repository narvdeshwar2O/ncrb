import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { SlipFilters, StatusKey, STATUS_KEYS } from "../types";
import { CustomCaption } from "@/components/ui/CustomCaption";
import { getLastNDaysRange } from "@/utils/getLastNdays";
import { quickRanges } from "@/utils/quickRanges";

interface SlipFiltersBarProps {
  allStates: string[];
  value: SlipFilters;
  onChange: (f: SlipFilters) => void;
}

export const SlipFiltersBar: React.FC<SlipFiltersBarProps> = ({
  allStates,
  value,
  onChange,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState<string[]>(value.states);
  const [selectedStatuses, setSelectedStatuses] = useState<StatusKey[]>(
    value.statuses
  );

  const STATUS_OPTIONS = STATUS_KEYS.filter((key) => key !== "Total");

  const updateFilters = (newFilters: Partial<SlipFilters>) => {
    const updated = { ...value, ...newFilters };
    onChange(updated);
  };

  const handleStateChange = (newStates: string[]) => {
    setSelectedStates(newStates);
    if (newStates.length === 0) {
      setSelectedStatuses([]);
      updateFilters({ states: [], statuses: [] });
    } else {
      const updatedStatuses =
        selectedStatuses.length > 0 ? selectedStatuses : [...STATUS_OPTIONS];
      setSelectedStatuses(updatedStatuses);
      updateFilters({ states: newStates, statuses: updatedStatuses });
    }
  };

  const handleStatusChange = (newStatuses: string[]) => {
    setSelectedStatuses(newStatuses as StatusKey[]);
    updateFilters({ statuses: newStatuses as StatusKey[] });
  };

  const resetFilters = () => {
    updateFilters({
      dateRange: getLastNDaysRange(7),
      states: [...allStates],
      statuses: [...STATUS_OPTIONS],
    });
    setSelectedStates([...allStates]);
    setSelectedStatuses([...STATUS_OPTIONS]);
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value.dateRange.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value.dateRange.from ? (
                    value.dateRange.to ? (
                      <>
                        {format(value.dateRange.from, "LLL dd, y")} -{" "}
                        {format(value.dateRange.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(value.dateRange.from, "LLL dd, y")
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
                  selected={{
                    from: value.dateRange.from || undefined,
                    to: value.dateRange.to || undefined,
                  }}
                  onSelect={(range) => {
                    updateFilters({ dateRange: range });
                  }}
                  numberOfMonths={1}
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
          {/* States MultiSelect */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={handleStateChange}
          />

          {/* Crime Types MultiSelect */}
          <MultiSelectCheckbox
            label="Crime Type"
            options={STATUS_OPTIONS as unknown as string[]}
            selected={selectedStatuses}
            onChange={handleStatusChange}
            disabled={selectedStates.length === 0}
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
