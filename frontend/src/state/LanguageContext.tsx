import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageCode } from '../types/assistant';
import { en } from '../translations/en';
import { hi } from '../translations/hi';
import { or } from '../translations/or';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: typeof en;
}

const translations: Record<LanguageCode, typeof en> = {
  en,
  hi,
  or,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('bis_lang') as LanguageCode;
        if (saved && ['en', 'hi', 'or'].includes(saved)) {
          return saved;
        }
      } catch {
        // storage disabled or blocked
      }
    }
    return 'en';
  });

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('bis_lang', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: translations[language] || en,
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
