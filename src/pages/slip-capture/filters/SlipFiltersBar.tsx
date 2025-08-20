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

  // Filter validation function
  const validateFilters = (filters: SlipFilters): SlipFilters => {
    const validatedFilters = { ...filters };

    // Validate districts against selected states
    if (validatedFilters.states.length > 0) {
      const validDistricts = validatedFilters.states.flatMap(state => 
        stateWithDistrict[state] || []
      );
      validatedFilters.districts = validatedFilters.districts.filter(district => 
        validDistricts.includes(district)
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
    
    if (validatedFilters.sections.length === 0) {
      validatedFilters.statuses = [];
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
    
    return selectedStates.flatMap(state => 
      stateWithDistrict[state] || []
    ).filter((district, index, arr) => arr.indexOf(district) === index) // Remove duplicates
    .sort();
  }, [selectedStates]);

  // Dynamic acts based on selected districts
  const availableActs = useMemo(() => {
    // Return all acts if districts are selected, empty if no districts
    return selectedDistricts.length > 0 ? actOptions.map(a => a.label) : [];
  }, [actOptions, selectedDistricts]);

  // Dynamic sections based on selected acts
  const availableSections = useMemo(() => {
    // Return all sections if acts are selected, empty if no acts
    return selectedActs.length > 0 ? sectionOptions.map(s => s.value) : [];
  }, [sectionOptions, selectedActs]);

  // Hierarchy disabling flags
  const noStatesSelected = selectedStates.length === 0;
  const noDistrictsSelected = selectedDistricts.length === 0;
  const noActsSelected = selectedActs.length === 0;
  const noSectionsSelected = selectedSections.length === 0;

  const handleDateSelect = (
    range: { from: Date | undefined; to: Date | undefined } | undefined
  ) => {
    if (!range) return;
    updateFilters({ dateRange: range });
  };

  // Cascading filter handlers
  const handleStateChange = (newStates: string[]) => {
    console.log('States changed:', newStates);
    updateFilters({
      states: newStates,
      districts: [],
      acts: [],
      sections: [],
      statuses: [],
    });
  };

  const handleDistrictChange = (newDistricts: string[]) => {
    console.log('Districts changed:', newDistricts);
    updateFilters({
      districts: newDistricts,
      acts: [],
      sections: [],
      statuses: [],
    });
  };

  const handleActChange = (newActs: string[]) => {
    console.log('Acts changed:', newActs);
    updateFilters({
      acts: newActs,
      sections: [],
      statuses: [],
    });
  };

  const handleSectionChange = (newSections: string[]) => {
    console.log('Sections changed:', newSections);
    updateFilters({
      sections: newSections,
      statuses: [],
    });
  };

  const handleStatusChange = (newStatuses: string[]) => {
    console.log('Statuses changed:', newStatuses);
    updateFilters({ statuses: newStatuses as StatusKey[] });
  };

  // Auto-clean invalid selections when parent filters change
  useEffect(() => {
    if (selectedStates.length > 0) {
      const validDistricts = selectedStates.flatMap(state => 
        stateWithDistrict[state] || []
      );
      
      const filteredDistricts = selectedDistricts.filter(district => 
        validDistricts.includes(district)
      );
      
      if (filteredDistricts.length !== selectedDistricts.length) {
        console.log('Cleaning invalid districts');
        updateFilters({ 
          districts: filteredDistricts,
          acts: [], 
          sections: [], 
          statuses: [] 
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
        console.log('Acts loaded:', acts.length);
      } catch (error) {
        console.error('Error loading acts:', error);
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
        console.log('Sections loaded:', sections.length);
      } catch (error) {
        console.error('Error loading sections:', error);
      } finally {
        setIsLoadingSections(false);
      }
    }
    loadSections();
  }, []);

  // Reset filters function
  const resetFilters = () => {
    console.log('Resetting filters');
    const defaultFilters: SlipFilters = {
      dateRange: getLastNDaysRange(7),
      states: [],
      districts: [],
      acts: [],
      sections: [],
      statuses: [],
    };
    
    onChange(defaultFilters);
    
    // Optionally set default state after reset
    setTimeout(() => {
      if (states.length > 0) {
        const defaultState = states.find(s => s.toLowerCase() === 'assam') || states[0];
        updateFilters({ states: [defaultState] });
      }
    }, 100);
  };

  // Initial load with better dependency management
  useEffect(() => {
    if (!initialLoadDone && 
        states.length > 0 && 
        actOptions.length > 0 && 
        sectionOptions.length > 0 &&
        !isLoadingActs &&
        !isLoadingSections) {
      
      console.log('Setting up initial filters');
      const defaultState = "assam";
      const assamDistricts = stateWithDistrict[defaultState] || [];

      const defaultFilters: SlipFilters = {
        dateRange: value.dateRange?.from ? value.dateRange : getLastNDaysRange(7),
        states: [defaultState],
        districts: assamDistricts.length > 0 ? [assamDistricts[0]] : [],
        acts: actOptions.length > 0 ? [actOptions[0].label] : [],
        sections: sectionOptions.length > 0 ? [sectionOptions[0].value] : [],
        statuses: [...STATUS_OPTIONS],
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
    onInitialLoad
  ]);

  // Debug logging
  useEffect(() => {
    console.log('Current filters:', {
      states: selectedStates,
      districts: selectedDistricts,
      acts: selectedActs,
      sections: selectedSections,
      statuses: selectedStatuses
    });
  }, [selectedStates, selectedDistricts, selectedActs, selectedSections, selectedStatuses]);

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

          {/* Crime Types */}
          <MultiSelectCheckbox
            label={`Crime Types (${STATUS_OPTIONS.length})`}
            options={STATUS_OPTIONS as unknown as string[]}
            selected={selectedStatuses}
            onChange={handleStatusChange}
            disabled={noSectionsSelected}
            disabledText={
              noSectionsSelected ? "Select sections first" : "No crime types available"
            }
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