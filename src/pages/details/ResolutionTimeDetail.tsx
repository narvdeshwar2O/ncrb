
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Calendar } from 'lucide-react';

const ResolutionTimeDetail = () => {
  return (
    <DetailPageLayout
      title="Resolution Time Analysis"
      description="Detailed analysis of case resolution timeframes and efficiency metrics"
      icon={<Calendar className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Resolution Time Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of resolution times including trend analysis, 
            comparison by case type, and efficiency improvements.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default ResolutionTimeDetail;
