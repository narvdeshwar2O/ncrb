
import React from 'react';
import BreadcrumbNavigation from '@/components/navigation/BreadcrumbNavigation';

interface DetailPageLayoutProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const DetailPageLayout: React.FC<DetailPageLayoutProps> = ({
  title,
  description,
  icon,
  children
}) => {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full p-4 md:p-6">
        {/* Breadcrumb Navigation */}
        <BreadcrumbNavigation />
        
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold flex items-center gap-2 text-foreground mb-2">
            {icon}
            {title}
          </h1>
          <p className="text-muted-foreground text-lg">
            {description}
          </p>
        </div>
        
        {/* Content */}
        <div className="w-full">
          {children}
        </div>
      </div>
    </div>
  );
};
