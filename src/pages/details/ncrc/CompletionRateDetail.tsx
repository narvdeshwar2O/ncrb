
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { CheckCircle2 } from 'lucide-react';

const CompletionRateDetail = () => {
  return (
    <DetailPageLayout
      title="Request Completion Rate Analysis"
      description="Detailed analysis of request completion rates and process optimization"
      icon={<CheckCircle2 className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Request Completion Rate Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of completion rate trends,
            incomplete request analysis, completion barriers, and process optimization.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default CompletionRateDetail;
