import { useState, useEffect, useRef } from "react";
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
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { startOfDay, endOfDay, subDays } from "date-fns";

import { TpTpFilters, TpTpStatusKey, TP_TP_STATUS_KEYS } from "../types";

/* ------------------------------------------------------------------ */
/* Helpers                                                            */
/* ------------------------------------------------------------------ */
const getLastNDaysRange = (n: number) => {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n - 1));
  return { from, to };
};

/* ------------------------------------------------------------------ */
/* Props                                                              */
/* ------------------------------------------------------------------ */
interface TpTpFiltersBarProps {
  allStates: string[];
  value: TpTpFilters;
  onChange: (filters: TpTpFilters) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export const TpTpFiltersBar = ({
  allStates,
  value,
  onChange,
}: TpTpFiltersBarProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const initialized = useRef(false);

  // Friendly display labels for statuses
  const statusLabelMap: Record<string, string> = {
    Arrested: "Arrested",
    Convicted: "Convicted",
    Suspect: "Suspect",
    Total: "Total",
  };

  // ✅ Remove total from options (keeping as per original, but if you want to include "total", remove the filter)
  const STATUS_OPTIONS = TP_TP_STATUS_KEYS.filter((s) => s !== "total");

  useEffect(() => {
    if (
      !initialized.current &&
      (!value.states?.length || !value.statuses?.length)
    ) {
      initialized.current = true;
      onChange({
        dateRange: value.dateRange || { from: undefined, to: undefined },
        states: value.states?.length ? value.states : [...allStates],
        statuses: value.statuses?.length ? value.statuses : [...STATUS_OPTIONS],
      });
    }
  }, [allStates, value, onChange]);

  const selectedStates = value.states ?? [];
  const selectedStatuses = value.statuses ?? [];
  const noStatesSelected = selectedStates.length === 0;

  const updateFilters = (patch: Partial<TpTpFilters>) => {
    onChange({ ...value, ...patch });
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    updateFilters({
      dateRange: {
        from: range.from || undefined,
        to: range.to || undefined,
      },
    });
  };

  const resetFilters = () => {
    onChange({
      dateRange: { from: undefined, to: undefined },
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4 gap-3">
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
                  defaultMonth={value.dateRange.from}
                  selected={{
                    from: value.dateRange.from,
                    to: value.dateRange.to,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* States */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={(newStates) => updateFilters({ states: newStates })}
          />

          {/* Metrics (disabled if no states) */}
          <MultiSelectCheckbox
            label="Metrics"
            options={[...STATUS_OPTIONS]}
            selected={selectedStatuses}
            onChange={(newStatuses) =>
              updateFilters({ statuses: newStatuses as TpTpStatusKey[] })
            }
            disabled={noStatesSelected}
            disabledText="Select states first"
            getOptionLabel={(v) => statusLabelMap[v] ?? v}
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
