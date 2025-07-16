
import { useState } from 'react';
import { DashboardFilters } from '@/components/filters/DashboardFilters';
import { NCRCMetricsCards } from './ncrc/NCRCMetricsCards';
import { VerificationTrendsChart } from './ncrc/VerificationTrendsChart';
import { VerificationTypesChart } from './ncrc/VerificationTypesChart';
import { ProcessingTimeChart } from './ncrc/ProcessingTimeChart';
import { AgencyPerformanceChart } from './ncrc/AgencyPerformanceChart';
import { RejectionAnalysisChart } from './ncrc/RejectionAnalysisChart';
import { RiskAssessmentChart } from './ncrc/RiskAssessmentChart';
import { QualityMetricsChart } from './ncrc/QualityMetricsChart';

export const NCRCDashboard = () => {
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
        showCrimeTypeFilter={false}
      />

      {/* Key Metrics Cards */}
      <NCRCMetricsCards />

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <VerificationTrendsChart />
        <VerificationTypesChart />
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProcessingTimeChart />
        <AgencyPerformanceChart />
      </div>

      {/* Charts Row 3 - New Quality and Risk Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QualityMetricsChart />
        <RiskAssessmentChart />
      </div>

      {/* Rejection Analysis */}
      <RejectionAnalysisChart />
    </div>
  );
};
