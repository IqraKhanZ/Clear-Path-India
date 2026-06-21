import React from 'react';

const Card = ({
  children,
  borderColor = 'border-gray-200', // default light gray border
  background = 'bg-white', // default surface white
  padding = 'p-4', // default 16px padding
  borderRadius = 'rounded-2xl', // default 16px border-radius
  className = '',
  ...props
}) => {
  return (
    <div
      className={`border ${borderColor} ${background} ${padding} ${borderRadius} shadow-sm ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
