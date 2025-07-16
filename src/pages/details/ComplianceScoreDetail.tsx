
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Target } from 'lucide-react';

const ComplianceScoreDetail = () => {
  return (
    <DetailPageLayout
      title="Compliance Score Analysis"
      description="Detailed analysis of regulatory compliance and human rights adherence"
      icon={<Target className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Compliance Score Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of compliance scores including regulatory adherence, 
            human rights compliance, and audit results.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default ComplianceScoreDetail;
