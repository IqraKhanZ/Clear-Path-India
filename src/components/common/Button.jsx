import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon = null,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  ...props
}) => {
  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-xl active:scale-[0.98] select-none';

  // Variant classes
  const variants = {
    primary: 'bg-primary text-white hover:bg-blue-700 focus:ring-blue-500 disabled:bg-blue-300 disabled:active:scale-100',
    outlined: 'border border-primary text-primary hover:bg-blue-50 focus:ring-blue-500 disabled:border-blue-200 disabled:text-blue-300 disabled:active:scale-100',
    text: 'text-textMuted hover:text-textPrimary hover:bg-gray-100 focus:ring-gray-300 disabled:text-gray-300 disabled:active:scale-100',
    danger: 'bg-danger text-white hover:bg-red-700 focus:ring-red-500 disabled:bg-red-300 disabled:active:scale-100',
  };

  // Size classes
  const sizes = {
    sm: 'text-xs px-3 py-1.5 h-8',
    md: 'text-sm px-4 py-2.5 h-11',
    lg: 'text-base px-6 py-3.5 h-[52px]',
  };

  const widthClass = fullWidth ? 'w-full flex' : '';
  const disabledState = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabledState}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {!loading && icon && <span className="mr-2 inline-flex">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};

export default Button;
