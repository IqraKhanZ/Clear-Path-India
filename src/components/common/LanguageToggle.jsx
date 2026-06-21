import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const LanguageToggle = ({ className = '' }) => {
  const { i18n } = useTranslation();
  const { isLoggedIn } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const currentLanguage = i18n.language || 'en';

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी' },
  ];

  const handleLanguageChange = async (langCode) => {
    try {
      i18n.changeLanguage(langCode);
      localStorage.setItem('clearpath_language', langCode);
      
      // Persist language on server if user is logged in
      if (isLoggedIn) {
        await api.patch('/api/auth/language', { language: langCode });
      }
    } catch (err) {
      console.error('Failed to sync language selection to server:', err);
    } finally {
      setIsOpen(false);
    }
  };

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-bold text-textPrimary bg-white border border-gray-200 rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary shadow-sm transition-all duration-200"
        id="language-menu-button"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Globe size={16} className="text-primary" />
        <span className="uppercase">{currentLanguage}</span>
        <ChevronDown size={14} className={`text-textMuted transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-32 origin-top-right rounded-xl bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden border border-gray-100 animate-fade-in"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="language-menu-button"
        >
          <div className="py-1" role="none">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors duration-150 ${
                  currentLanguage === lang.code
                    ? 'bg-blue-50 text-primary font-bold'
                    : 'text-textPrimary hover:bg-gray-50'
                }`}
                role="menuitem"
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageToggle;
