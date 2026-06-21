import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './en.json';
import translationHI from './hi.json';

const resources = {
  en: {
    translation: translationEN,
  },
  hi: {
    translation: translationHI,
  },
};

const savedLanguage = localStorage.getItem('clearpath_language') || 'en';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already protects from XSS
    },
  });

export default i18n;
