
import { NCRCDashboard } from '@/components/dashboards/NCRCDashboard';
import { Activity } from 'lucide-react';

const NCRCPage = () => {
  return (
    <div className="min-h-screen w-full bg-background">
      <div className="w-full h-full p-2 md:p-4">
        <div className="mb-6">
          <h1 className="text-3xl font-semibold flex items-center gap-2 text-foreground">
            <Activity className="h-7 w-7 text-green-600" />
            NCRC Verification Insights Dashboard
          </h1>
          <p className="text-muted-foreground mt-2">
            National Crime Records Bureau verification statistics and processing insights
          </p>
        </div>
        <NCRCDashboard />
      </div>
    </div>
  );
};

export default NCRCPage;
