import React from 'react';

const ProgressBar = ({
  value = 0,
  color = 'bg-primary',
  trackColor = 'bg-gray-200',
  height = 'h-1.5',
  className = '',
  ...props
}) => {
  // Ensure value is between 0 and 100
  const normalizedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div
      className={`w-full ${trackColor} rounded-full overflow-hidden ${height} ${className}`}
      role="progressbar"
      aria-valuenow={normalizedValue}
      aria-valuemin="0"
      aria-valuemax="100"
      {...props}
    >
      <div
        className={`${color} h-full rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${normalizedValue}%` }}
      />
    </div>
  );
};

export default ProgressBar;
