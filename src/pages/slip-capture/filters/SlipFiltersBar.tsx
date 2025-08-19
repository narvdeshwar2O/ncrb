import { useEffect, useState } from "react";
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
import { stateWithDistrict } from "@/utils/statesDistricts";
import { ActOption, fetchActOptions } from "@/services/getAllAct";
import { SectionOption, fetchSectionOptions } from "@/services/getAllSection";

interface SlipFiltersBarProps {
  allStates: string[];
  value: SlipFilters;
  onChange: (f: SlipFilters) => void;
}

function getDistrictsForStates(states: string[]) {
  const districts = states.flatMap((state) => stateWithDistrict[state] || []);
  return [...new Set(districts)].sort();
}

export const SlipFiltersBar: React.FC<SlipFiltersBarProps> = ({
  allStates,
  value,
  onChange,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [actOptions, setActOptions] = useState<ActOption[]>([]);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);

  const selectedStates = value.states ?? [];
  const selectedDistricts = value.districts ?? [];
  const selectedStatuses = value.statuses ?? [];
  const selectedActs = value.acts ?? [];
  const selectedSections = value.sections ?? [];

  const STATUS_OPTIONS = STATUS_KEYS.filter((key) => key !== "Total");
  const districtOptions = getDistrictsForStates(selectedStates);
  const noStatesSelected = selectedStates.length === 0;

  const updateFilters = (newFilters: Partial<SlipFilters>) => {
    const updated = { ...value, ...newFilters };
    onChange(updated);
  };

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    updateFilters({ dateRange: range });
  };

  const handleStateChange = (newStates: string[]) => {
    const newDistricts = getDistrictsForStates(newStates);

    updateFilters({
      states: newStates,
      districts: newDistricts,
      statuses:
        selectedStatuses.length > 0 ? selectedStatuses : [...STATUS_OPTIONS],
    });
  };

  const handleDistrictChange = (newDistricts: string[]) => {
    updateFilters({ districts: newDistricts });
  };

  const handleStatusChange = (newStatuses: string[]) => {
    updateFilters({ statuses: newStatuses as StatusKey[] });
  };

  const handleActChange = (newActs: string[]) => {
    updateFilters({ acts: newActs });
  };

  const handleSectionChange = (newSections: string[]) => {
    updateFilters({ sections: newSections });
  };

  useEffect(() => {
    async function loadActs() {
      const acts = await fetchActOptions();
      setActOptions(acts);
    }
    loadActs();
  }, []);

  useEffect(() => {
    async function loadSections() {
      const sections = await fetchSectionOptions();
      setSectionOptions(sections);
    }
    loadSections();
  }, []);

  const resetFilters = () => {
    updateFilters({
      dateRange: getLastNDaysRange(7),
      states: [...allStates],
      districts: getDistrictsForStates(allStates),
      statuses: [...STATUS_OPTIONS],
      acts: [],
      sections: [],
    });
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-3">
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
                  onSelect={handleDateSelect}
                  numberOfMonths={1}
                  components={{ Caption: CustomCaption }}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* States */}
          <MultiSelectCheckbox
            label="States"
            options={allStates}
            selected={selectedStates}
            onChange={handleStateChange}
          />

          {/* Districts */}
          <MultiSelectCheckbox
            label="Districts"
            options={districtOptions}
            selected={selectedDistricts}
            onChange={handleDistrictChange}
            disabled={noStatesSelected}
            disabledText={
              noStatesSelected ? "Select states first" : "No district selected"
            }
          />
          {/* Acts */}
          <MultiSelectCheckbox
            label="Acts"
            options={actOptions.map((a) => a.label)}
            selected={selectedActs}
            onChange={handleActChange}
          />

          {/* Sections */}
          <MultiSelectCheckbox
            label="Sections"
            options={sectionOptions.map((s) => s.label)}
            selected={selectedSections}
            onChange={handleSectionChange}
          />
          {/* Crime Type */}
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
