
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { AlertCircle } from 'lucide-react';

const PendingCasesDetail = () => {
  return (
    <DetailPageLayout
      title="Pending Cases Analysis"
      description="Detailed analysis of pending cases, aging, and resolution strategies"
      icon={<AlertCircle className="h-5 w-5 text-orange-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Pending Cases Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of pending cases including aging reports, 
            priority categorization, and resolution strategies.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default PendingCasesDetail;
