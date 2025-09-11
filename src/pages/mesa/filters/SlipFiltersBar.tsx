import { useEffect, useState, useMemo } from "react";
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
import { SlipFilters, StatusKey, STATUS_KEYS, SlipDailyData } from "../types";
import { CustomCaption } from "@/components/ui/CustomCaption";
import { getLastNDaysRange } from "@/utils/getLastNdays";
import { stateWithDistrict } from "@/utils/statesDistricts";
import { ActOption, fetchActOptions } from "@/services/getAllAct";
import { SectionOption, fetchSectionOptions } from "@/services/getAllSection";
import { states as allStatesData } from "../../../components/filters/data/statesData";

interface SlipFiltersBarProps {
  value: SlipFilters;
  onChange: (f: SlipFilters) => void;
  allData: SlipDailyData[];
  onInitialLoad?: () => void;
}

export const SlipFiltersBar: React.FC<SlipFiltersBarProps> = ({
  value,
  onChange,
  allData,
  onInitialLoad,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [actOptions, setActOptions] = useState<ActOption[]>([]);
  const [sectionOptions, setSectionOptions] = useState<SectionOption[]>([]);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [isLoadingActs, setIsLoadingActs] = useState(false);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const selectedStates = value.states ?? [];
  const selectedDistricts = value.districts ?? [];
  const selectedStatuses = value.statuses ?? [];
  const selectedActs = value.acts ?? [];
  const selectedSections = value.sections ?? [];

  const STATUS_OPTIONS = STATUS_KEYS.filter((key) => key !== "Total");

  const states = useMemo(() => {
    return allStatesData || [];
  }, []);

  // Filter validation function - Modified to preserve crime types by default
  const validateFilters = (filters: SlipFilters): SlipFilters => {
    const validatedFilters = { ...filters };

    // Validate districts against selected states
    if (validatedFilters.states.length > 0) {
      const validDistricts = validatedFilters.states.flatMap((state) => {
        const stateKey = state.toLowerCase(); // Ensure case consistency
        return stateWithDistrict[stateKey] || stateWithDistrict[state] || [];
      });

      validatedFilters.districts = validatedFilters.districts.filter(
        (district) => validDistricts.includes(district)
      );
    } else {
      validatedFilters.districts = [];
    }

    // Clear downstream filters if prerequisites are not met
    if (validatedFilters.districts.length === 0) {
      validatedFilters.acts = [];
    }

    if (validatedFilters.acts.length === 0) {
      validatedFilters.sections = [];
    }

    return validatedFilters;
  };

  // Update filters with validation
  const updateFilters = (newFilters: Partial<SlipFilters>) => {
    const updated = { ...value, ...newFilters };
    const validated = validateFilters(updated);
    onChange(validated);
  };

  // Dynamic districts based on selected states
  const availableDistricts = useMemo(() => {
    if (selectedStates.length === 0) return [];

    const districts = selectedStates
      .flatMap((state) => {
        const stateKey = state.toLowerCase(); // Ensure case consistency
        const stateDistricts =
          stateWithDistrict[stateKey] || stateWithDistrict[state] || [];
        return stateDistricts;
      })
      .filter((district, index, arr) => arr.indexOf(district) === index) // Remove duplicates
      .sort();

    return districts;
  }, [selectedStates]);

  // Dynamic acts based on selected districts
  const availableActs = useMemo(() => {
    // Return all acts if districts are selected, empty if no districts
    return selectedDistricts.length > 0 ? actOptions.map((a) => a.label) : [];
  }, [actOptions, selectedDistricts]);

  // Dynamic sections based on selected acts
  const availableSections = useMemo(() => {
    // Return all sections if acts are selected, empty if no acts
    return selectedActs.length > 0 ? sectionOptions.map((s) => s.value) : [];
  }, [sectionOptions, selectedActs]);

  // Hierarchy disabling flags
  const noStatesSelected = selectedStates.length === 0;
  const noDistrictsSelected = selectedDistricts.length === 0;
  const noActsSelected = selectedActs.length === 0;
  const noSectionsSelected = selectedSections.length === 0;

  // FIXED: Handle date selection properly
  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    if (range.from && !range.to) {
      range.to = range.from;
    }

    updateFilters({ dateRange: range });
  };

  // Cascading filter handlers - Modified to preserve crime types
  const handleStateChange = (newStates: string[]) => {
    updateFilters({
      states: newStates,
      districts: [],
      acts: [],
      sections: [],
      // Keep crime types selected as they are
      statuses: selectedStatuses,
    });
  };

  const handleDistrictChange = (newDistricts: string[]) => {
    updateFilters({
      districts: newDistricts,
      acts: [],
      sections: [],
      // Keep crime types selected as they are
      statuses: selectedStatuses,
    });
  };

  const handleActChange = (newActs: string[]) => {
    updateFilters({
      acts: newActs,
      sections: [],
      // Keep crime types selected as they are
      statuses: selectedStatuses,
    });
  };

  const handleSectionChange = (newSections: string[]) => {
    updateFilters({
      sections: newSections,
      // Keep crime types selected as they are
      statuses: selectedStatuses,
    });
  };

  const handleStatusChange = (newStatuses: string[]) => {
    // Allow empty selection - don't force default to all options
    updateFilters({ statuses: newStatuses as StatusKey[] });
  };

  // Auto-clean invalid selections when parent filters change
  useEffect(() => {
    if (selectedStates.length > 0) {
      const validDistricts = selectedStates.flatMap((state) => {
        const stateKey = state.toLowerCase(); // Ensure case consistency
        const districts =
          stateWithDistrict[stateKey] || stateWithDistrict[state] || [];
        return districts;
      });

      const filteredDistricts = selectedDistricts.filter((district) =>
        validDistricts.includes(district)
      );

      if (filteredDistricts.length !== selectedDistricts.length) {
        updateFilters({
          districts: filteredDistricts,
          acts: [],
          sections: [],
          // Keep crime types selected as they are
          statuses: selectedStatuses,
        });
      }
    } else {
      // If no states selected, clear dependent filters but keep crime types
      if (
        selectedDistricts.length > 0 ||
        selectedActs.length > 0 ||
        selectedSections.length > 0
      ) {
        updateFilters({
          districts: [],
          acts: [],
          sections: [],
          // Keep crime types selected as they are
          statuses: selectedStatuses,
        });
      }
    }
  }, [selectedStates]);

  // Load acts data
  useEffect(() => {
    async function loadActs() {
      setIsLoadingActs(true);
      try {
        const acts = await fetchActOptions();
        setActOptions(acts);
      } catch (error) {
        // console.error('Error loading acts:', error);
      } finally {
        setIsLoadingActs(false);
      }
    }
    loadActs();
  }, []);

  // Load sections data
  useEffect(() => {
    async function loadSections() {
      setIsLoadingSections(true);
      try {
        const sections = await fetchSectionOptions();
        setSectionOptions(sections);
      } catch (error) {
        // console.error('Error loading sections:', error);
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSections();
  }, []);

  // Reset filters function - Modified to only select states and crime types
  const resetFilters = () => {
    const defaultFilters: SlipFilters = {
      dateRange: getLastNDaysRange(7),
      states: [...states], // Select all states
      districts: [], // Leave empty
      acts: [], // Leave empty
      sections: [], // Leave empty
      statuses: [...STATUS_OPTIONS] as StatusKey[], // Always select all crime types on reset
    };

    onChange(defaultFilters);
  };

  // Initial load with ONLY states and crime types selected
  useEffect(() => {
    if (
      !initialLoadDone &&
      states.length > 0 &&
      actOptions.length > 0 &&
      sectionOptions.length > 0 &&
      !isLoadingActs &&
      !isLoadingSections
    ) {
      // Select ALL states initially
      const allSelectedStates = [...states];

      const defaultFilters: SlipFilters = {
        dateRange: value.dateRange?.from
          ? value.dateRange
          : getLastNDaysRange(7),
        states: allSelectedStates, // Select ALL states
        districts: [], // Leave empty - don't auto-select
        acts: [], // Leave empty - don't auto-select
        sections: [], // Leave empty - don't auto-select
        statuses: [...STATUS_OPTIONS] as StatusKey[], // Select ALL crime types by default
      };

      onChange(defaultFilters);
      setInitialLoadDone(true);
      if (onInitialLoad) onInitialLoad();
    }
  }, [
    states.length,
    actOptions.length,
    sectionOptions.length,
    initialLoadDone,
    isLoadingActs,
    isLoadingSections,
    value.dateRange,
    onChange,
    onInitialLoad,
  ]);

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
          {/* Date Range - FIXED */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Date Range</label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal overflow-hidden text-ellipsis",
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
              <PopoverContent className="w-auto p-0 " align="start">
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
                <div className="bg-card grid grid-cols-2 sm:grid-cols-2 mx-auto w-[90%] mb-3 gap-2">
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() => {
                      updateFilters({ dateRange: getLastNDaysRange(7) });
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 7 Days
                  </button>
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() => {
                      updateFilters({ dateRange: getLastNDaysRange(30) });
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 30 Days
                  </button>
                  <button
                    className="bg-card px-3 py-[5px] rounded-md border"
                    onClick={() => {
                      updateFilters({ dateRange: getLastNDaysRange(90) });
                      setIsDatePickerOpen(false);
                    }}
                  >
                    Last 90 Days
                  </button>
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* States */}
          <MultiSelectCheckbox
            label={`States (${states.length})`}
            options={states}
            selected={selectedStates}
            onChange={handleStateChange}
          />

          {/* Districts */}
          <MultiSelectCheckbox
            label={`Districts (${availableDistricts.length})`}
            options={availableDistricts}
            selected={selectedDistricts}
            onChange={handleDistrictChange}
            disabled={noStatesSelected}
            disabledText={
              noStatesSelected
                ? "Select states first"
                : "No districts available"
            }
          />

          {/* Acts */}
          <MultiSelectCheckbox
            label={`Acts (${availableActs.length})`}
            options={availableActs}
            selected={selectedActs}
            onChange={handleActChange}
            disabled={noDistrictsSelected || isLoadingActs}
            disabledText={
              isLoadingActs
                ? "Loading acts..."
                : noDistrictsSelected
                ? "Select districts first"
                : "No acts available"
            }
          />

          {/* Sections */}
          <MultiSelectCheckbox
            label={`Sections (${availableSections.length})`}
            options={availableSections}
            selected={selectedSections}
            onChange={handleSectionChange}
            disabled={noActsSelected || isLoadingSections}
            disabledText={
              isLoadingSections
                ? "Loading sections..."
                : noActsSelected
                ? "Select acts first"
                : "No sections available"
            }
          />

          {/* Crime Types - Now allows clearing all */}
          <MultiSelectCheckbox
            label={`Crime Types (${STATUS_OPTIONS.length})`}
            options={STATUS_OPTIONS as unknown as string[]}
            selected={selectedStatuses}
            onChange={handleStatusChange}
            disabled={false}
            disabledText="Crime types are always available"
          />

          {/* Reset and Select All buttons */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Actions</label>
            <div className="flex flex-col gap-1">
              <Button
                variant="outline"
                onClick={resetFilters}
                className="w-full text-xs py-1 h-8"
              >
                <RotateCcw className="mr-1 h-3 w-3" />
                Reset
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
