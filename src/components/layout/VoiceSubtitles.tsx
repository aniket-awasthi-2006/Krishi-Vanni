import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Volume2, Sparkles } from 'lucide-react';
import { useVoice } from '../../context/VoiceContext.js';

export const VoiceSubtitles: React.FC = () => {
  const { subtitle, interimTranscript, micState } = useVoice();

  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 flex flex-col items-center justify-center px-4 pointer-events-none">
      <AnimatePresence>
        {/* Real-time speech input transcript */}
        {micState === 'listening' && interimTranscript && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="mb-2 max-w-xl w-full bg-amber-900/90 backdrop-blur-md text-amber-50 px-5 py-3 rounded-2xl shadow-xl border border-amber-500/30 flex items-center space-x-3 pointer-events-auto"
          >
            <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <div className="flex-1">
              <span className="text-xs uppercase tracking-wider text-amber-300 font-bold block">
                Hearing You
              </span>
              <p className="text-base font-semibold text-white truncate">"{interimTranscript}"</p>
            </div>
          </motion.div>
        )}

        {/* Spoken TTS Subtitles (accessibility feature - auto dismisses after 3s) */}
        {subtitle && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            className="max-w-2xl w-full bg-stone-900/95 backdrop-blur-md text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-start space-x-3 pointer-events-auto"
          >
            <div className="p-2 bg-emerald-600/30 rounded-xl text-emerald-400 mt-0.5 shrink-0">
              <Volume2 className="w-5 h-5 animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-1.5 mb-0.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  KrishiVaani Voice
                </span>
              </div>
              <p className="text-base font-medium text-stone-100 leading-snug">{subtitle}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
