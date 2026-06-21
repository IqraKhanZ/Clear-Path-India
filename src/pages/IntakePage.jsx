import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { CheckCircle2, Circle } from 'lucide-react';
import IntakeChat from '../components/screens/IntakeChat';

const IntakePage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  const handleCompleteIntake = () => {
    navigate('/processing');
  };

  const stepsList = [
    { num: 1, label: 'Situation' },
    { num: 2, label: 'Location' },
    { num: 3, label: 'Agreement' },
    { num: 4, label: 'Urgency' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* Desktop Left Sidebar: Progress Tracker */}
      <div className="hidden md:flex flex-col w-[240px] bg-white border-r border-gray-200 py-8 px-5 shrink-0 select-none">
        <h2 className="text-[13px] font-extrabold text-textMuted uppercase tracking-wider mb-6">
          Your Progress
        </h2>

        <div className="space-y-6">
          {stepsList.map((step) => {
            const isCompleted = currentStep > step.num;
            const isActive = currentStep === step.num;

            return (
              <div key={step.num} className="flex items-center gap-3">
                {isCompleted ? (
                  <CheckCircle2 size={20} className="text-success shrink-0" />
                ) : isActive ? (
                  <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                ) : (
                  <Circle size={20} className="text-textMuted shrink-0" />
                )}
                
                <span
                  className={`text-sm font-semibold transition-colors duration-200 ${
                    isActive
                      ? 'text-primary'
                      : isCompleted
                      ? 'text-textPrimary'
                      : 'text-textMuted'
                  }`}
                >
                  Step {step.num}: {step.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Intake Conversation Area */}
      <div className="flex-1 h-screen flex flex-col max-w-2xl mx-auto w-full">
        <IntakeChat
          onComplete={handleCompleteIntake}
          onStepChange={(step) => setCurrentStep(step)}
        />
      </div>
    </div>
  );
};

export default IntakePage;
