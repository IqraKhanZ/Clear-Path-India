import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Clock, Search, ChevronLeft, Send } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Chip from '../common/Chip';
import Button from '../common/Button';
import TypingIndicator from '../common/TypingIndicator';
import ProgressBar from '../common/ProgressBar';
import api from '../../utils/api';

const CITIES = [
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Chennai',
  'Kolkata',
  'Hyderabad',
  'Pune',
  'Ahmedabad',
];

const getProblemType = (sit) => {
  switch (sit) {
    case 'eviction': return 'eviction_notice';
    case 'deposit': return 'deposit_withheld';
    case 'rent_hike': return 'rent_hike';
    case 'no_agreement': return 'no_written_agreement';
    case 'gov_housing': return 'gov_housing';
    default: return 'other';
  }
};

const getUrgencyLevel = (urg) => {
  switch (urg) {
    case 'urgent': return 'today';
    case 'soon': return 'few_days';
    default: return 'exploring';
  }
};

const IntakeChat = ({ onComplete, onStepChange }) => {
  const { t } = useTranslation();
  const { saveSituation, isLoggedIn } = useAuth();

  const [currentStep, setCurrentStep] = useState(1); // 1 to 4
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmittingIntake, setIsSubmittingIntake] = useState(false);
  
  // Accumulated Answers
  const [answers, setAnswers] = useState({
    situation: '',
    otherSituation: '',
    location: '',
    otherLocation: '',
    agreement: '',
    urgency: '',
  });

  // Inputs
  const [textInput, setTextInput] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInputType, setTextInputType] = useState(''); // 'situation_other' | 'location_other'
  const [citySearch, setCitySearch] = useState('');
  const [validationError, setValidationError] = useState('');

  const messagesEndRef = useRef(null);

  // Sync step changes up to parent tracker
  useEffect(() => {
    if (onStepChange) onStepChange(currentStep);
  }, [currentStep, onStepChange]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const initializedRef = useRef(false);

  // Initial welcome message and Question 1
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    loadWelcomeAndQ1();
  }, []);

  const loadWelcomeAndQ1 = () => {
    setIsTyping(true);
    setTimeout(() => {
      const welcomeMsg = {
        id: 'welcome',
        sender: 'ai',
        text: t('intake.welcome'),
      };
      setMessages([welcomeMsg]);
      
      setTimeout(() => {
        const q1Msg = {
          id: 'q1',
          sender: 'ai',
          text: t('intake.q1'),
          step: 1,
        };
        setMessages(prev => [...prev, q1Msg]);
        setIsTyping(false);
      }, 600);
    }, 400);
  };

  const handleSelectOption = async (stepNum, optionText, rawValue) => {
    // Add user response bubble
    const userMsg = {
      id: `user-${stepNum}-${Date.now()}`,
      sender: 'user',
      text: optionText,
    };
    setMessages(prev => [...prev, userMsg]);

    // Save answer
    const newAnswers = { ...answers };
    if (stepNum === 1) {
      newAnswers.situation = rawValue;
      if (rawValue !== 'other') {
        newAnswers.otherSituation = '';
      }
    } else if (stepNum === 2) {
      newAnswers.location = rawValue;
      if (rawValue !== 'other') {
        newAnswers.otherLocation = '';
      }
    } else if (stepNum === 3) {
      newAnswers.agreement = rawValue;
    } else if (stepNum === 4) {
      newAnswers.urgency = rawValue;
    }
    setAnswers(newAnswers);

    // Proceed to next step
    if (stepNum < 4) {
      const nextStep = stepNum + 1;
      setCurrentStep(nextStep);
      triggerAiQuestion(nextStep, newAnswers);
    } else {
      // Completed Q4: Submit Intake Flow to Backend or local storage
      await submitIntakeFlow(newAnswers);
    }
  };

  const submitIntakeFlow = async (finalAnswers) => {
    if (!isLoggedIn) {
      // Guest users: skip API entirely, save locally and navigate
      saveSituation(finalAnswers);
      triggerAiSummary();
      return;
    }

    try {
      setIsSubmittingIntake(true);

      const problemType = getProblemType(finalAnswers.situation);
      const urgencyLevel = getUrgencyLevel(finalAnswers.urgency);
      const city = finalAnswers.location === 'other' ? finalAnswers.otherLocation : finalAnswers.location;
      const customProblem = finalAnswers.otherSituation || '';

      const response = await api.post('/api/intake', {
        problemType,
        city,
        hasRentalAgreement: finalAnswers.agreement,
        urgencyLevel,
        customProblem,
      });

      const situationId = response.situationId;

      // Save situation + returned situationId in AuthContext
      saveSituation({ ...finalAnswers, situationId });

      triggerAiSummary();
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: err.message || 'Intake submission failed.', type: 'error' }
      }));
    } finally {
      setIsSubmittingIntake(false);
    }
  };

  const triggerAiQuestion = (stepNum, currentAnswers) => {
    setIsTyping(true);
    setTimeout(() => {
      let qMsg = {};
      if (stepNum === 2) {
        qMsg = {
          id: 'q2',
          sender: 'ai',
          text: t('intake.q2'),
          step: 2,
        };
      } else if (stepNum === 3) {
        qMsg = {
          id: 'q3',
          sender: 'ai',
          text: t('intake.q3'),
          step: 3,
        };
      } else if (stepNum === 4) {
        qMsg = {
          id: 'q4',
          sender: 'ai',
          text: t('intake.q4'),
          step: 4,
        };
      }
      setMessages(prev => [...prev, qMsg]);
      setIsTyping(false);
    }, 800);
  };

  const triggerAiSummary = () => {
    setIsTyping(true);
    setTimeout(() => {
      const summaryMsg = {
        id: 'summary',
        sender: 'ai',
        text: t('intake.summaryMsg'),
      };
      setMessages(prev => [...prev, summaryMsg]);
      setIsTyping(false);

      // Auto-navigate after 1500ms
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 1500);
    }, 800);
  };

  const handleFreeTextSubmit = (e) => {
    e.preventDefault();
    if (!textInput.trim()) {
      if (textInputType === 'situation_other') {
        setValidationError(t('intake.validationSituation') || 'Please describe your situation briefly');
      } else {
        setValidationError(t('intake.validationLocation') || 'Please enter your city or state');
      }
      return;
    }

    setValidationError('');
    const userInput = textInput.trim();
    setTextInput('');
    setShowTextInput(false);

    if (textInputType === 'situation_other') {
      setAnswers(prev => ({ ...prev, otherSituation: userInput }));
      handleSelectOption(1, userInput, 'other');
    } else if (textInputType === 'location_other') {
      setAnswers(prev => ({ ...prev, otherLocation: userInput }));
      handleSelectOption(2, userInput, 'other');
    }
  };

  const handleBack = () => {
    if (currentStep === 1) {
      window.history.back();
      return;
    }

    const prevStep = currentStep - 1;
    setCurrentStep(prevStep);

    const targetId = `q${prevStep}`;
    const targetIndex = messages.findIndex(m => m.id === targetId);

    if (targetIndex !== -1) {
      setMessages(messages.slice(0, targetIndex + 1));
    }
    
    setShowTextInput(false);
    setCitySearch('');
    setValidationError('');
  };

  const filteredCities = CITIES.filter(city =>
    city.toLowerCase().includes(citySearch.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Top Header */}
      <div className="bg-white border-b border-gray-150 py-3.5 px-4 shrink-0 flex items-center relative z-10 shadow-sm">
        <button
          onClick={handleBack}
          className="p-1.5 rounded-xl text-textMuted hover:text-textPrimary hover:bg-gray-100 transition-colors mr-2.5"
          aria-label="Go back"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-xs font-bold text-textMuted uppercase tracking-wider">
            {t('intake.step', { current: currentStep, total: 4 })}
          </h2>
          <ProgressBar
            value={(currentStep / 4) * 100}
            color="bg-primary"
            height="h-1 mt-1.5"
          />
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, index) => {
          const isAi = msg.sender === 'ai';
          return (
            <div
              key={msg.id || index}
              className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div
                className={`max-w-[82%] px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  isAi
                    ? 'bg-white text-textPrimary rounded-2xl rounded-tl-none border border-gray-150'
                    : 'bg-primary text-white rounded-2xl rounded-tr-none font-medium'
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}

        {/* Pulsing AI Typing Bubble */}
        {isTyping && (
          <div className="flex justify-start animate-fade-in">
            <TypingIndicator />
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Active Options / Form Area */}
      <div className="bg-white border-t border-gray-150 px-4 py-4 shrink-0 select-none shadow-lg">
        {!isTyping && !showTextInput && (
          <div className="animate-fade-in">
            {/* Question 1: Situation Chips */}
            {currentStep === 1 && (
              <div className="space-y-2">
                <div className="flex overflow-x-auto gap-2 pb-1.5 -mx-4 px-4 scrollbar-none snap-x">
                  <div className="flex gap-2 shrink-0 md:grid md:grid-cols-3 md:w-full md:pb-0">
                    {[
                      { key: 'eviction', label: t('intake.q1Option1') },
                      { key: 'deposit', label: t('intake.q1Option2') },
                      { key: 'rent_hike', label: t('intake.q1Option3') },
                      { key: 'no_agreement', label: t('intake.q1Option4') },
                      { key: 'gov_housing', label: t('intake.q1Option5') },
                    ].map(opt => (
                      <Chip
                        key={opt.key}
                        label={opt.label}
                        selected={answers.situation === opt.key}
                        onSelect={() => handleSelectOption(1, opt.label, opt.key)}
                        className="snap-center h-10 md:w-full shrink-0"
                      />
                    ))}
                    <Chip
                      label={t('intake.q1Option6')}
                      selected={answers.situation === 'other'}
                      onSelect={() => {
                        setTextInputType('situation_other');
                        setShowTextInput(true);
                      }}
                      className="snap-center h-10 md:w-full shrink-0"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Question 2: Dropdown */}
            {currentStep === 2 && (
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder={t('intake.q2Placeholder')}
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                  className="w-full h-10 border border-gray-250 rounded-xl px-3.5 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />

                <div className="max-h-[140px] overflow-y-auto border border-gray-100 rounded-xl divide-y divide-gray-100">
                  {filteredCities.map(city => (
                    <button
                      key={city}
                      onClick={() => handleSelectOption(2, city, city)}
                      className="w-full text-left py-2.5 px-4 text-xs font-bold text-textPrimary hover:bg-blue-50 transition-colors"
                    >
                      {city}
                    </button>
                  ))}
                  {filteredCities.length === 0 && (
                    <div className="py-2.5 px-4 text-xs font-semibold text-textMuted italic">
                      No matching cities
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setTextInputType('location_other');
                      setShowTextInput(true);
                    }}
                    className="w-full text-left py-2.5 px-4 text-xs font-bold text-accent hover:bg-orange-50 transition-colors"
                  >
                    {t('intake.q2OptionOther')}
                  </button>
                </div>
              </div>
            )}

            {/* Question 3: Pills */}
            {currentStep === 3 && (
              <div className="grid grid-cols-3 gap-2 px-1">
                {[
                  { key: 'yes', label: t('intake.q3Option1') },
                  { key: 'no', label: t('intake.q3Option2') },
                  { key: 'not_sure', label: t('intake.q3Option3') },
                ].map(opt => (
                  <Chip
                    key={opt.key}
                    label={opt.label}
                    selected={answers.agreement === opt.key}
                    onSelect={() => handleSelectOption(3, opt.label, opt.key)}
                    className="h-11"
                  />
                ))}
              </div>
            )}

            {/* Question 4: Urgency cards with loading spinner overlay */}
            {currentStep === 4 && (
              <div className="relative">
                {isSubmittingIntake && (
                  <div className="absolute inset-0 bg-white/70 flex items-center justify-center z-10 rounded-xl">
                    <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-2 px-1">
                  {[
                    { key: 'urgent', label: t('intake.q4Option1'), icon: AlertCircle, color: 'text-danger bg-red-50 border-red-150' },
                    { key: 'soon', label: t('intake.q4Option2'), icon: Clock, color: 'text-accent bg-orange-50 border-orange-150' },
                    { key: 'exploring', label: t('intake.q4Option3'), icon: Search, color: 'text-primary bg-blue-50 border-blue-150' },
                  ].map(opt => {
                    const OptIcon = opt.icon;
                    return (
                      <button
                        key={opt.key}
                        disabled={isSubmittingIntake}
                        onClick={() => handleSelectOption(4, opt.label, opt.key)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all duration-200 active:scale-[0.98] ${
                          answers.urgency === opt.key
                            ? 'border-primary ring-1 ring-primary bg-blue-50/50'
                            : 'border-gray-200 bg-white hover:bg-gray-50'
                        } disabled:opacity-50`}
                      >
                        <OptIcon size={18} className="mb-1 text-current shrink-0" />
                        <span className="text-[10px] font-extrabold text-textPrimary leading-tight">
                          {opt.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Free text input box */}
        {showTextInput && (
          <div>
            <form onSubmit={handleFreeTextSubmit} className="flex gap-2.5 items-center animate-scale-in">
              <input
                type="text"
                required
                value={textInput}
                onChange={(e) => {
                  setTextInput(e.target.value);
                  setValidationError('');
                }}
                placeholder={
                  textInputType === 'situation_other'
                    ? t('intake.q1OtherPlaceholder')
                    : t('intake.q2OtherPlaceholder')
                }
                className="flex-1 h-11 border border-gray-255 rounded-xl px-4 text-xs font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" variant="primary" className="h-11 w-11 !p-0">
                <Send size={16} />
              </Button>
            </form>
            {validationError && (
              <p className="text-[12px] font-semibold text-danger mt-1.5 pl-1 leading-none animate-fade-in">
                {validationError}
              </p>
            )}
          </div>
        )}

        {/* Bottom Pinned Note */}
        <p className="text-[10px] font-semibold text-gray-400 text-center mt-3 leading-none">
          {t('intake.bottomNote')}
        </p>
      </div>
    </div>
  );
};

export default IntakeChat;
