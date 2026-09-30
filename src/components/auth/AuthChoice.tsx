import React, { useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { LogIn, UserPlus, Sparkles, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import { interpretVoiceDecision } from '../../lib/voice/voiceDecision.js';
import { VoiceMicButton } from '../voice/VoiceMicButton.js';

interface AuthChoiceProps {
  onSelectLogin: () => void;
  onSelectRegister: () => void;
  onChangeLanguage: () => void;
}

export const AuthChoice: React.FC<AuthChoiceProps> = ({
  onSelectLogin,
  onSelectRegister,
  onChangeLanguage,
}) => {
  const { t } = useLanguage();
  const { speak, startListening, onTranscriptReceived } = useVoice();
  const hasSpokenRef = useRef(false);

  useEffect(() => {
    if (!hasSpokenRef.current) {
      hasSpokenRef.current = true;
      const promptText = `${t('authChoiceTitle')}. ${t('authChoiceSubtitle')}. ${t('voiceOptionHint')}.`;
      speak(promptText).then(() => {
        // Auto-start listening after speaking
        startListening();
      });
    }

    if (onTranscriptReceived) {
      const unsubscribe = onTranscriptReceived((transcript) => {
        const decision = interpretVoiceDecision(transcript);
        if (decision.intent === 'login') {
          onSelectLogin();
        } else if (decision.intent === 'register') {
          onSelectRegister();
        }
      });
      return unsubscribe;
    }
  }, [speak, startListening, onTranscriptReceived, t, onSelectLogin, onSelectRegister]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 max-w-xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-white p-2 shadow-lg border-2 border-emerald-300 dark:border-emerald-700 overflow-hidden flex items-center justify-center">
          <img src="/logo.png" alt="KrishiVaani Logo" className="w-full h-full object-contain" />
        </div>
        <div className="inline-flex items-center space-x-2 px-4 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs sm:text-sm font-bold mb-3 shadow-sm">
          <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>{t('appName')} किसान पोर्टल</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-serif mb-2">
          {t('authChoiceTitle')}
        </h2>
        <p className="text-stone-600 dark:text-stone-400 font-medium text-base sm:text-lg">
          {t('authChoiceSubtitle')}
        </p>
      </motion.div>

      {/* Voice microphone prompt */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mb-8 p-6 bg-amber-100/70 dark:bg-stone-900 border-2 border-amber-300/80 dark:border-stone-800 rounded-3xl w-full flex flex-col items-center justify-center text-center shadow-md"
      >
        <span className="text-xs sm:text-sm font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-3">
          {t('voiceOptionHint')}
        </span>
        <VoiceMicButton size="lg" showLabel={true} />
      </motion.div>

      {/* Choice Buttons */}
      <div className="w-full space-y-4">
        {/* Login Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectLogin}
          className="w-full p-5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 dark:bg-emerald-600 dark:hover:bg-emerald-700 text-white font-extrabold text-lg sm:text-xl shadow-lg border-2 border-emerald-600 dark:border-emerald-500 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <LogIn className="w-7 h-7 text-amber-300" />
            </div>
            <div className="text-left">
              <div>{t('loginButton')}</div>
              <div className="text-xs text-emerald-200 dark:text-emerald-100 font-normal">
                {t('login.subtitle')}
              </div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-amber-300" />
        </motion.button>

        {/* Register Button */}
        <motion.button
          type="button"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onSelectRegister}
          className="w-full p-5 rounded-2xl bg-white hover:bg-emerald-50 active:bg-emerald-100 dark:bg-stone-900 dark:hover:bg-stone-800 text-emerald-900 dark:text-stone-100 font-extrabold text-lg sm:text-xl shadow-md border-2 border-emerald-500/70 dark:border-stone-700 flex items-center justify-between cursor-pointer transition-all"
        >
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-stone-800 flex items-center justify-center">
              <UserPlus className="w-7 h-7 text-emerald-700 dark:text-emerald-400" />
            </div>
            <div className="text-left">
              <div>{t('registerButton')}</div>
              <div className="text-xs text-stone-500 dark:text-stone-400 font-normal">
                {t('register.subtitle')}
              </div>
            </div>
          </div>
          <ArrowRight className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />
        </motion.button>
      </div>

      <div className="mt-8">
        <button
          type="button"
          onClick={onChangeLanguage}
          className="text-stone-600 dark:text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 font-bold text-sm underline cursor-pointer"
        >
          {t('changeLanguage')}
        </button>
      </div>
    </div>
  );
};
