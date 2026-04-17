import React from 'react';
import { cn } from '../../lib/utils';

const variants = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border border-blue-600 hover:border-blue-700',
  secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-200 hover:border-gray-300',
  danger: 'bg-red-600 hover:bg-red-700 text-white border border-red-600 hover:border-red-700',
  success: 'bg-green-600 hover:bg-green-700 text-white border border-green-600 hover:border-green-700',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-900 border border-transparent',
  outline: 'bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 hover:border-gray-400',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
};

export function Button({ 
  children, 
  className = '', 
  variant = 'primary',
  size = 'md',
  disabled = false,
  type = 'button',
  ...props 
}) {
  const variantClass = variants[variant] || variants.primary;
  const sizeClass = sizes[size] || sizes.md;
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <button
      type={type}
      className={cn(
        'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
        variantClass,
        sizeClass,
        disabledClass,
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
