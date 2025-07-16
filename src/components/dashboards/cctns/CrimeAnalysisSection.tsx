
import { MapPin, Users, Target, Eye } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const CrimeAnalysisSection = () => {
  const crimeAnalysisMetrics = [
    {
      title: 'Crime Hotspots',
      value: '156',
      trend: { value: '+12 new hotspots', isPositive: true },
      icon: MapPin,
      linkTo: '/details/crime-hotspots'
    },
    {
      title: 'Repeat Offenders',
      value: '2,340',
      trend: { value: '-5.2% identified', isPositive: false },
      icon: Users,
      linkTo: '/details/repeat-offenders'
    },
    {
      title: 'Pattern Match Rate',
      value: '78.3%',
      trend: { value: '+3.1% accuracy', isPositive: true },
      icon: Target,
      linkTo: '/details/pattern-match'
    },
    {
      title: 'MO Analysis',
      value: '89.2%',
      trend: { value: 'Pattern recognition', isPositive: true },
      icon: Eye,
      linkTo: '/details/mo-analysis'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Crime Analysis & Intelligence</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {crimeAnalysisMetrics.map((metric) => (
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
    </div>
  );
};
