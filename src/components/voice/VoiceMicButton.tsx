import React from 'react';
import { motion } from 'motion/react';
import { Mic, MicOff, Loader2, Volume2, AlertCircle } from 'lucide-react';
import { useVoice, MicState } from '../../context/VoiceContext.js';
import { useLanguage } from '../../context/LanguageContext.js';

interface VoiceMicButtonProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
  onMicClick?: () => void;
  className?: string;
}

export const VoiceMicButton: React.FC<VoiceMicButtonProps> = ({
  size = 'lg',
  showLabel = true,
  onMicClick,
  className = '',
}) => {
  const { micState, startListening, stopListening, cancelSpeech } = useVoice();
  const { t } = useLanguage();

  const handleClick = () => {
    if (onMicClick) {
      onMicClick();
      return;
    }

    if (micState === 'listening') {
      stopListening();
    } else if (micState === 'speaking') {
      cancelSpeech();
    } else {
      startListening();
    }
  };

  // State configurations: idle, listening, processing, speaking, error
  const stateConfigs: Record<
    MicState,
    {
      bg: string;
      ring: string;
      iconColor: string;
      labelKey: string;
      defaultLabel: string;
      pulse: boolean;
    }
  > = {
    idle: {
      bg: 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white',
      ring: 'border-emerald-500/30',
      iconColor: 'text-white',
      labelKey: 'voiceState.idle',
      defaultLabel: 'Tap to Speak',
      pulse: false,
    },
    listening: {
      bg: 'bg-gradient-to-tr from-amber-500 to-emerald-500 text-white',
      ring: 'border-amber-400',
      iconColor: 'text-white',
      labelKey: 'voiceState.listening',
      defaultLabel: 'Listening...',
      pulse: true,
    },
    processing: {
      bg: 'bg-blue-600 text-white',
      ring: 'border-blue-400',
      iconColor: 'text-white',
      labelKey: 'voiceState.processing',
      defaultLabel: 'Thinking...',
      pulse: true,
    },
    speaking: {
      bg: 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white',
      ring: 'border-violet-400',
      iconColor: 'text-white',
      labelKey: 'voiceState.speaking',
      defaultLabel: 'Speaking...',
      pulse: true,
    },
    error: {
      bg: 'bg-rose-600 hover:bg-rose-700 text-white',
      ring: 'border-rose-400',
      iconColor: 'text-white',
      labelKey: 'voiceState.error',
      defaultLabel: 'Voice Error',
      pulse: false,
    },
  };

  const currentConfig = stateConfigs[micState] || stateConfigs.idle;

  // Size styling
  const sizeMap = {
    sm: { button: 'w-10 h-10', icon: 'w-5 h-5', text: 'text-xs' },
    md: { button: 'w-14 h-14', icon: 'w-7 h-7', text: 'text-sm' },
    lg: { button: 'w-18 h-18 sm:w-20 sm:h-20', icon: 'w-8 h-8 sm:w-9 sm:h-9', text: 'text-base font-bold' },
    xl: { button: 'w-24 h-24 sm:w-28 sm:h-28', icon: 'w-11 h-11 sm:w-13 sm:h-13', text: 'text-lg font-bold' },
  };

  const sz = sizeMap[size];

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Animated Ripple / Pulse when listening or speaking */}
        {currentConfig.pulse && (
          <>
            <motion.div
              className="absolute inset-0 rounded-full bg-emerald-500/30"
              animate={{ scale: [1, 1.45, 1.7], opacity: [0.7, 0.3, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 rounded-full bg-amber-400/30"
              animate={{ scale: [1, 1.25, 1.45], opacity: [0.8, 0.4, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, delay: 0.4, ease: 'easeOut' }}
            />
          </>
        )}

        <motion.button
          type="button"
          onClick={handleClick}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          className={`relative z-10 flex items-center justify-center rounded-full shadow-2xl transition-colors duration-200 cursor-pointer ${sz.button} ${currentConfig.bg} border-4 ${currentConfig.ring}`}
          aria-label={t(currentConfig.labelKey) || currentConfig.defaultLabel}
        >
          {micState === 'listening' && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 1 }}
            >
              <Mic className={`${sz.icon} text-white`} />
            </motion.div>
          )}

          {micState === 'processing' && (
            <Loader2 className={`${sz.icon} text-white animate-spin`} />
          )}

          {micState === 'speaking' && (
            <motion.div
              animate={{ scale: [0.95, 1.15, 0.95] }}
              transition={{ repeat: Infinity, duration: 0.8 }}
            >
              <Volume2 className={`${sz.icon} text-white`} />
            </motion.div>
          )}

          {micState === 'error' && (
            <AlertCircle className={`${sz.icon} text-white`} />
          )}

          {micState === 'idle' && (
            <Mic className={`${sz.icon} ${currentConfig.iconColor}`} />
          )}
        </motion.button>
      </div>

      {showLabel && (
        <span
          className={`mt-2 font-semibold tracking-wide text-stone-800 text-center ${sz.text}`}
        >
          {t(currentConfig.labelKey) || currentConfig.defaultLabel}
        </span>
      )}
    </div>
  );
};
