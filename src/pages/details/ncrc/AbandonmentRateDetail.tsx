
import { DetailPageLayout } from '@/components/layouts/DetailPageLayout';
import { TrendingDown } from 'lucide-react';

const AbandonmentRateDetail = () => {
  return (
    <DetailPageLayout
      title="Abandonment Rate Analysis"
      description="Detailed analysis of request abandonment patterns and retention strategies"
      icon={<TrendingDown className="h-5 w-5 text-red-600" />}
    >
      <div className="space-y-8">
        <div className="bg-white dark:bg-slate-800 p-8 rounded-lg shadow-sm">
          <h3 className="text-2xl font-semibold text-foreground mb-4">Abandonment Rate Dashboard</h3>
          <p className="text-muted-foreground text-lg mb-6">Comprehensive analysis coming soon...</p>
          <p className="text-muted-foreground">
            This page will contain detailed analysis of abandonment pattern analysis,
            reasons for abandonment, customer retention strategies, and process simplification insights.
          </p>
        </div>
      </div>
    </DetailPageLayout>
  );
};

export default AbandonmentRateDetail;
