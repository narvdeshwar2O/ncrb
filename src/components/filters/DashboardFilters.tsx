
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Filter, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { states } from './data/statesData';
import { districts } from './data/districtsData';
import { crimeTypes } from './data/crimeTypesData';
import { FilterState, DashboardFiltersProps } from './types/FilterTypes';

export const DashboardFilters = ({ onFiltersChange, showCrimeTypeFilter = false }: DashboardFiltersProps) => {
  const [filters, setFilters] = useState<FilterState>({
    dateRange: { from: undefined, to: undefined },
    district: 'All Districts',
    state: 'All States',
    crimeType: 'All Crime Types'
  });

  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const updateFilters = (newFilters: Partial<FilterState>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleStateChange = (state: string) => {
    updateFilters({ 
      state, 
      district: 'All Districts' // Reset district when state changes
    });
  };

  const handleDateSelect = (range: { from: Date | undefined; to: Date | undefined } | undefined) => {
    if (range) {
      updateFilters({ dateRange: range });
    }
  };

  const resetFilters = () => {
    const resetState = {
      dateRange: { from: undefined, to: undefined },
      district: 'All Districts',
      state: 'All States',
      crimeType: 'All Crime Types'
    };
    setFilters(resetState);
    onFiltersChange(resetState);
  };

  const availableDistricts = districts[filters.state as keyof typeof districts] || ['All Districts'];

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
                    to: filters.dateRange.to
                  }}
                  onSelect={handleDateSelect}
                  numberOfMonths={2}
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* State Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">State</label>
            <Select value={filters.state} onValueChange={handleStateChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select State" />
              </SelectTrigger>
              <SelectContent>
                {states.map(state => (
                  <SelectItem key={state} value={state}>{state}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* District Filter */}
          <div className="space-y-2">
            <label className="text-sm font-medium">District</label>
            <Select 
              value={filters.district} 
              onValueChange={(district) => updateFilters({ district })}
              disabled={filters.state === 'All States'}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select District" />
              </SelectTrigger>
              <SelectContent>
                {availableDistricts.map(district => (
                  <SelectItem key={district} value={district}>{district}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Crime Type Filter - Only show for CCTNS dashboard */}
          {showCrimeTypeFilter && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Crime Type</label>
              <Select value={filters.crimeType} onValueChange={(crimeType) => updateFilters({ crimeType })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Crime Type" />
                </SelectTrigger>
                <SelectContent>
                  {crimeTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Reset Button */}
          <div className="space-y-2">
            <label className="text-sm font-medium invisible">Reset</label>
            <Button 
              variant="outline" 
              onClick={resetFilters}
              className="w-full"
            >
              <RotateCcw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
