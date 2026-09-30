import React from 'react';
import { motion } from 'motion/react';
import { Sprout, Calendar, Droplet, FlaskConical, Volume2, ChevronRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface CropItem {
  id: string;
  name: string;
  stage: string;
  sowingDate: string;
  nextTask: string;
  fertilizerAdvice: string;
  daysToHarvest: number;
}

const ACTIVE_CROPS: CropItem[] = [
  {
    id: 'c1',
    name: 'Wheat (गेहूं - लोक-1 शरबती)',
    stage: 'Crown Root Initiation (CRI) / कल्ले फूटने की अवस्था',
    sowingDate: '25 Nov 2025',
    nextTask: 'प्रथम सिंचाई (21-25 दिन पर) अनिवार्य है',
    fertilizerAdvice: 'प्रथम सिंचाई के बाद 45 किलो यूरिया प्रति एकड़ छिड़कें',
    daysToHarvest: 90,
  },
  {
    id: 'c2',
    name: 'Mustard (सरसों - पूसा बोल्ड)',
    stage: 'Siliqua / फली बनने की अवस्था',
    sowingDate: '15 Oct 2025',
    nextTask: 'माहू (चेपा कीट) के लिए खेत का निरीक्षण करें',
    fertilizerAdvice: 'दाने का वजन व तेल बढ़ाने के लिए 00:52:34 का 1% स्प्रे करें',
    daysToHarvest: 45,
  },
];

export const MyCropsCard: React.FC = () => {
  const { t } = useLanguage();
  const { speak } = useVoice();

  const handleReadCrops = () => {
    const text = 'आपकी सक्रिय फसलें: गेहूं में प्रथम सिंचाई और 45 किलो यूरिया प्रति एकड़ दें। सरसों में माहू कीट की निगरानी करें और 00:52:34 का स्प्रे करें।';
    speak(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-lg border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 flex flex-col h-full transition-colors duration-200"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.myCropsTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">रबी सीजन फसल प्रबंधन</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadCrops}
          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-stone-700 text-emerald-800 dark:text-emerald-400 transition-colors cursor-pointer"
          title={t('dashboard.readAloud')}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3.5 flex-1">
        {ACTIVE_CROPS.map((crop) => (
          <div
            key={crop.id}
            className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700/60 hover:border-emerald-300 dark:hover:border-emerald-600 transition-all space-y-2.5"
          >
            <div className="flex items-center justify-between">
              <span className="font-extrabold text-base text-stone-900 dark:text-stone-100">{crop.name}</span>
              <span className="text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 px-2.5 py-0.5 rounded-full tabular-nums font-mono">
                {crop.daysToHarvest} दिन शेष
              </span>
            </div>

            <div className="text-xs text-stone-600 dark:text-stone-400 font-medium">
              <span className="font-bold text-stone-700 dark:text-stone-300">वर्तमान अवस्था:</span> {crop.stage}
            </div>

            <div className="p-2.5 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 text-xs flex items-start space-x-2">
              <Droplet className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">आगामी कृषि कार्य:</span>
                <span>{crop.nextTask}</span>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 text-xs flex items-start space-x-2">
              <FlaskConical className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">उर्वरक एवं पोषण सलाह:</span>
                <span>{crop.fertilizerAdvice}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
