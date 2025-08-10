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
          <label className="block text-sm font-medium text-neutral-700">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        
        <div className="relative">
          {startIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">
              {startIcon}
            </div>
          )}
          
          <motion.input
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // Base styles
              'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500',
              // Size variants
              sizeVariants[size],
              // Icon padding
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              // Variant styles
              variant === 'default' && 'border-neutral-300 bg-white hover:border-neutral-400',
              variant === 'filled' && 'border-transparent bg-neutral-100 hover:bg-neutral-50',
              // Error state
              error && 'border-red-500 focus:ring-red-500',
              // Disabled state
              props.disabled && 'opacity-50 cursor-not-allowed bg-neutral-100',
              className
            )}
            {...props}
          />
          
          {endIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
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
              error ? 'text-red-600' : 'text-neutral-500'
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