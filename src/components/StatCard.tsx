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
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-600',
    ring: 'ring-red-100',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-600',
    ring: 'ring-blue-100',
  },
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-600',
    ring: 'ring-green-100',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-600',
    ring: 'ring-yellow-100',
  },
  gray: {
    bg: 'bg-neutral-50',
    icon: 'bg-neutral-100 text-neutral-600',
    text: 'text-neutral-600',
    ring: 'ring-neutral-100',
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
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-neutral-50/30" />
      
      <div className="relative">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-neutral-600 mb-1">
              {title}
            </p>
            
            {loading ? (
              <div className="h-8 bg-neutral-200 rounded animate-pulse" />
            ) : (
              <p className="text-3xl font-bold text-neutral-900 mb-2">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}

            {change && !loading && (
              <div className="flex items-center gap-1">
                {change.type === 'increase' ? (
                  <HiArrowTrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <HiArrowTrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span
                  className={`text-sm font-medium ${
                    change.type === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {change.value}%
                </span>
                <span className="text-sm text-neutral-500">vs {change.period}</span>
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