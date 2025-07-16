
import { Database, Clock, Shield, Target } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const TechnologyEvidenceSection = () => {
  const technologyMetrics = [
    {
      title: 'Digital Evidence Rate',
      value: '68.9%',
      trend: { value: '+8.2% collection rate', isPositive: true },
      icon: Database,
      linkTo: '/details/digital-evidence'
    },
    {
      title: 'Forensic TAT',
      value: '7.2 days',
      trend: { value: '-1.8 days faster', isPositive: false },
      icon: Clock,
      linkTo: '/details/forensic-tat'
    },
    {
      title: 'Public Safety Index',
      value: '7.8/10',
      trend: { value: '+0.3 community confidence', isPositive: true },
      icon: Shield,
      linkTo: '/details/public-safety-index'
    },
    {
      title: 'Compliance Score',
      value: '94.6%',
      trend: { value: 'Human rights compliance', isPositive: true },
      icon: Target,
      linkTo: '/details/compliance-score'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Technology & Evidence</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {technologyMetrics.map((metric) => (
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
