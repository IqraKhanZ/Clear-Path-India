import React, { useEffect } from 'react';
import { CheckCircle, AlertTriangle, AlertCircle, X } from 'lucide-react';

const Toast = ({
  message,
  type = 'success',
  onClose,
  duration = 3000,
  className = '',
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const icons = {
    success: <CheckCircle size={18} className="text-white" />,
    warning: <AlertTriangle size={18} className="text-white" />,
    error: <AlertCircle size={18} className="text-white" />,
  };

  const bgColors = {
    success: 'bg-success',
    warning: 'bg-warning text-textPrimary',
    error: 'bg-danger',
  };

  const textColors = {
    success: 'text-white',
    warning: 'text-gray-900',
    error: 'text-white',
  };

  return (
    <div
      className={`fixed bottom-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg animate-fade-in ${
        bgColors[type]
      } ${textColors[type]} max-w-[90%] w-72 sm:w-auto ${className}`}
      role="alert"
    >
      <span className="shrink-0">{icons[type]}</span>
      <span className="text-sm font-semibold flex-1 leading-snug">{message}</span>
      <button
        onClick={onClose}
        className="shrink-0 opacity-70 hover:opacity-100 p-0.5 rounded-lg hover:bg-black/10 transition-colors"
        aria-label="Dismiss toast"
      >
        <X size={14} />
      </button>
    </div>
  );
};

export default Toast;
