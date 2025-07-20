import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, subDays, startOfDay, endOfDay } from "date-fns";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import { TpTpFilters, TpTpStatusKey, TP_TP_STATUS_KEYS } from "../types";

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */
const getLastNDaysRange = (n: number) => {
  const to = endOfDay(new Date());
  const from = startOfDay(subDays(to, n - 1));
  return { from, to };
};

/* ------------------------------------------------------------------ */
/* Props                                                               */
/* ------------------------------------------------------------------ */
interface TpTpFiltersBarProps {
  allStates: string[];
  value: TpTpFilters;
  onChange: (f: TpTpFilters) => void;
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */
export const TpTpFiltersBar: React.FC<TpTpFiltersBarProps> = ({
  allStates,
  value,
  onChange,
}) => {
  const initialRange = getLastNDaysRange(7);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const [selectedStates, setSelectedStates] = useState<string[]>(value.states);
  const [selectedStatuses, setSelectedStatuses] = useState<TpTpStatusKey[]>(
    value.statuses
  );

  const [daysPreset, setDaysPreset] = useState<"7" | "30" | "90" | "custom">("7");

  // ✅ Remove total from the visible options
  const STATUS_OPTIONS = TP_TP_STATUS_KEYS.filter((s) => s !== "total");

  const updateFilters = (newFilters: Partial<TpTpFilters>) => {
    const updated = { ...value, ...newFilters };
    onChange(updated);
  };

  const handleDateSelect = (range: { from?: Date; to?: Date } | undefined) => {
    if (!range) return;
    updateFilters({ dateRange: { from: range.from || null, to: range.to || null } });
    setDaysPreset("custom");
  };

  const setLastNDays = (n: number) => {
    const range = getLastNDaysRange(n);
    updateFilters({ dateRange: range });
    setDaysPreset((n as 7 | 30 | 90).toString() as "7" | "30" | "90");
  };

  const resetFilters = () => {
    const resetRange = initialRange;
    const resetValue: TpTpFilters = {
      dateRange: resetRange,
      states: [],
      statuses: [...STATUS_OPTIONS], // ✅ No total on reset
    };
    onChange(resetValue);
    setSelectedStates([]);
    setSelectedStatuses([...STATUS_OPTIONS]);
    setDaysPreset("7");
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
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
                  defaultMonth={value.dateRange.from || undefined}
                  selected={{
                    from: value.dateRange.from || undefined,
                    to: value.dateRange.to || undefined,
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Last N Days */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Select Days</label>
            <select
              className="w-full border rounded-md p-2 text-sm bg-card"
              value={daysPreset === "custom" ? "" : daysPreset}
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setDaysPreset("custom");
                  return;
                }
                setLastNDays(parseInt(val, 10));
              }}
            >
              <option value="">Custom Range</option>
              <option value="7">Last 7 Days</option>
              <option value="30">Last 30 Days</option>
              <option value="90">Last 90 Days</option>
            </select>
          </div>

          {/* States MultiSelect */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={(newStates) => {
              setSelectedStates(newStates);
              updateFilters({ states: newStates });
            }}
          />

          {/* Status MultiSelect */}
          <MultiSelectCheckbox
            label="TP-TP Metrics"
            options={STATUS_OPTIONS as string[]}
            selected={selectedStatuses}
            onChange={(newStatuses) => {
              setSelectedStatuses(newStatuses as TpTpStatusKey[]);
              updateFilters({ statuses: newStatuses as TpTpStatusKey[] });
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
