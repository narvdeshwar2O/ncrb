
import { Clock, Shield, Gavel, Users } from 'lucide-react';
import { MetricCard } from './MetricCard';

export const OperationalEfficiencySection = () => {
  const operationalMetrics = [
    {
      title: 'First Response Time',
      value: '12 min',
      trend: { value: '-2 min improvement', isPositive: false },
      icon: Clock,
      linkTo: '/details/first-response-time'
    },
    {
      title: 'Investigation Quality',
      value: '85.7%',
      trend: { value: '+4.2% quality score', isPositive: true },
      icon: Shield,
      linkTo: '/details/investigation-quality'
    },
    {
      title: 'Court Success Rate',
      value: '72.1%',
      trend: { value: '+1.8% conviction rate', isPositive: true },
      icon: Gavel,
      linkTo: '/details/court-success-rate'
    },
    {
      title: 'Resource Utilization',
      value: '91.4%',
      trend: { value: 'Officer efficiency', isPositive: true },
      icon: Users,
      linkTo: '/details/resource-utilization'
    }
  ];

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Operational Efficiency</h3>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {operationalMetrics.map((metric) => (
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
