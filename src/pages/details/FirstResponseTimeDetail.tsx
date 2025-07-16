
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Clock } from 'lucide-react';

const FirstResponseTimeDetail = () => {
  return (
    <DetailPageLayout
      title="First Response Time Analysis"
      description="Detailed analysis of emergency response times and efficiency metrics"
      icon={<Clock className="h-5 w-5 text-blue-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">First Response Time Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of response times including geographic variations, 
            resource allocation efficiency, and improvement strategies.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default FirstResponseTimeDetail;
