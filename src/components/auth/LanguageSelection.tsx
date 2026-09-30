import React from 'react';
import { motion } from 'motion/react';
import { Volume2, Sparkles, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { VoiceMicButton } from '../voice/VoiceMicButton.js';

interface LanguageSelectionProps {
  onLanguageChosen: () => void;
}

export const LanguageSelection: React.FC<LanguageSelectionProps> = ({ onLanguageChosen }) => {
  const { currentLanguage, supportedLanguages, setLanguage, t } = useLanguage();

  const handleSelectLanguage = (langCode: string) => {
    // Select language, speak greeting in that language, and transition
    setLanguage(langCode, true);
    setTimeout(() => {
      onLanguageChosen();
    }, 400);
  };

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 max-w-5xl mx-auto">
      {/* Top Banner */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8 max-w-2xl"
      >
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-bold mb-4 shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          <span>भारत का अपना डिजिटल किसान सहायक</span>
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-stone-900 dark:text-stone-100 tracking-tight font-serif mb-3">
          {t('selectLanguage')}
        </h2>
        <p className="text-base sm:text-lg text-stone-600 dark:text-stone-400 font-medium">
          {t('selectLanguageSub')}
        </p>
      </motion.div>

      {/* 12 Language Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4 w-full mb-10">
        {supportedLanguages.map((lang, idx) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.03 }}
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.96 }}
              type="button"
              onClick={() => handleSelectLanguage(lang.code)}
              className={`group relative p-4 sm:p-5 rounded-2xl text-left border-2 transition-all cursor-pointer shadow-md flex flex-col justify-between h-32 sm:h-36 ${
                isSelected
                  ? 'bg-emerald-800 dark:bg-emerald-700 text-white border-emerald-500 ring-4 ring-emerald-500/20'
                  : 'bg-white dark:bg-stone-900 hover:bg-emerald-50/60 dark:hover:bg-stone-800 text-stone-900 dark:text-stone-100 border-stone-200 dark:border-stone-800 hover:border-emerald-300 dark:hover:border-emerald-600'
              }`}
            >
              <div className="flex items-start justify-between w-full">
                <span
                  className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
                    isSelected ? 'text-amber-300' : 'text-emerald-950 dark:text-emerald-300 group-hover:text-emerald-700 dark:group-hover:text-emerald-400'
                  }`}
                >
                  {lang.nativeName}
                </span>
                {isSelected ? (
                  <CheckCircle2 className="w-6 h-6 text-amber-300" />
                ) : (
                  <span className="w-8 h-8 rounded-full bg-stone-100 dark:bg-stone-800 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-950 flex items-center justify-center text-stone-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                    <Volume2 className="w-4 h-4" />
                  </span>
                )}
              </div>

              <div>
                <p
                  className={`text-xs sm:text-sm font-semibold ${
                    isSelected ? 'text-emerald-200' : 'text-stone-500 dark:text-stone-400'
                  }`}
                >
                  {lang.name}
                </p>
                <p
                  className={`text-[11px] truncate mt-0.5 ${
                    isSelected ? 'text-amber-100/90' : 'text-stone-400 dark:text-stone-500'
                  }`}
                >
                  "{lang.greetingSample}"
                </p>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Voice prompt button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col items-center justify-center bg-white dark:bg-stone-900 border border-stone-200/80 dark:border-stone-800 p-5 rounded-3xl shadow-lg max-w-md w-full text-center"
      >
        <p className="text-sm font-bold text-stone-700 dark:text-stone-300 mb-3 flex items-center justify-center space-x-1.5">
          <span>{t('voiceHint')}</span>
        </p>
        <VoiceMicButton size="md" showLabel={true} />
      </motion.div>
    </div>
  );
};
