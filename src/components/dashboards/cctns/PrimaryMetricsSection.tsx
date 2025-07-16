
import { FileText, TrendingUp, AlertCircle, Calendar, MapPin, Users, Clock } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const PrimaryMetricsSection = () => {
  const primaryMetrics = [
    {
      title: 'Total FIRs',
      value: '78,100',
      trend: { value: '+5.2% from last month', isPositive: true },
      icon: FileText,
      linkTo: '/details/total-firs'
    },
    {
      title: 'Resolution Rate',
      value: '65.4%',
      trend: { value: '+2.1% from last month', isPositive: true },
      icon: TrendingUp,
      linkTo: '/details/resolution-rate'
    },
    {
      title: 'Pending Cases',
      value: '27,000',
      trend: { value: '-3.4% from last month', isPositive: false },
      icon: AlertCircle,
      linkTo: '/details/pending-cases'
    },
    {
      title: 'Avg Resolution Time',
      value: '45 days',
      trend: { value: '-8 days from last month', isPositive: false },
      icon: Calendar,
      linkTo: '/details/resolution-time'
    },
    {
      title: 'Crime Hotspots',
      value: '156',
      trend: { value: '+12 new this month', isPositive: true },
      icon: MapPin,
      linkTo: '/details/crime-hotspots'
    },
    {
      title: 'Repeat Offenders',
      value: '1,245',
      trend: { value: '+8.3% from last month', isPositive: true },
      icon: Users,
      linkTo: '/details/repeat-offenders'
    },
    {
      title: 'First Response Time',
      value: '12 mins',
      trend: { value: '-2 mins improvement', isPositive: false },
      icon: Clock,
      linkTo: '/details/first-response-time'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {primaryMetrics.map((metric) => (
        <MetricCard
          key={metric.title}
          title={metric.title}
          value={metric.value}
          trend={metric.trend}
          icon={metric.icon}
          linkTo={metric.linkTo}
        />
      ))}
    </div>
  );
};
