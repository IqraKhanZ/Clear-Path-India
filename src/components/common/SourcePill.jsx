import React from 'react';
import { ExternalLink } from 'lucide-react';

const SourcePill = ({
  label,
  onClick,
  className = '',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50/80 border border-blue-100 text-primary hover:bg-blue-100/60 transition-all duration-200 ${className}`}
    >
      <span>{label}</span>
      <ExternalLink size={11} strokeWidth={2.5} className="shrink-0" />
    </button>
  );
};

export default SourcePill;
