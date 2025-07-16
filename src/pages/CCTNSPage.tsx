
import { CCTNSDashboard } from '@/components/dashboards/CCTNSDashboard';
import { BarChart3 } from 'lucide-react';

const CCTNSPage = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full h-full p-2 md:p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold flex items-center gap-2 text-foreground">
            <BarChart3 className="h-7 w-7 text-blue-600" />
            CCTNS FIR Trend & Category Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            Comprehensive analysis of First Information Reports including trends, categories, and geographical distribution
          </p>
        </div>
        <CCTNSDashboard />
      </div>
    </div>
  );
};

export default CCTNSPage;
