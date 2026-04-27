import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationRU from './locales/ru.json';
import translationEN from './locales/en.json';
import translationZH from './locales/zh.json';

const resources = {
  ru: { translation: translationRU },
  en: { translation: translationEN },
  zh: { translation: translationZH },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ru', // Default language if detection fails
    supportedLngs: ['ru', 'en', 'zh'],
    debug: false,
    interpolation: {
      escapeValue: false, // React automatically encodes values to prevent XSS
    },
  });

export default i18n;
