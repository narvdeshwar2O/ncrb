import { useState, useEffect, useRef, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { CalendarIcon, Filter as FilterIcon, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { CpCpFilters, CpCpStatusKey, CP_CP_STATUS_KEYS } from "../types";
import { CustomCaption } from "@/components/ui/CustomCaption";
import { quickRanges } from "@/utils/quickRanges";

const getLastNDaysRange = (n: number) => {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n - 1));
  return { from, to };
};

interface CpCpFiltersBarProps {
  allStates: string[];
  value: CpCpFilters;
  onChange: (filters: CpCpFilters) => void;
}

export const CpCpFiltersBar = ({
  allStates,
  value,
  onChange,
}: CpCpFiltersBarProps) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const initialized = useRef(false);

  const uniqueAllStates = useMemo(() => {
    const unique = [...new Set(allStates)];
    return unique;
  }, [allStates]);

  const STATUS_OPTIONS = useMemo(() => {
    const options = [
      ...new Set(CP_CP_STATUS_KEYS.filter((s) => s !== "total")),
    ];
    return options;
  }, []);

  useEffect(() => {
    if (
      !initialized.current &&
      uniqueAllStates.length > 0 &&
      (!value.states?.length || !value.statuses?.length)
    ) {
      initialized.current = true;
      onChange({
        dateRange: value.dateRange || getLastNDaysRange(7),
        states: value.states?.length
          ? [...new Set(value.states)]
          : [...uniqueAllStates],
        statuses: value.statuses?.length
          ? [...new Set(value.statuses.filter((s) => s !== "total"))]
          : [...STATUS_OPTIONS],
      });
    }
  }, [uniqueAllStates, value, onChange, STATUS_OPTIONS]);

  const selectedStates = value.states ?? [];
  const selectedStatuses = value.statuses ?? [];
  const noStatesSelected = selectedStates.length === 0;

  const updateFilters = (patch: Partial<CpCpFilters>) => {
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
      dateRange: getLastNDaysRange(7),
      states: [...uniqueAllStates],
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 xl:grid-cols-5 gap-3">
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
                  components={{
                    Caption: CustomCaption,
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-2">
            <label htmlFor="">Quick Ranges</label>
            <select
              className="w-full border rounded-md text-sm py-2 px-2 bg-card"
              onChange={(e) => {
                const days = parseInt(e.target.value, 10);
                if (days) updateFilters({ dateRange: getLastNDaysRange(days) });
              }}
              defaultValue=""
            >
              {quickRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
          <MultiSelectCheckbox
            label="States"
            options={uniqueAllStates}
            selected={selectedStates}
            onChange={(newStates) =>
              updateFilters({ states: [...new Set(newStates)] })
            }
          />
          <MultiSelectCheckbox
            label="Metrics"
            options={STATUS_OPTIONS}
            selected={selectedStatuses}
            onChange={(newStatuses) =>
              updateFilters({
                statuses: [
                  ...new Set(newStatuses.filter((s) => s !== "total")),
                ] as CpCpStatusKey[],
              })
            }
            disabled={noStatesSelected}
            disabledText="Select states first"
          />
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
