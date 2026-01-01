import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import commonEn from './locales/en/common.json';
import taxTermsEn from './locales/en/taxTerms.json';
import commonHi from './locales/hi/common.json';
import taxTermsHi from './locales/hi/taxTerms.json';

const resources = {
  en: {
    common: commonEn,
    taxTerms: taxTermsEn
  },
  hi: {
    common: commonHi,
    taxTerms: taxTermsHi
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false // react already safes from xss
    },
    detection: {
        order: ['localStorage', 'navigator'],
        caches: ['localStorage']
    }
  });

export default i18n;
