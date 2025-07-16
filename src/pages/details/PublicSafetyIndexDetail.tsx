
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Shield } from 'lucide-react';

const PublicSafetyIndexDetail = () => {
  return (
    <DetailPageLayout
      title="Public Safety Index Analysis"
      description="Detailed analysis of public safety metrics and community confidence"
      icon={<Shield className="h-5 w-5 text-green-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Public Safety Index Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of public safety metrics including community confidence, 
            safety perception, and preventive measures effectiveness.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default PublicSafetyIndexDetail;
