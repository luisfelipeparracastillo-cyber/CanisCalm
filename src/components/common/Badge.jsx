import React from 'react';

export function Badge({
  children,
  variant = 'sage',
  size = 'md',
  dot = false,
  className = '',
}) {
  const variantStyles = {
    sage: 'bg-sage-100 text-sage-800 border-sage-200',
    terracotta: 'bg-terracotta-100 text-terracotta-800 border-terracotta-200',
    amber: 'bg-amber-100 text-amber-800 border-amber-200',
    neutral: 'bg-stone-100 text-stone-700 border-stone-200',
    success: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
  };

  const dotColors = {
    sage: 'bg-sage-500',
    terracotta: 'bg-terracotta-500',
    amber: 'bg-amber-500',
    neutral: 'bg-stone-400',
    success: 'bg-emerald-500',
    danger: 'bg-rose-500',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 gap-1',
    md: 'text-sm px-3 py-1 gap-1.5',
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${variantStyles[variant] || variantStyles.sage} ${sizeStyles[size] || sizeStyles.md} ${className}`}
    >
      {dot && (
        <span
          className={`w-2 h-2 rounded-full ${dotColors[variant] || dotColors.sage}`}
        />
      )}
      {children}
    </span>
  );
}

export default Badge;
