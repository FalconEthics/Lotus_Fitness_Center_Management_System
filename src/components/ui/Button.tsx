import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '../../utils/cn';

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends Omit<HTMLMotionProps<'button'>, 'size'> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: 'bg-primary hover:bg-primary-focus text-primary-content shadow-md hover:shadow-lg',
  secondary: 'bg-secondary hover:bg-secondary-focus text-secondary-content shadow-md hover:shadow-lg',
  outline: 'border-2 border-primary text-primary hover:bg-primary/10 hover:text-primary-focus',
  ghost: 'text-base-content hover:bg-base-200 hover:text-base-content',
  danger: 'bg-error hover:bg-error-focus text-error-content shadow-md hover:shadow-lg',
};

const buttonSizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    loading = false, 
    icon, 
    children, 
    fullWidth = false,
    className,
    disabled,
    ...props 
  }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        transition={{ duration: 0.15 }}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant styles
          buttonVariants[variant],
          // Size styles
          buttonSizes[size],
          // Full width
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        {!loading && icon && <span className="flex-shrink-0">{icon}</span>}
        <span>{children}</span>
      </motion.button>
    );
  }
);

Button.displayName = 'Button';