import React, { useState } from 'react';
import { Globe, LogOut, Sprout, User as UserIcon, Volume2, ChevronDown, Check, Sun, Moon } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import { useTheme } from '../../context/ThemeContext.js';

interface HeaderProps {
  onLanguageChangeRequest?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onLanguageChangeRequest }) => {
  const { currentLanguage, languageInfo, supportedLanguages, setLanguage, t } = useLanguage();
  const { user, logout } = useAuth();
  const { speak, cancelSpeech } = useVoice();
  const { theme, toggleTheme } = useTheme();
  const [showLangMenu, setShowLangMenu] = useState(false);

  const handleSelectLang = (code: string) => {
    setLanguage(code, true);
    setShowLangMenu(false);
  };

  const playGreetingAudio = () => {
    speak(t('greeting'));
  };

  return (
    <header className="sticky top-0 z-30 bg-emerald-800 dark:bg-stone-900/95 text-white shadow-lg border-b border-emerald-700/60 dark:border-stone-800 backdrop-blur-md transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3 cursor-pointer select-none">
          <div className="w-11 h-11 rounded-2xl bg-white p-1 flex items-center justify-center shadow-md border-2 border-emerald-300 dark:border-emerald-500 overflow-hidden">
            <img src="/logo.png" alt="KrishiVaani Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white font-serif">
                {t('appName')}
              </h1>
              <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded-full">
                {t('dashboard.portalBadge')}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-emerald-200 dark:text-stone-400 font-medium hidden sm:block">
              {t('appTagline')}
            </p>
          </div>
        </div>

        {/* Right action controls */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          {/* Theme Toggle Button (Dark / Light) */}
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2.5 rounded-xl bg-emerald-700/70 dark:bg-stone-800 hover:bg-emerald-600 dark:hover:bg-stone-700 active:scale-95 text-amber-300 dark:text-amber-400 transition-all border border-emerald-600 dark:border-stone-700 cursor-pointer shadow-sm"
            aria-label="Toggle theme mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5 text-amber-400 animate-spin-slow" />
            ) : (
              <Moon className="w-5 h-5 text-amber-200" />
            )}
          </button>

          {/* Audio greeting readout trigger */}
          <button
            type="button"
            onClick={playGreetingAudio}
            title={t('readAloud') || 'Listen'}
            className="p-2.5 rounded-xl bg-emerald-700/70 dark:bg-stone-800 hover:bg-emerald-600 dark:hover:bg-stone-700 active:scale-95 text-amber-300 transition-all border border-emerald-600 dark:border-stone-700 cursor-pointer shadow-sm"
            aria-label="Listen to greeting"
          >
            <Volume2 className="w-5 h-5" />
          </button>

          {/* Persistent Language Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-900/80 dark:bg-stone-800 hover:bg-emerald-900 dark:hover:bg-stone-700 border border-emerald-600/80 dark:border-stone-700 text-amber-200 dark:text-stone-200 font-semibold text-sm transition-all cursor-pointer shadow-inner"
            >
              <Globe className="w-4 h-4 text-amber-300" />
              <span className="text-white font-bold">{languageInfo.nativeName}</span>
              <ChevronDown className="w-4 h-4 text-emerald-300 dark:text-stone-400" />
            </button>

            {showLangMenu && (
              <>
                <div
                  className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs"
                  onClick={() => setShowLangMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-64 max-h-96 overflow-y-auto bg-stone-900 dark:bg-stone-900 text-stone-100 rounded-2xl shadow-2xl border border-stone-700 p-2 z-50">
                  <div className="px-3 py-2 text-xs font-bold text-stone-400 uppercase tracking-wider border-b border-stone-800">
                    {t('selectLanguage')} ({supportedLanguages.length} Languages)
                  </div>
                  <div className="py-1">
                    {supportedLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => handleSelectLang(lang.code)}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                          currentLanguage === lang.code
                            ? 'bg-emerald-600 text-white font-bold'
                            : 'hover:bg-stone-800 text-stone-200'
                        }`}
                      >
                        <div>
                          <div className="text-base font-semibold">{lang.nativeName}</div>
                          <div className="text-xs text-stone-400">{lang.name}</div>
                        </div>
                        {currentLanguage === lang.code && <Check className="w-4 h-4 text-amber-300" />}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User profile & Logout when logged in */}
          {user ? (
            <div className="flex items-center space-x-2 pl-2 border-l border-emerald-700 dark:border-stone-800">
              <div className="hidden md:flex flex-col text-right">
                <span className="text-sm font-bold text-white truncate max-w-[120px]">
                  {user.name}
                </span>
                <span className="text-[11px] text-emerald-200 dark:text-stone-400 font-mono">
                  +91 {user.mobile}
                </span>
              </div>
              <button
                type="button"
                onClick={() => logout()}
                className="flex items-center space-x-1 px-3 py-2 rounded-xl bg-rose-600/80 hover:bg-rose-600 text-white font-semibold text-sm transition-all cursor-pointer shadow-sm active:scale-95"
                title={t('logout')}
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
};
