import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
}

const sizeVariants = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helper, 
    startIcon, 
    endIcon, 
    size = 'md',
    variant = 'default',
    className,
    ...props 
  }, ref) => {
    return (
      <div className="space-y-1">
        {label && (
          <label className="block text-sm font-medium text-base-content">
            {label}
            {props.required && <span className="text-error ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40">
              {startIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // Base styles
              'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary',
              // Size variants
              sizeVariants[size],
              // Icon padding
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              // Variant styles
              variant === 'default' && 'border-base-300 bg-base-100 hover:border-base-content/40',
              variant === 'filled' && 'border-transparent bg-base-200 hover:bg-base-200/50',
              // Error state
              error && 'border-error focus:ring-error',
              // Disabled state
              props.disabled && 'opacity-50 cursor-not-allowed bg-base-200',
              className
            )}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40">
              {endIcon}
            </div>
          )}
        </div>
        
        {(error || helper) && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              'text-sm',
              error ? 'text-error' : 'text-base-content/60'
            )}
          >
            {error || helper}
          </motion.div>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';