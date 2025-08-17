import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi2';
import { cn } from '../../utils/cn';

interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helper?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled';
}

const sizeVariants = {
  sm: 'px-3 py-2 text-sm',
  md: 'px-4 py-2.5 text-base',
  lg: 'px-4 py-3 text-lg',
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    helper, 
    options,
    placeholder,
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
          <motion.select
            ref={ref}
            whileFocus={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
            className={cn(
              // Base styles
              'w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 appearance-none cursor-pointer',
              // Size variants
              sizeVariants[size],
              // Icon padding
              'pr-10',
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
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </motion.select>
          
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-neutral-400">
            <HiChevronDown className="h-5 w-5" />
          </div>
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

Select.displayName = 'Select';