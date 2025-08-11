import React from 'react';

interface StatCardProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  value: number | string;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  icon: Icon, 
  title, 
  value, 
  className = "" 
}) => {
  const isCustomColor = className.includes('bg-primary') || className.includes('bg-success') || className.includes('bg-error') || className.includes('bg-secondary') || className.includes('bg-warning') || className.includes('bg-info') || className.includes('bg-accent');
  const baseClasses = isCustomColor ? `card shadow-xl ${className}` : `card bg-base-200 shadow-xl ${className}`;
  const iconClasses = isCustomColor ? "w-6 h-6" : "w-6 h-6 text-primary";
  const titleClasses = isCustomColor ? "card-title text-sm font-medium" : "card-title text-sm font-medium text-base-content";
  const valueClasses = isCustomColor ? "stat-value text-2xl md:text-3xl font-bold" : "stat-value text-2xl md:text-3xl font-bold text-base-content";

  return (
    <div className={baseClasses}>
      <div className="card-body items-center text-center">
        <div className="flex items-center gap-2 mb-2">
          <Icon className={iconClasses} />
          <h2 className={titleClasses}>{title}</h2>
        </div>
        <div className={valueClasses}>{value}</div>
      </div>
    </div>
  );
};