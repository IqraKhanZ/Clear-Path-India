import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

const ProcessingScreen = ({ onComplete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0); // 0, 1, 2

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 800);
    const t2 = setTimeout(() => setStep(2), 1600);
    const t3 = setTimeout(() => {
      if (onComplete) {
        onComplete();
      } else {
        navigate('/results');
      }
    }, 3000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center px-6">
      <div className="flex flex-col items-center text-center max-w-xs w-full">
        {/* Animated House Icon */}
        <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-3xl flex items-center justify-center text-primary shadow-sm animate-pulse mb-8">
          <Home size={40} strokeWidth={2.5} className="animate-bounce [animation-duration:1.8s]" />
        </div>

        {/* Sequenced Text Messages */}
        <div className="space-y-3 min-h-[90px]">
          <h2
            className={`text-xl font-extrabold text-textPrimary transition-all duration-500 transform ${
              step >= 0 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {t('proc.understood')}
          </h2>

          <p
            className={`text-sm font-semibold text-textMuted transition-all duration-500 transform ${
              step >= 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {t('proc.checkingLaws')}
          </p>

          <p
            className={`text-sm font-semibold text-textMuted transition-all duration-500 transform ${
              step >= 2 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
            }`}
          >
            {t('proc.checkingSchemes')}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProcessingScreen;
