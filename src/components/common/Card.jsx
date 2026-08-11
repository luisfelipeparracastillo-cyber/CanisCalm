import React from 'react';

export function Card({
  children,
  className = '',
  hoverable = false,
  padding = 'md',
  onClick,
  ...props
}) {
  const paddingStyles = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const baseStyles = 'bg-white rounded-3xl border border-surface-border shadow-soft transition-all duration-300';
  const hoverStyles = hoverable
    ? 'hover:shadow-hover hover:-translate-y-0.5 cursor-pointer hover:border-sage-300'
    : '';

  return (
    <div
      className={`${baseStyles} ${paddingStyles[padding] || paddingStyles.md} ${hoverStyles} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
}

export default Card;
