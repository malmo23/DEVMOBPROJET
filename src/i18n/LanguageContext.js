import React, { createContext, useContext, useState } from 'react';
import translations from './translations';

const LANG_CYCLE = ['en', 'fr', 'ar'];

const LANG_LABELS = { en: '🇬🇧 EN', fr: '🇫🇷 FR', ar: '🇸🇦 AR' };
const NEXT_LANG_LABEL = { en: '🇫🇷 FR', fr: '🇸🇦 AR', ar: '🇬🇧 EN' };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en');

  const isRTL = lang === 'ar';

  const t = (key) => translations[lang][key] || translations['en'][key] || key;

  const toggleLanguage = () => {
    setLang((prev) => {
      const idx = LANG_CYCLE.indexOf(prev);
      return LANG_CYCLE[(idx + 1) % LANG_CYCLE.length];
    });
  };

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLanguage, isRTL, nextLangLabel: NEXT_LANG_LABEL[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
