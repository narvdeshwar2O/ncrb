
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { Clock } from 'lucide-react';

const ForensicTATDetail = () => {
  return (
    <DetailPageLayout
      title="Forensic TAT Analysis"
      description="Detailed analysis of forensic turnaround times and laboratory efficiency"
      icon={<Clock className="h-5 w-5 text-orange-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Forensic TAT Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of forensic turnaround times including processing efficiency, 
            laboratory capacity, and quality metrics.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default ForensicTATDetail;
