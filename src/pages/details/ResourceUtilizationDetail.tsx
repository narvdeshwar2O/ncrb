
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Users } from 'lucide-react';

const ResourceUtilizationDetail = () => {
  return (
    <DetailPageLayout
      title="Resource Utilization Analysis"
      description="Detailed analysis of resource allocation and efficiency metrics"
      icon={<Users className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Resource Utilization Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of resource utilization including personnel efficiency, 
            equipment usage, and optimization opportunities.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default ResourceUtilizationDetail;
