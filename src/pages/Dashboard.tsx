
import { CCTNSMetricsCards } from '@/components/dashboards/cctns/CCTNSMetricsCards';
import { NCRCMetricsCards } from '@/components/dashboards/ncrc/NCRCMetricsCards';
import { BarChart3, Activity } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full h-full p-2 md:p-4 space-y-8">
        {/* CCTNS Metrics Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              CCTNS Key Metrics
            </h2>
            <p className="text-muted-foreground mt-1">
              Overview of First Information Reports and crime analytics
            </p>
          </div>
          <CCTNSMetricsCards />
        </div>

        {/* NCRC Metrics Section */}
        <div>
          <div className="mb-6">
            <h2 className="text-2xl font-semibold flex items-center gap-2 text-foreground">
              <Activity className="h-6 w-6 text-green-600" />
              NCRC Key Metrics
            </h2>
            <p className="text-muted-foreground mt-1">
              Overview of verification requests and processing insights
            </p>
          </div>
          <NCRCMetricsCards />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
