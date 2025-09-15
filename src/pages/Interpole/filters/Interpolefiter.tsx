import React, { useEffect, useState } from "react";
import { fetchCountriesName } from "../utils";
import MultiSelectCheckbox from "@/components/ui/MultiSelectCheckbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CustomCaption } from "@/components/ui/CustomCaption";
import { getLastNDaysRange } from "@/utils/getLastNdays";

interface InterpoleDailyData {
  date: string;
  data: { country: string; agency: string; count: number }[];
}

interface InterpoleFilters {
  dateRange: { from: Date | null; to: Date | null };
  countries: string[];
}

interface Props {
  value: InterpoleFilters;
  onChange: (val: InterpoleFilters) => void;
  allData: InterpoleDailyData[];
}

const InterpoleFilter: React.FC<Props> = ({ value, onChange }) => {
  const [countryOptions, setCountryOptions] = useState<string[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  useEffect(() => {
    const loadCountries = async () => {
      try {
        const countries = await fetchCountriesName();
        setCountryOptions(countries.map((c) => c.name.toUpperCase())); // match JSON
      } catch (err) {
        console.error("Failed to load countries:", err);
      }
    };

    loadCountries();
  }, []);

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    if (range.from && !range.to) {
      range.to = range.from;
    }
    onChange({
      ...value,
      dateRange: { from: range.from || null, to: range.to || null },
    });
  };

  const handleCountryChange = (countries: string[]) => {
    onChange({ ...value, countries });
  };

  const handleReset = () => {
    onChange({
      dateRange: getLastNDaysRange(7),
      countries: [],
    });
  };

  return (
    <div className="grid grid-cols-3 gap-3">
      {/* Date Range Filter */}
      <div className="flex flex-col gap-2 justify-end ">
        <label className="text-sm font-medium">Date Range</label>
        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "justify-start text-left font-normal overflow-hidden text-ellipsis",
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
          <PopoverContent className="w-fit p-0" align="center">
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: value.dateRange.from || undefined,
                to: value.dateRange.to || undefined,
              }}
              onSelect={handleDateSelect}
              numberOfMonths={1}
              components={{ Caption: CustomCaption }}
            />
            {/* Quick ranges */}
            <div className="bg-card grid grid-cols-2 gap-2 mx-auto w-[90%] mb-3">
              <button
                className="bg-card px-3 py-[5px] rounded-md border"
                onClick={() => {
                  onChange({ ...value, dateRange: getLastNDaysRange(7) });
                  setIsDatePickerOpen(false);
                }}
              >
                Last 7 Days
              </button>
              <button
                className="bg-card px-3 py-[5px] rounded-md border"
                onClick={() => {
                  onChange({ ...value, dateRange: getLastNDaysRange(30) });
                  setIsDatePickerOpen(false);
                }}
              >
                Last 30 Days
              </button>
              <button
                className="bg-card px-3 py-[5px] rounded-md border"
                onClick={() => {
                  onChange({ ...value, dateRange: getLastNDaysRange(90) });
                  setIsDatePickerOpen(false);
                }}
              >
                Last 90 Days
              </button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Countries Filter */}
      <MultiSelectCheckbox
        label={`Countries (${countryOptions.length})`}
        options={countryOptions}
        selected={value.countries}
        onChange={handleCountryChange}
      />

      {/* Reset Button */}
      <div className="flex items-end">
        <Button
        variant="outline"
        className="ml-auto w-full gap-2"
        onClick={handleReset}
      >
        <Filter className="h-4 w-4" />
        Reset
      </Button>
      </div>
    </div>
  );
};

export default InterpoleFilter;
