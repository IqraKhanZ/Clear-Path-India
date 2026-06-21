import React from 'react';
import { Check } from 'lucide-react';

const StepChecklist = ({
  steps = [],
  onToggle,
  loadingStepId = null,
  className = '',
}) => {
  return (
    <div className={`space-y-3.5 ${className}`}>
      {steps.map((step) => {
        const isCompleted = !!step.completed;
        const isLoading = step.id === loadingStepId;
        
        return (
          <div
            key={step.id}
            onClick={() => !isLoading && onToggle && onToggle(step.id, !isCompleted)}
            className={`flex items-start gap-3.5 cursor-pointer group select-none ${
              isLoading ? 'cursor-not-allowed opacity-80' : ''
            }`}
          >
            <div
              className={`mt-0.5 flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-md border-2 transition-all duration-200 ${
                isCompleted
                  ? 'border-success bg-success text-white'
                  : 'border-gray-300 bg-white group-hover:border-primary'
              }`}
            >
              {isLoading ? (
                <svg
                  className="animate-spin h-3 w-3 text-primary"
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
              ) : isCompleted ? (
                <Check size={14} strokeWidth={3} />
              ) : null}
            </div>
            <span
              className={`text-sm leading-relaxed transition-all duration-200 ${
                isCompleted
                  ? 'text-textMuted line-through decoration-gray-400'
                  : 'text-textPrimary font-semibold'
              }`}
            >
              {step.text}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StepChecklist;
