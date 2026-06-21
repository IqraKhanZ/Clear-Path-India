import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({
  isOpen,
  onClose,
  title = '',
  children,
  className = '',
}) => {
  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 animate-fade-in"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className={`relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 z-10 overflow-hidden transform transition-all duration-300 scale-100 animate-scale-in max-h-[85vh] flex flex-col ${className}`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 shrink-0">
          <h3 className="text-base font-bold text-textPrimary leading-snug">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-textMuted hover:text-textPrimary hover:bg-gray-100 transition-colors"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto text-sm text-textMuted leading-relaxed flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
