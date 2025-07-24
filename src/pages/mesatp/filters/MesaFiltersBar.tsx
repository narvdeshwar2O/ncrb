import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfDay, subDays, endOfDay } from "date-fns";
import { CalendarIcon, Filter as FilterIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { SlipFilters, MesaStatusKey, MESA_STATUS_KEYS } from "../types";

interface MesaFiltersBarProps {
  allStates: string[];
  value: SlipFilters;
  onChange: (f: SlipFilters) => void;
}

const getLastNDaysRange = (n: number) => {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n - 1));
  return { from, to };
};

export const MesaFiltersBar = ({
  allStates,
  value,
  onChange,
}: MesaFiltersBarProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [defaultApplied, setDefaultApplied] = useState(false);

  // Remove "Total" from the crime type options
  const STATUS_OPTIONS = MESA_STATUS_KEYS.filter((s) => s !== "Total");

  const selectedStates = value.states ?? [];
  const selectedStatuses = value.statuses ?? [];

  const noStatesSelected = selectedStates.length === 0;

  useEffect(() => {
    if (!defaultApplied && allStates.length > 0) {
      onChange({
        states: [...allStates],
        statuses: [...STATUS_OPTIONS],
        dateRange: getLastNDaysRange(7),
      });
      setDefaultApplied(true);
    }
  }, [allStates, defaultApplied, onChange, STATUS_OPTIONS]);

  const updateFilters = (patch: Partial<SlipFilters>) => {
    onChange({ ...value, ...patch });
  };

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    updateFilters({
      dateRange: { from: range.from || null, to: range.to || null },
    });
  };

  const resetFilters = () => {
    updateFilters({
      dateRange: getLastNDaysRange(7),
      states: [...allStates],
      statuses: [...STATUS_OPTIONS],
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !value.dateRange?.from && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value.dateRange?.from ? (
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
                  defaultMonth={value.dateRange?.from || undefined}
                  selected={{
                    from: value.dateRange?.from || undefined,
                    to: value.dateRange?.to || undefined,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* States MultiSelect */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={(newStates) => updateFilters({ states: newStates })}
          />

          {/* Crime Type MultiSelect */}
          <MultiSelectCheckbox
            label="Crime Type"
            options={STATUS_OPTIONS}
            selected={selectedStatuses}
            onChange={(newStatuses) =>
              updateFilters({ statuses: newStatuses as MesaStatusKey[] })
            }
            disabled={noStatesSelected}
            disabledText="Select states first"
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
