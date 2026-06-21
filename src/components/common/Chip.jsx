import React from 'react';

const Chip = ({
  label,
  selected = false,
  onSelect,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`inline-flex items-center justify-center px-4 py-2.5 rounded-xl border text-sm font-semibold transition-all duration-200 select-none ${
        selected
          ? 'border-primary bg-blue-50/60 text-primary ring-1 ring-primary'
          : 'border-gray-200 bg-white text-textPrimary hover:bg-gray-50'
      } ${className}`}
      {...props}
    >
      {label}
    </button>
  );
};

export default Chip;
