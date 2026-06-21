import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, Smartphone, Mail, Eye, EyeOff } from 'lucide-react';
import {
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { auth } from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/common/Button';
import Toast from '../../components/common/Toast';

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login, savedSituation } = useAuth();

  const [expandedOption, setExpandedOption] = useState(null); // 'phone' | 'email' | null
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastText, setToastText] = useState('');
  const [toastType, setToastType] = useState('success');

  // Input Validation Error States
  const [phoneError, setPhoneError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Phone Auth States
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [otpValues, setOtpValues] = useState(['', '', '', '', '', '']); // Firebase uses 6 digit OTP
  const otpRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  // Email Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Clean recaptcha on unmount
  useEffect(() => {
    return () => {
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const validatePhone = (phone) => {
    const isNum = /^\d+$/.test(phone);
    if (!phone) {
      setPhoneError('Phone number is required');
      return false;
    }
    if (phone.length !== 10 || !isNum) {
      setPhoneError('Please enter a valid 10-digit number');
      return false;
    }
    setPhoneError('');
    return true;
  };

  const validateEmail = (mail) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!mail) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(mail)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (pass) => {
    if (!pass) {
      setPasswordError('Password is required');
      return false;
    }
    if (pass.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handlePostAuthRedirect = (migrated) => {
    if (migrated) {
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: 'Your progress has been saved to your account!', type: 'success' }
      }));
      navigate('/dashboard');
    } else if (savedSituation) {
      navigate('/dashboard');
    } else {
      navigate('/intake');
    }
  };

  // Google Authentication
  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const token = await result.user.getIdToken();
      
      const { migrated } = await login('google', { token });
      handlePostAuthRedirect(migrated);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Google authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Phone OTP Flow
  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!validatePhone(phoneNumber)) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      
      if (!window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'invisible',
        });
      }

      const formatPhone = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formatPhone, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setOtpSent(true);

      setTimeout(() => {
        if (otpRefs[0].current) otpRefs[0].current.focus();
      }, 80);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to send OTP code.');
      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (value && isNaN(value)) return;
    const newOtp = [...otpValues];
    newOtp[index] = value.slice(-1);
    setOtpValues(newOtp);

    if (value && index < 5) {
      otpRefs[index + 1].current.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
      otpRefs[index - 1].current.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const fullOtp = otpValues.join('');
    if (fullOtp.length !== 6) {
      setOtpError('OTP must be exactly 6 digits');
      return;
    }
    setOtpError('');

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const result = await confirmationResult.confirm(fullOtp);
      const token = await result.user.getIdToken();
      
      const { migrated } = await login('phone', { token });
      handlePostAuthRedirect(migrated);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'OTP verification failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Email/Password Login Flow
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    const isEmailValid = validateEmail(email);
    const isPassValid = validatePassword(password);
    if (!isEmailValid || !isPassValid) return;

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      const result = await signInWithEmailAndPassword(auth, email, password);
      const token = await result.user.getIdToken();
      
      const { migrated } = await login('email', { token });
      handlePostAuthRedirect(migrated);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Email authentication failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleOption = (option) => {
    if (expandedOption === option) {
      setExpandedOption(null);
    } else {
      setExpandedOption(option);
      setOtpSent(false);
      setOtpValues(['', '', '', '', '', '']);
      setPhoneNumber('');
      setEmail('');
      setPassword('');
      setErrorMsg('');
      setPhoneError('');
      setEmailError('');
      setPasswordError('');
      setOtpError('');
    }
  };

  return (
    <div className="min-h-screen bg-background px-6 pt-12 pb-8 flex flex-col justify-between max-w-md mx-auto relative select-none">
      {/* Toast */}
      {toastText && (
        <Toast
          message={toastText}
          type={toastType}
          onClose={() => setToastText('')}
        />
      )}

      {/* Recaptcha bound container */}
      <div id="recaptcha-container" />

      {/* Back Button */}
      <button
        onClick={() => navigate('/')}
        className="absolute top-4 left-4 p-2 rounded-xl text-textMuted hover:text-textPrimary hover:bg-gray-100 transition-colors"
        aria-label="Back to home"
      >
        <ChevronLeft size={22} />
      </button>

      <div className="flex-1 flex flex-col justify-center mt-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-textPrimary tracking-tight">
            {t('auth.loginTitle')}
          </h1>
          <p className="text-sm text-textMuted mt-2 font-semibold">
            {t('auth.loginSubtitle')}
          </p>
        </div>

        {/* Global Firebase/Verification Error Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-100 rounded-xl text-xs font-semibold text-danger leading-relaxed">
            {errorMsg}
          </div>
        )}

        {/* Stacked Providers */}
        <div className="space-y-3.5">
          {/* Google */}
          <button
            type="button"
            disabled={isSubmitting}
            onClick={handleGoogleLogin}
            className="w-full h-[52px] border border-gray-200 rounded-xl bg-white flex items-center justify-between px-5 font-bold text-textPrimary hover:bg-gray-50 active:scale-[0.98] transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22-.03-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            <span className="flex-1 text-center text-sm">{t('auth.google')}</span>
            <div className="w-5" />
          </button>

          {/* Phone */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300">
            <button
              type="button"
              onClick={() => toggleOption('phone')}
              className={`w-full h-[52px] flex items-center justify-between px-5 font-bold text-textPrimary hover:bg-gray-50 active:scale-[0.99] transition-all duration-200 ${
                expandedOption === 'phone' ? 'border-b border-gray-100 bg-gray-50/50' : ''
              }`}
            >
              <Smartphone size={20} className="text-textMuted shrink-0" />
              <span className="flex-1 text-center text-sm">{t('auth.phone')}</span>
              <div className="w-5" />
            </button>

            {expandedOption === 'phone' && (
              <div className="p-5 space-y-4 animate-fade-in">
                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="space-y-3.5" noValidate>
                    <div>
                      <label htmlFor="login-phone" className="sr-only">Mobile Number</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-textMuted select-none">
                          +91
                        </span>
                        <input
                          id="login-phone"
                          type="tel"
                          pattern="[0-9]{10}"
                          maxLength="10"
                          required
                          disabled={isSubmitting}
                          value={phoneNumber}
                          onChange={(e) => {
                            setPhoneNumber(e.target.value.replace(/\D/g, ''));
                            setPhoneError('');
                          }}
                          placeholder={t('auth.phonePlaceholder')}
                          className="w-full h-11 border border-gray-200 rounded-xl pl-12 pr-4 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                        />
                      </div>
                      {phoneError && (
                        <p className="text-[12px] font-semibold text-danger mt-1.5 pl-1 leading-none">
                          {phoneError}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={isSubmitting}
                    >
                      {t('auth.sendOtp')}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="text-center select-none">
                      <p className="text-xs text-textMuted font-medium">
                        OTP sent to +91 {phoneNumber.slice(0, 3)}***{phoneNumber.slice(-3)}
                      </p>
                      <button
                        type="button"
                        onClick={() => setOtpSent(false)}
                        className="text-xs text-primary font-bold hover:underline mt-1 focus:outline-none"
                      >
                        Change Number
                      </button>
                    </div>

                    <div>
                      <div className="flex justify-center gap-2">
                        {otpValues.map((val, idx) => (
                          <input
                            key={idx}
                            ref={otpRefs[idx]}
                            type="text"
                            pattern="[0-9]"
                            inputMode="numeric"
                            maxLength="1"
                            required
                            disabled={isSubmitting}
                            value={val}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-10 h-10 border-2 border-gray-200 rounded-lg text-center text-base font-bold text-textPrimary focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                          />
                        ))}
                      </div>
                      {otpError && (
                        <p className="text-[12px] font-semibold text-danger text-center mt-2 leading-none">
                          {otpError}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      variant="primary"
                      fullWidth
                      loading={isSubmitting}
                      disabled={otpValues.some(val => val === '')}
                    >
                      {t('auth.verifyOtp')}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Email */}
          <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm transition-all duration-300">
            <button
              type="button"
              onClick={() => toggleOption('email')}
              className={`w-full h-[52px] flex items-center justify-between px-5 font-bold text-textPrimary hover:bg-gray-50 active:scale-[0.99] transition-all duration-200 ${
                expandedOption === 'email' ? 'border-b border-gray-100 bg-gray-50/50' : ''
              }`}
            >
              <Mail size={20} className="text-textMuted shrink-0" />
              <span className="flex-1 text-center text-sm">{t('auth.email')}</span>
              <div className="w-5" />
            </button>

            {expandedOption === 'email' && (
              <form onSubmit={handleEmailLogin} className="p-5 space-y-4 animate-fade-in" noValidate>
                <div className="space-y-3.5">
                  <div>
                    <label htmlFor="login-email" className="sr-only">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      required
                      disabled={isSubmitting}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setEmailError('');
                      }}
                      placeholder={t('auth.emailPlaceholder')}
                      className="w-full h-11 border border-gray-200 rounded-xl px-4 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                    />
                    {emailError && (
                      <p className="text-[12px] font-semibold text-danger mt-1.5 pl-1 leading-none">
                        {emailError}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="login-password" className="sr-only">Password</label>
                    <div className="relative">
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        disabled={isSubmitting}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          setPasswordError('');
                        }}
                        placeholder={t('auth.passwordPlaceholder')}
                        className="w-full h-11 border border-gray-200 rounded-xl pl-4 pr-11 text-sm font-semibold focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-textMuted hover:text-textPrimary"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {passwordError && (
                      <p className="text-[12px] font-semibold text-danger mt-1.5 pl-1 leading-none">
                        {passwordError}
                      </p>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  loading={isSubmitting}
                >
                  {t('auth.loginBtn')}
                </Button>
              </form>
            )}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-textMuted text-center mt-6 max-w-xs mx-auto">
          {t('auth.privacyNote')}
        </p>
      </div>

      <div className="mt-8 text-center shrink-0 border-t border-gray-100 pt-4">
        <button
          onClick={() => navigate('/auth/signup')}
          className="text-xs font-bold text-primary hover:underline py-1 px-3"
        >
          {t('auth.noAccount')}
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
