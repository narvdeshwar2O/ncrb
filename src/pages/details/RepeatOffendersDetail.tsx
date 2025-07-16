
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Users } from 'lucide-react';

const RepeatOffendersDetail = () => {
  return (
    <DetailPageLayout
      title="Repeat Offenders Analysis"
      description="Detailed analysis of repeat offenders and recidivism patterns"
      icon={<Users className="h-5 w-5 text-red-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Repeat Offenders Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of repeat offenders including identification patterns, 
            recidivism rates, and intervention strategies.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default RepeatOffendersDetail;
