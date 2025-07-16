
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  trend: {
    value: string;
    isPositive: boolean;
  };
  icon: LucideIcon;
  linkTo: string;
}

export const MetricCard = ({ title, value, trend, icon: Icon, linkTo }: MetricCardProps) => {
  return (
    <Link to={linkTo}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <Icon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{value}</div>
          <p className="text-xs text-muted-foreground">
            {trend.isPositive ? (
              <TrendingUp className="inline h-3 w-3 text-green-500" />
            ) : (
              <TrendingDown className="inline h-3 w-3 text-green-500" />
            )}
            {trend.value}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
};
