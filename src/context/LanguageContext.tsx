import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  SUPPORTED_LANGUAGES,
  DICTIONARIES,
  LanguageInfo,
  getTranslation,
} from '../locales/index.js';
import { ttsService } from '../lib/voice/tts.js';

interface LanguageContextType {
  currentLanguage: string;
  languageInfo: LanguageInfo;
  supportedLanguages: LanguageInfo[];
  setLanguage: (langCode: string, speakGreeting?: boolean) => void;
  t: (path: string, variables?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'krishivaani_lang';

function getInitialLanguage(): string {
  try {
    // Check cookie first
    const match = document.cookie.match(new RegExp('(^| )krishivaani_lang=([^;]+)'));
    if (match && match[2] && DICTIONARIES[match[2]]) {
      return match[2];
    }
    // Check localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && DICTIONARIES[saved]) {
      return saved;
    }
  } catch (e) {}
  return 'hi'; // Default to Hindi
}

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLangState] = useState<string>(getInitialLanguage);

  const languageInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const setLanguage = (langCode: string, speakGreeting = false) => {
    if (!DICTIONARIES[langCode]) return;
    setCurrentLangState(langCode);

    try {
      localStorage.setItem(STORAGE_KEY, langCode);
      document.cookie = `krishivaani_lang=${langCode}; path=/; max-age=31536000; SameSite=Lax`;
    } catch (e) {}

    if (speakGreeting) {
      const dict = DICTIONARIES[langCode] || DICTIONARIES.hi;
      const greeting = dict.greeting || 'नमस्ते! कृषिवाणी में आपका स्वागत है।';
      ttsService.speak(greeting, langCode);
    }
  };

  const t = (path: string, variables?: Record<string, string>): string => {
    const dict = DICTIONARIES[currentLanguage] || DICTIONARIES.hi;
    let text = getTranslation(dict, path, DICTIONARIES.en);

    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(new RegExp(`{${k}}`, 'g'), v);
      });
    }

    return text;
  };

  useEffect(() => {
    // Sync html lang attribute
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        languageInfo,
        supportedLanguages: SUPPORTED_LANGUAGES,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
