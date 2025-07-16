
import { useState } from 'react';
import { DashboardFilters } from '@/components/filters/DashboardFilters';
import { CCTNSMetricsCards } from './cctns/CCTNSMetricsCards';
import { FIRTrendsChart } from './cctns/FIRTrendsChart';
import { CrimeCategoriesChart } from './cctns/CrimeCategoriesChart';
import { StateWiseChart } from './cctns/StateWiseChart';
import { ResolutionTimelineChart } from './cctns/ResolutionTimelineChart';
import { CrimeHotspotsChart } from './cctns/CrimeHotspotsChart';
import { OperationalEfficiencyChart } from './cctns/OperationalEfficiencyChart';
import { VictimDemographicsChart } from './cctns/VictimDemographicsChart';
import { TechnologyIntegrationChart } from './cctns/TechnologyIntegrationChart';

export const CCTNSDashboard = () => {
  const [appliedFilters, setAppliedFilters] = useState<any>(null);

  const handleFiltersChange = (filters: any) => {
    setAppliedFilters(filters);
    console.log('Applied filters:', filters);
    // Here you would typically filter your data based on the selected filters
  };

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <DashboardFilters 
        onFiltersChange={handleFiltersChange} 
        showCrimeTypeFilter={true}
      />

      {/* Comprehensive Metrics Cards */}
      <CCTNSMetricsCards />

      {/* Core Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <FIRTrendsChart />
        <CrimeCategoriesChart />
      </div>

      {/* Geographic & Resolution Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StateWiseChart />
        <ResolutionTimelineChart />
      </div>

      {/* Advanced Analytics Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CrimeHotspotsChart />
        <OperationalEfficiencyChart />
      </div>

      {/* Advanced Analytics Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VictimDemographicsChart />
        <TechnologyIntegrationChart />
      </div>
    </div>
  );
};
