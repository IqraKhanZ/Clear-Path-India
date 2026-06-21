import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home as HomeIcon, Shield, Lock, CheckCircle, MessageSquare, Search, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Button from '../components/common/Button';
import LanguageToggle from '../components/common/LanguageToggle';

const LandingPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setGuest } = useAuth();

  const handleGetStarted = () => {
    navigate('/auth/signup');
  };

  const handleContinueAsGuest = (e) => {
    e.preventDefault();
    setGuest(true);
    navigate('/intake');
  };

  const handleSignIn = (e) => {
    e.preventDefault();
    navigate('/auth/login');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-between">
      {/* Top bar */}
      <header className="sticky top-0 w-full h-16 bg-white border-b border-gray-150 flex items-center justify-between px-6 z-30 shadow-sm shrink-0">
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
          <HomeIcon size={20} className="text-primary animate-pulse" />
          <span className="text-base font-extrabold text-primary tracking-tight">
            ClearPath <span className="text-accent">India</span>
          </span>
        </div>
        <LanguageToggle />
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center items-center px-6 py-12 max-w-xl mx-auto w-full text-center">
        <span className="text-[11px] font-bold uppercase tracking-wider text-textMuted bg-gray-100 px-3 py-1 rounded-full">
          {t('landing.tagline')}
        </span>
        
        <h1 className="text-[28px] leading-tight font-extrabold text-textPrimary mt-4 tracking-tight">
          {t('landing.headline')}
        </h1>
        
        <p className="text-[15px] leading-relaxed text-textMuted mt-3.5 px-2">
          {t('landing.subheading')}
        </p>

        {/* Action Button */}
        <div className="w-full mt-8 px-2">
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={handleGetStarted}
            className="shadow-md shadow-blue-500/10 hover:shadow-blue-500/20"
          >
            {t('landing.getStarted')}
          </Button>

          {/* Guest and Sign In Links */}
          <div className="flex flex-col sm:flex-row justify-center items-center gap-2 mt-4 text-xs font-semibold">
            <button
              onClick={handleSignIn}
              className="text-primary hover:underline py-1 px-2 rounded-lg hover:bg-blue-50 transition-all"
            >
              {t('auth.haveAccount')}
            </button>
            <span className="hidden sm:inline text-gray-300 select-none">•</span>
            <button
              onClick={handleContinueAsGuest}
              className="text-textMuted hover:text-textPrimary hover:underline py-1 px-2 rounded-lg hover:bg-gray-100 transition-all"
            >
              {t('landing.continueAsGuest')}
            </button>
          </div>
        </div>

        {/* Trust bar */}
        <div className="w-full mt-10 grid grid-cols-3 gap-2 border-t border-gray-150 pt-6 px-1">
          <div className="flex flex-col items-center text-center">
            <Shield size={16} className="text-textMuted mb-1" />
            <span className="text-[10px] font-semibold text-textMuted leading-tight">{t('landing.notLegalAdvice')}</span>
          </div>
          <div className="flex flex-col items-center text-center border-x border-gray-100">
            <Lock size={16} className="text-textMuted mb-1" />
            <span className="text-[10px] font-semibold text-textMuted leading-tight">{t('landing.privateSecure')}</span>
          </div>
          <div className="flex flex-col items-center text-center">
            <CheckCircle size={16} className="text-textMuted mb-1" />
            <span className="text-[10px] font-semibold text-textMuted leading-tight">{t('landing.verifiedSources')}</span>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="bg-white border-y border-gray-150 py-10 px-6 w-full">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-center text-xs font-extrabold uppercase tracking-widest text-textMuted mb-8">
            {t('landing.howItWorks')}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 relative">
            {/* Steps */}
            {[
              {
                num: 1,
                icon: MessageSquare,
                title: t('landing.step1'),
                desc: t('landing.step1Desc'),
              },
              {
                num: 2,
                icon: Search,
                title: t('landing.step2'),
                desc: t('landing.step2Desc'),
              },
              {
                num: 3,
                icon: ArrowRight,
                title: t('landing.step3'),
                desc: t('landing.step3Desc'),
              },
            ].map((step, idx) => {
              const StepIcon = step.icon;
              return (
                <div key={step.num} className="flex flex-col items-center text-center relative z-10">
                  {/* Step number badge & icon */}
                  <div className="relative mb-3 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-primary shadow-sm">
                      <StepIcon size={22} />
                    </div>
                    <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-white border-2 border-white shadow-sm">
                      {step.num}
                    </span>
                  </div>

                  <h3 className="text-[15px] font-bold text-textPrimary leading-snug">{step.title}</h3>
                  <p className="text-xs text-textMuted mt-1 px-4 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 px-6 text-center bg-gray-50 border-t border-gray-100 shrink-0">
        <p className="text-[10px] font-medium text-gray-400 max-w-md mx-auto leading-relaxed">
          {t('landing.footer')}
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
