
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Clock, Database, Shield, Users, Target } from 'lucide-react';

export const NCRCMetricsCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Verifications</CardTitle>
          <Database className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">303,000</div>
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="inline h-3 w-3 text-green-500" />
            +12.5% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">91.2%</div>
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="inline h-3 w-3 text-green-500" />
            +1.8% from last month
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">16,100</div>
          <p className="text-xs text-muted-foreground">
            <XCircle className="inline h-3 w-3 text-orange-500" />
            +5.2% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">3.2 days</div>
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="inline h-3 w-3 text-green-500" />
            -0.5 days improvement
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">High Risk Cases</CardTitle>
          <Shield className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">2,145</div>
          <p className="text-xs text-muted-foreground">
            <XCircle className="inline h-3 w-3 text-orange-500" />
            +15.3% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Repeat Requesters</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">12,850</div>
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="inline h-3 w-3 text-green-500" />
            +8.7% from last month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">First Response Time</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4 hours</div>
          <p className="text-xs text-muted-foreground">
            <CheckCircle className="inline h-3 w-3 text-green-500" />
            -1 hour improvement
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
