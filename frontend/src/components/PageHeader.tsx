import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, badge, actions }) => {
  return (
    <section className="page-hero">
      <div className="page-grid" />
      <div className="page-orb page-orb--one" />
      <div className="page-orb page-orb--two" />
      <div className="page-orb page-orb--three" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            {badge && <p className="page-badge">{badge}</p>}
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">{title}</h1>
            {subtitle && <p className="mt-2 text-white/85 max-w-2xl">{subtitle}</p>}
          </div>
          {actions && <div className="flex flex-wrap gap-3">{actions}</div>}
        </div>
      </div>
    </section>
  );
};

export default PageHeader;
