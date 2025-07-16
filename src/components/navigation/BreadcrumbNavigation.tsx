
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '@/components/ui/breadcrumb';
import { Home, Shield, Database } from 'lucide-react';

const BreadcrumbNavigation = () => {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  const getBreadcrumbItems = () => {
    const items = [
      { label: 'Dashboard', path: '/dashboard', icon: <Home className="h-4 w-4" /> }
    ];

    if (pathSegments.length > 1 && pathSegments[0] === 'details') {
      if (pathSegments[1] === 'ncrc') {
        items.push({ label: 'NCRC', path: '/ncrc', icon: <Database className="h-4 w-4" /> });
        
        // Add specific NCRC page
        if (pathSegments[2]) {
          const pageTitle = getPageTitle(pathSegments[2], true);
          items.push({ label: pageTitle, path: location.pathname, icon: null });
        }
      } else {
        items.push({ label: 'CCTNS', path: '/cctns', icon: <Shield className="h-4 w-4" /> });
        
        // Add specific CCTNS page
        const pageTitle = getPageTitle(pathSegments[1], false);
        items.push({ label: pageTitle, path: location.pathname, icon: null });
      }
    }

    return items;
  };

  const getPageTitle = (slug: string, isNCRC: boolean) => {
    const titleMap: { [key: string]: string } = {
      // CCTNS pages
      'total-firs': 'Total FIRs',
      'resolution-rate': 'Resolution Rate',
      'pending-cases': 'Pending Cases',
      'resolution-time': 'Resolution Time',
      'crime-hotspots': 'Crime Hotspots',
      'repeat-offenders': 'Repeat Offenders',
      'pattern-match': 'Pattern Match',
      'mo-analysis': 'MO Analysis',
      'first-response-time': 'First Response Time',
      'investigation-quality': 'Investigation Quality',
      'court-success-rate': 'Court Success Rate',
      'resource-utilization': 'Resource Utilization',
      'digital-evidence': 'Digital Evidence',
      'forensic-tat': 'Forensic TAT',
      'public-safety-index': 'Public Safety Index',
      'compliance-score': 'Compliance Score',
      // NCRC pages
      'total-verifications': 'Total Verifications',
      'success-rate': 'Success Rate',
      'pending-requests': 'Pending Requests',
      'processing-time': 'Processing Time',
      'data-accuracy': 'Data Accuracy',
      'source-reliability': 'Source Reliability',
      'cross-reference': 'Cross Reference',
      'false-positives': 'False Positives',
      'customer-satisfaction': 'Customer Satisfaction',
      'completion-rate': 'Completion Rate',
      'sla-compliance': 'SLA Compliance',
      'abandonment-rate': 'Abandonment Rate',
      'fraud-detection': 'Fraud Detection',
      'high-risk-cases': 'High Risk Cases',
      'audit-trail': 'Audit Trail'
    };

    return titleMap[slug] || slug.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={item.path}>
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 ? (
                <BreadcrumbPage className="flex items-center gap-2">
                  {item.icon}
                  {item.label}
                </BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={item.path} className="flex items-center gap-2 hover:text-foreground">
                    {item.icon}
                    {item.label}
                  </Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default BreadcrumbNavigation;
