import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const ExpandableRow = ({
  title,
  children,
  defaultExpanded = false,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`border-b border-gray-150 last:border-b-0 py-3 ${className}`}>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left py-1 text-sm font-semibold text-textPrimary hover:text-primary transition-colors focus:outline-none"
      >
        <span>{title}</span>
        <span className="text-textMuted select-none shrink-0 ml-4">
          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-[500px] opacity-100 mt-2.5 pb-1' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="text-xs sm:text-sm text-textMuted leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

export default ExpandableRow;
