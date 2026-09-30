import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Droplets,
  Waves,
  Gauge,
  Clock,
  Volume2,
  X,
  CheckCircle,
  AlertCircle,
  Compass,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface IrrigationAdvisoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const IrrigationAdvisoryModal: React.FC<IrrigationAdvisoryModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();

  const handleReadAdvisory = () => {
    const text =
      currentLanguage === 'en'
        ? 'Smart Irrigation Advisory: Your root-zone 0 to 30 cm soil moisture is at an optimal 68%. For wheat CRI stage, apply light irrigation tomorrow between 6 AM and 10 AM. Canal water rotation is available in 2 days.'
        : 'स्मार्ट सिंचाई सलाह: आपके खेत की ऊपरी 30 सेंटीमीटर मिट्टी में 68% इष्टतम नमी है। गेहूं की क्राउन रूट अवस्था के लिए कल सुबह 6 से 10 बजे के बीच हल्की सिंचाई करें। नहर का पानी 2 दिन बाद उपलब्ध होगा।';
    speak(text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/75 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-700 dark:text-sky-400 shadow-sm border border-sky-200 dark:border-sky-800">
                <Droplets className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{t('dashboard.irrigationBadge')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.irrigationTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadAdvisory}
                className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 hover:bg-emerald-200 dark:hover:bg-emerald-900 text-emerald-800 dark:text-emerald-300 cursor-pointer transition-colors shadow-sm"
                title={t('readAloud') || 'Listen'}
              >
                <Volume2 className="w-5 h-5" />
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2.5 rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto flex-1 pr-1 space-y-5">
            {/* Visual Moisture Gauges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/60 dark:from-stone-800 dark:to-sky-950/40 border border-sky-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase">
                    जड़ क्षेत्र नमी (0-30 cm)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500 text-white text-[10px] font-bold">
                    इष्टतम
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-sky-950 dark:text-sky-200">
                  68%
                </div>
                <div className="w-full bg-sky-200 dark:bg-sky-950 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-sky-600 h-full w-[68%] rounded-full" />
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 block">
                  अगली 24 घंटे में सिंचाई की सिफारिश
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-stone-800 dark:to-emerald-950/40 border border-emerald-200 dark:border-stone-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase">
                    गहरी उपमृदा नमी (30-60 cm)
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-teal-500 text-white text-[10px] font-bold">
                    संतोषजनक
                  </span>
                </div>
                <div className="text-3xl font-black font-mono text-emerald-950 dark:text-emerald-200">
                  74%
                </div>
                <div className="w-full bg-emerald-200 dark:bg-emerald-950 h-2.5 rounded-full mt-2 overflow-hidden">
                  <div className="bg-emerald-600 h-full w-[74%] rounded-full" />
                </div>
                <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1.5 block">
                  जड़ों के विकास के लिए पर्याप्त जल भंडारण
                </span>
              </div>
            </div>

            {/* Smart Canal & Tube-well Roster */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 flex items-center space-x-1.5">
                <Waves className="w-4 h-4 text-sky-600" />
                <span>नहर व नलकूप जल रोस्टर (Water Availability Schedule):</span>
              </h4>

              <div className="space-y-2 text-xs sm:text-sm">
                <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        सीहोर मुख्य नहर माइनर 4
                      </span>
                      <span className="text-xs text-stone-500">रोस्टर चक्र: गुरुवार प्रातः 6:00 से शनिवार शाम 6:00</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold text-xs">
                    2 दिन शेष
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        कृषि बिजली आपूर्ति (3-फेज)
                      </span>
                      <span className="text-xs text-stone-500">आज का समय: रात्रि 10:00 बजे से प्रातः 6:00 बजे तक</span>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs">
                    उपलब्ध
                  </span>
                </div>
              </div>
            </div>

            {/* Drip Fertigation Efficiency Tip */}
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 text-xs sm:text-sm text-teal-950 dark:text-teal-200">
              <span className="font-bold block mb-1">💡 जल बचत एवं ड्रिप फर्टिगेशन तकनीक:</span>
              <p className="text-stone-600 dark:text-stone-300 text-xs leading-relaxed">
                दोपहर की तेज धूप में फव्वारा या खुला पानी देने से 25% जल वाष्प बनकर उड़ जाता है। सुबह या शाम को सिंचाई करने से पानी की 40% तक बचत होती है और फसल को समान नमी मिलती है।
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-stone-800 dark:text-stone-200 text-sm cursor-pointer transition-colors"
            >
              {t('dashboard.close')}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
