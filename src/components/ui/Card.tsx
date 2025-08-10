import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  border?: boolean;
  hover?: boolean;
}

const paddingVariants = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
};

const shadowVariants = {
  none: '',
  sm: 'shadow-sm',
  md: 'shadow-md',
  lg: 'shadow-lg',
};

export const Card: React.FC<CardProps> = ({
  children,
  padding = 'md',
  shadow = 'md',
  border = true,
  hover = false,
  className,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      className={cn(
        'bg-white rounded-xl',
        paddingVariants[padding],
        shadowVariants[shadow],
        border && 'border border-neutral-200',
        hover && 'cursor-pointer transition-shadow duration-200 hover:shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Sub-components for better composition
export const CardHeader = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-xl font-semibold text-neutral-900 mb-2', className)} {...props}>
    {children}
  </h3>
);

export const CardContent = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('text-neutral-600', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ children, className, ...props }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('mt-4 pt-4 border-t border-neutral-200', className)} {...props}>
    {children}
  </div>
);

// Also attach to Card for backward compatibility
Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;