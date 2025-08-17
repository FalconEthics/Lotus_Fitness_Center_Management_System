import React from 'react';
import { motion } from 'framer-motion';
import { HiArrowTrendingUp, HiArrowTrendingDown } from 'react-icons/hi2';
import { Card } from './ui/Card';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
    period: string;
  };
  color?: 'red' | 'blue' | 'green' | 'yellow' | 'gray';
  loading?: boolean;
}

const colorVariants = {
  red: {
    bg: 'bg-error/5',
    icon: 'bg-error/10 text-error',
    text: 'text-error',
    ring: 'ring-error/10',
  },
  blue: {
    bg: 'bg-primary/5',
    icon: 'bg-primary/10 text-primary',
    text: 'text-primary',
    ring: 'ring-primary/10',
  },
  green: {
    bg: 'bg-success/5',
    icon: 'bg-success/10 text-success',
    text: 'text-success',
    ring: 'ring-success/10',
  },
  yellow: {
    bg: 'bg-warning/5',
    icon: 'bg-warning/10 text-warning',
    text: 'text-warning',
    ring: 'ring-warning/10',
  },
  gray: {
    bg: 'bg-base-200/30',
    icon: 'bg-base-200 text-base-content/60',
    text: 'text-base-content/60',
    ring: 'ring-base-200',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  color = 'red',
  loading = false,
}) => {
  const colors = colorVariants[color];

  return (
    <Card 
      hover 
      className="relative overflow-hidden"
      padding="lg"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-base-200/10" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-base-content/60 mb-1">
              {title}
            </p>
            
            {loading ? (
              <div className="h-8 bg-base-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-base-content mb-2">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}

            {change && !loading && (
              <div className="flex items-center gap-1">
                {change.type === 'increase' ? (
                  <HiArrowTrendingUp className="h-4 w-4 text-success" />
                ) : (
                  <HiArrowTrendingDown className="h-4 w-4 text-error" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change.type === 'increase' ? 'text-success' : 'text-error'
                  }`}
                >
                  {change.value}%
                </span>
                <span className="text-sm text-base-content/50">vs {change.period}</span>
              </div>
            )}
          </div>

          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-3 rounded-xl ${colors.icon} ${colors.ring} ring-4`}
          >
            <Icon className="h-6 w-6" />
          </motion.div>
        </div>
      </div>
    </Card>
  );
};