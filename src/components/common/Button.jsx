import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  disabled = false,
  onClick,
  className = '',
  type = 'button',
  ...props
}) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

  const variantStyles = {
    primary: 'bg-sage-500 hover:bg-sage-600 active:bg-sage-700 text-white shadow-soft focus:ring-sage-400 rounded-2xl',
    secondary: 'bg-terracotta-500 hover:bg-terracotta-600 active:bg-terracotta-700 text-white shadow-soft focus:ring-terracotta-400 rounded-2xl',
    outline: 'bg-transparent border-2 border-sage-500 text-sage-700 hover:bg-sage-50 focus:ring-sage-400 rounded-2xl',
    ghost: 'bg-transparent text-ink-secondary hover:bg-sage-50 hover:text-sage-700 rounded-xl',
    soft: 'bg-sage-100 text-sage-800 hover:bg-sage-200 focus:ring-sage-300 rounded-2xl',
    danger: 'bg-rose-500 hover:bg-rose-600 text-white shadow-soft rounded-2xl focus:ring-rose-400',
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2.5 gap-2',
    lg: 'text-base px-6 py-3.5 gap-2.5 rounded-3xl',
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.md} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon ? (
        <Icon className={size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      ) : null}
      <span>{children}</span>
    </button>
  );
}

export default Button;
