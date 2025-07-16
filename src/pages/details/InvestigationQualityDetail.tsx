
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Shield } from 'lucide-react';

const InvestigationQualityDetail = () => {
  return (
    <DetailPageLayout
      title="Investigation Quality Analysis"
      description="Detailed analysis of investigation quality metrics and standards"
      icon={<Shield className="h-5 w-5 text-green-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Investigation Quality Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of investigation quality including standards compliance, 
            procedural adherence, and quality improvement initiatives.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default InvestigationQualityDetail;
