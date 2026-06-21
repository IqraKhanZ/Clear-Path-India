import React from 'react';

const TypingIndicator = ({ className = '' }) => {
  return (
    <div className={`flex items-center gap-1.5 py-2 px-3 bg-gray-100 rounded-2xl w-fit ${className}`}>
      <div className="h-2 w-2 bg-textMuted rounded-full animate-bounce [animation-delay:-0.3s]" />
      <div className="h-2 w-2 bg-textMuted rounded-full animate-bounce [animation-delay:-0.15s]" />
      <div className="h-2 w-2 bg-textMuted rounded-full animate-bounce" />
    </div>
  );
};

export default TypingIndicator;
