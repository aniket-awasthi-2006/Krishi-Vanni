import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  FlaskConical,
  Scale,
  Sparkles,
  Volume2,
  X,
  CheckCircle,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface FertilizerCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CropDosage {
  name: string;
  ureaPerAcre: number; // 45kg bags
  dapPerAcre: number; // 50kg bags
  mopPerAcre: number; // 50kg bags
  zincKgPerAcre: number;
  stages: { stage: string; instruction: string }[];
}

const CROP_RECOMMENDATIONS: Record<string, CropDosage> = {
  wheat: {
    name: 'गेहूं (Wheat)',
    ureaPerAcre: 2.5,
    dapPerAcre: 1.0,
    mopPerAcre: 0.5,
    zincKgPerAcre: 5,
    stages: [
      { stage: 'बुवाई के समय (Basal Dose)', instruction: '1 बोरी DAP + आधा बोरी MOP + 5 किग्रा जिंक सल्फेट मिट्टी में मिलाएं' },
      { stage: 'प्रथम सिंचाई (21-25 दिन / CRI)', instruction: '1 बोरी यूरिया (45 किग्रा) सिंचाई के तुरंत बाद भुरकाव करें' },
      { stage: 'कल्ले फूटते समय (40-45 दिन)', instruction: '1 बोरी यूरिया + सूक्ष्म पोषक तत्व का संतुलित छिड़काव करें' },
    ],
  },
  mustard: {
    name: 'सरसों (Mustard)',
    ureaPerAcre: 1.5,
    dapPerAcre: 1.0,
    mopPerAcre: 0.5,
    zincKgPerAcre: 4,
    stages: [
      { stage: 'बुवाई के समय', instruction: '1 बोरी DAP + आधा बोरी MOP + 10 किग्रा बेंटोनाइट सल्फर प्रति एकड़' },
      { stage: 'फूल आने से पूर्व (30-35 दिन)', instruction: 'बची हुई यूरिया सिंचाई के बाद दें और माहू कीट की निगरानी करें' },
    ],
  },
  gram: {
    name: 'चना (Chickpea/Gram)',
    ureaPerAcre: 0.5,
    dapPerAcre: 1.0,
    mopPerAcre: 0.5,
    zincKgPerAcre: 3,
    stages: [
      { stage: 'बुवाई के समय', instruction: '1 बोरी DAP + 0.5 बोरी MOP दें। दलहनी फसल होने से यूरिया बहुत कम चाहिए' },
      { stage: 'शाखाएं निकलते समय', instruction: 'फूल आने से पहले एनपीके 19:19:19 का 1% छिड़काव करें' },
    ],
  },
  soybean: {
    name: 'सोयाबीन (Soybean)',
    ureaPerAcre: 0.8,
    dapPerAcre: 1.5,
    mopPerAcre: 0.8,
    zincKgPerAcre: 5,
    stages: [
      { stage: 'बुवाई के समय', instruction: '1.5 बोरी DAP + 0.8 बोरी MOP + राइजोबियम कल्चर से बीज उपचार' },
      { stage: 'फूल व फली बनते समय', instruction: '00:52:34 का 1% घोल बनाकर फली भराव के समय स्प्रे करें' },
    ],
  },
};

export const FertilizerCalculatorModal: React.FC<FertilizerCalculatorModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();

  const [selectedCrop, setSelectedCrop] = useState<string>('wheat');
  const [acres, setAcres] = useState<number>(2.5);

  const crop = CROP_RECOMMENDATIONS[selectedCrop] || CROP_RECOMMENDATIONS.wheat;

  const totalUreaBags = Math.round(crop.ureaPerAcre * acres * 10) / 10;
  const totalDapBags = Math.round(crop.dapPerAcre * acres * 10) / 10;
  const totalMopBags = Math.round(crop.mopPerAcre * acres * 10) / 10;
  const totalZincKg = Math.round(crop.zincKgPerAcre * acres);

  const handleReadDosage = () => {
    const text =
      currentLanguage === 'en'
        ? `For ${crop.name} across ${acres} acres, total requirement is ${totalUreaBags} bags of Urea, ${totalDapBags} bags of DAP, and ${totalMopBags} bags of MOP. Apply 1 bag Urea per acre after first crown root irrigation.`
        : `${crop.name} के लिए ${acres} एकड़ में कुल ${totalUreaBags} बोरी यूरिया, ${totalDapBags} बोरी डीएपी, और ${totalMopBags} बोरी पोटाश की आवश्यकता होगी। प्रथम सिंचाई पर एक बोरी यूरिया प्रति एकड़ दें।`;
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
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-5 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 dark:bg-teal-950/80 flex items-center justify-center text-teal-700 dark:text-teal-400 shadow-sm border border-teal-200 dark:border-teal-800">
                <FlaskConical className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{t('dashboard.fertilizerBadge')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.fertilizerTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadDosage}
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
            {/* Input Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700">
              <div>
                <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1.5">
                  {t('dashboard.selectCrop')}
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-300 dark:border-stone-600 text-sm font-bold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="wheat">गेहूं (Wheat)</option>
                  <option value="mustard">सरसों (Mustard)</option>
                  <option value="gram">चना (Gram/Chickpea)</option>
                  <option value="soybean">सोयाबीन (Soybean)</option>
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-stone-700 dark:text-stone-300 uppercase">
                    खेत का रकबा ({t('dashboard.acres')}):
                  </label>
                  <span className="font-mono font-black text-sm text-teal-700 dark:text-teal-400">
                    {acres} एकड़
                  </span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="20"
                  step="0.5"
                  value={acres}
                  onChange={(e) => setAcres(parseFloat(e.target.value))}
                  className="w-full accent-teal-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-stone-400 font-mono mt-1">
                  <span>0.5 एकड़</span>
                  <span>10 एकड़</span>
                  <span>20 एकड़</span>
                </div>
              </div>
            </div>

            {/* Calculated Fertilizer Quantity Gauges */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-3">
                {acres} एकड़ के लिए कुल आवश्यक मात्रा ({t('dashboard.bagsRequired')}):
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Urea Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100/60 dark:from-stone-800 dark:to-emerald-950/40 border border-emerald-300 dark:border-emerald-700/80 text-center">
                  <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 block uppercase">यूरिया (N)</span>
                  <div className="text-2xl font-black font-mono text-emerald-950 dark:text-emerald-200 mt-1">
                    {totalUreaBags}
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">बोरी (45 किग्रा)</span>
                </div>

                {/* DAP Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-100/60 dark:from-stone-800 dark:to-amber-950/40 border border-amber-300 dark:border-amber-700/80 text-center">
                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 block uppercase">डीएपी (P)</span>
                  <div className="text-2xl font-black font-mono text-amber-950 dark:text-amber-200 mt-1">
                    {totalDapBags}
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">बोरी (50 किग्रा)</span>
                </div>

                {/* MOP Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-50 to-red-100/60 dark:from-stone-800 dark:to-rose-950/40 border border-rose-300 dark:border-rose-700/80 text-center">
                  <span className="text-[11px] font-bold text-rose-800 dark:text-rose-300 block uppercase">पोटाश (MOP)</span>
                  <div className="text-2xl font-black font-mono text-rose-950 dark:text-rose-200 mt-1">
                    {totalMopBags}
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">बोरी (50 किग्रा)</span>
                </div>

                {/* Zinc Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/60 dark:from-stone-800 dark:to-sky-950/40 border border-sky-300 dark:border-sky-700/80 text-center">
                  <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300 block uppercase">जिंक सल्फेट</span>
                  <div className="text-2xl font-black font-mono text-sky-950 dark:text-sky-200 mt-1">
                    {totalZincKg}
                  </div>
                  <span className="text-[10px] text-stone-500 font-semibold block mt-0.5">किलोग्राम (33%)</span>
                </div>
              </div>
            </div>

            {/* Split Application Timing Schedule */}
            <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-800/50 border border-stone-200 dark:border-stone-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-3 flex items-center space-x-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>वैज्ञानिक छिड़काव समय सारणी (Application Timing):</span>
              </h4>
              <div className="space-y-2.5">
                {crop.stages.map((stg, i) => (
                  <div key={i} className="flex items-start space-x-2.5 text-xs sm:text-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-900 dark:text-stone-100 block">
                        {stg.stage}
                      </span>
                      <p className="text-stone-600 dark:text-stone-400 text-xs mt-0.5">
                        {stg.instruction}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
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
