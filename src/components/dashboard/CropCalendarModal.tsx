import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Volume2,
  X,
  Sprout,
  Sun,
  Droplets,
  AlertTriangle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface CropCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface StageStep {
  dayRange: string;
  name: string;
  desc: string;
  waterTask: string;
  nutrientTask: string;
  isCurrent: boolean;
  isCompleted: boolean;
}

const WHEAT_STAGES: StageStep[] = [
  {
    dayRange: '0 - 7 दिन',
    name: 'अंकुरण अवस्था (Germination)',
    desc: 'बीज से अंकुर फूटकर मिट्टी से बाहर आता है। जमीन में पर्याप्त नमी आवश्यक है।',
    waterTask: 'बुवाई पूर्व पलेवा सिंचाई',
    nutrientTask: 'बुवाई के साथ डीएपी व पोटाश (Basal Dose)',
    isCurrent: false,
    isCompleted: true,
  },
  {
    dayRange: '21 - 25 दिन',
    name: 'क्राउन रूट अवस्था (CRI / कल्ले फूटना)',
    desc: 'गेहूं की सबसे महत्वपूर्ण अवस्था। क्राउन जड़ें निकलती हैं जो पौधे का आधार बनती हैं।',
    waterTask: '★ प्रथम सिंचाई अनिवार्य (इस समय पानी न मिलने पर 30% तक उपज घट सकती है)',
    nutrientTask: 'प्रथम सिंचाई के बाद 45 किलो यूरिया प्रति एकड़ भुरकाव',
    isCurrent: true,
    isCompleted: false,
  },
  {
    dayRange: '40 - 45 दिन',
    name: 'कल्ले विकास एवं गांठ बनना (Tillering / Jointing)',
    desc: 'पौधे में अधिक से अधिक कल्ले फूटते हैं जो बाद में बालियां बनते हैं।',
    waterTask: 'दूसरी हल्की सिंचाई आवश्यकतानुसार',
    nutrientTask: 'द्वितीय यूरिया टॉप-ड्रेसिंग + जिंक स्प्रे',
    isCurrent: false,
    isCompleted: false,
  },
  {
    dayRange: '65 - 75 दिन',
    name: 'गभोट एवं बालियां निकलना (Booting / Heading)',
    desc: 'तने के अंदर बाली का निर्माण होता है और हरी बालियां बाहर आती हैं।',
    waterTask: 'तृतीय सिंचाई (फूल आने से ठीक पहले)',
    nutrientTask: 'एनपीके 00:52:34 का 1% पर्णीय छिड़काव',
    isCurrent: false,
    isCompleted: false,
  },
  {
    dayRange: '85 - 100 दिन',
    name: 'दूधिया अवस्था एवं दाना भराव (Milking & Dough)',
    desc: 'दानों में दूध भरता है और दाना सख्त होने लगता है। तेज हवा में सिंचाई न करें।',
    waterTask: 'अंतिम हल्की सिंचाई (दाने का आकार बढ़ाने के लिए)',
    nutrientTask: 'पोटाश (00:00:50) का छिड़काव दाने में चमक के लिए',
    isCurrent: false,
    isCompleted: false,
  },
  {
    dayRange: '115 - 125 दिन',
    name: 'सुनहरी परिपक्वता एवं कटाई (Maturity & Harvest)',
    desc: 'पत्तियां और बालियां सुनहरी पीली हो जाती हैं। दानों में नमी 12-14% होने पर कटाई करें।',
    waterTask: 'सिंचाई पूर्णतः बंद रखें',
    nutrientTask: 'कंबाइन हार्वेस्टर या रीपर से कटाई व भंडारण',
    isCurrent: false,
    isCompleted: false,
  },
];

export const CropCalendarModal: React.FC<CropCalendarModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();

  const handleReadCalendar = () => {
    const text =
      currentLanguage === 'en'
        ? 'Wheat Crop Lifecycle Calendar: Your crop is currently at the Crown Root Initiation (CRI) stage (Days 21-25). Ensure first irrigation now and top-dress 45 kg Urea per acre immediately post irrigation.'
        : 'गेहूं फसल कैलेंडर: आपकी फसल वर्तमान में क्राउन रूट अवस्था (21 से 25 दिन) पर है। प्रथम सिंचाई अनिवार्य रूप से करें और सिंचाई के तुरंत बाद 45 किलो यूरिया प्रति एकड़ भुरकाव करें।';
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
          className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 flex items-center justify-center text-indigo-700 dark:text-indigo-400 shadow-sm border border-indigo-200 dark:border-indigo-800">
                <Calendar className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{t('dashboard.calendarBadge')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.calendarTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadCalendar}
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

          {/* Visual Lifecycle Progress Bar */}
          <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-indigo-50 dark:from-stone-800 dark:via-stone-800 dark:to-indigo-950/40 border border-stone-200 dark:border-stone-700 shrink-0">
            <div className="flex items-center justify-between text-xs font-bold text-stone-700 dark:text-stone-300 mb-2">
              <span>फसल प्रगति: गेहूं (24 दिन / 120 दिन)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-mono">20% पूर्ण (CRI अवस्था)</span>
            </div>
            <div className="w-full bg-stone-200 dark:bg-stone-700 h-3 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full w-[20%] rounded-full transition-all duration-500 shadow-sm" />
            </div>
          </div>

          {/* Timeline Stages */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-4">
            {WHEAT_STAGES.map((stg, idx) => (
              <div
                key={idx}
                className={`p-4 sm:p-5 rounded-2xl border-2 transition-all ${
                  stg.isCurrent
                    ? 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-300/40'
                    : stg.isCompleted
                    ? 'bg-emerald-50/40 dark:bg-stone-800/40 border-emerald-300 dark:border-stone-700 opacity-90'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-xs font-black px-2.5 py-0.5 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200">
                      {stg.dayRange}
                    </span>
                    <h4 className="font-black text-base sm:text-lg text-stone-900 dark:text-stone-100">
                      {stg.name}
                    </h4>
                  </div>
                  {stg.isCurrent && (
                    <span className="self-start sm:self-center px-3 py-1 rounded-full bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider animate-pulse shadow-sm">
                      ★ वर्तमान सक्रिय अवस्था
                    </span>
                  )}
                  {stg.isCompleted && (
                    <span className="self-start sm:self-center px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center space-x-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>पूर्ण</span>
                    </span>
                  )}
                </div>

                <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mb-3 font-medium">
                  {stg.desc}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                  <div className="flex items-start space-x-2 bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <Droplets className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">सिंचाई कार्य:</span>
                      <span className="text-stone-600 dark:text-stone-400">{stg.waterTask}</span>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2 bg-white dark:bg-stone-800 p-2.5 rounded-xl border border-stone-200 dark:border-stone-700">
                    <Sprout className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">खाद एवं पोषण:</span>
                      <span className="text-stone-600 dark:text-stone-400">{stg.nutrientTask}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
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
