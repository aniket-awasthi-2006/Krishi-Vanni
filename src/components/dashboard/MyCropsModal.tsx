import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sprout,
  Calendar,
  Droplet,
  FlaskConical,
  Volume2,
  X,
  Plus,
  CheckCircle,
} from 'lucide-react';
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

const INITIAL_CROPS: CropItem[] = [
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

interface MyCropsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MyCropsModal: React.FC<MyCropsModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();
  const [crops, setCrops] = useState<CropItem[]>(INITIAL_CROPS);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCropName, setNewCropName] = useState('');

  const handleReadCrops = () => {
    const text =
      currentLanguage === 'en'
        ? 'Your active crops: In Wheat, apply 1st crown root irrigation and top-dress 45 kg Urea per acre. In Mustard, monitor for aphids and apply potassium spray.'
        : 'आपकी सक्रिय फसलें: गेहूं में क्राउन रूट अवस्था पर प्रथम सिंचाई करें और 45 किलो यूरिया प्रति एकड़ दें। सरसों में माहू कीट की निगरानी करें और पोटेशियम स्प्रे करें।';
    speak(text);
  };

  const handleAddCrop = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCropName.trim()) return;

    const newCrop: CropItem = {
      id: `c_${Date.now()}`,
      name: newCropName.trim(),
      stage: currentLanguage === 'en' ? 'Vegetative Tillering Stage' : 'Vegetative Growth / वानस्पतिक वृद्धि अवस्था',
      sowingDate: currentLanguage === 'en' ? 'Recently Sown' : 'हाल ही में बोई गई',
      nextTask: currentLanguage === 'en' ? 'Weeding and soil moisture check' : 'निराई-गुड़ाई और नमी परीक्षण',
      fertilizerAdvice: currentLanguage === 'en' ? 'Foliar spray of balanced NPK 19:19:19' : 'संतुलित एनपीके (NPK 19:19:19) का छिड़काव करें',
      daysToHarvest: 100,
    };

    setCrops([newCrop, ...crops]);
    setNewCropName('');
    setShowAddForm(false);
    speak(
      currentLanguage === 'en'
        ? `${newCrop.name} added to your active crops successfully.`
        : `${newCrop.name} को आपकी फसलों में सफलतापूर्वक जोड़ दिया गया है।`
    );
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-3xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-4 shrink-0">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shadow-sm border border-emerald-200 dark:border-emerald-800">
                <Sprout className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{currentLanguage === 'en' ? 'Active Crop Management' : 'सक्रिय फसल प्रबंधन'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.myCropsTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadCrops}
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

          {/* Quick Add Crop Button */}
          <div className="mb-4 shrink-0 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400">
              सक्रिय फसलें ({crops.length})
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(!showAddForm)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white cursor-pointer transition-colors shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>नई फसल जोड़ें</span>
            </button>
          </div>

          {showAddForm && (
            <form onSubmit={handleAddCrop} className="mb-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 shrink-0">
              <label className="block text-xs font-bold text-emerald-900 dark:text-emerald-300 uppercase mb-1">
                फसल का नाम (उदा: चना - उज्जैन 21, सोयाबीन - JS 9560):
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="फसल का नाम और किस्म लिखें..."
                  value={newCropName}
                  onChange={(e) => setNewCropName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-white dark:bg-stone-800 border border-emerald-300 dark:border-emerald-700 text-sm font-semibold text-stone-900 dark:text-stone-100"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  जोड़ें
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-3 py-2 bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-bold rounded-xl cursor-pointer"
                >
                  रद्द करें
                </button>
              </div>
            </form>
          )}

          {/* Crops List */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3.5">
            {crops.map((c) => (
              <div
                key={c.id}
                className="p-4 sm:p-5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 hover:border-emerald-400 dark:hover:border-emerald-600 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-stone-200 dark:border-stone-700/60 gap-2">
                  <div>
                    <h4 className="font-extrabold text-base sm:text-lg text-emerald-900 dark:text-emerald-300">
                      {c.name}
                    </h4>
                    <span className="text-xs font-semibold text-stone-600 dark:text-stone-400 block mt-0.5">
                      अवस्था: {c.stage}
                    </span>
                  </div>
                  <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-xs self-start sm:self-center">
                    कटाई में: ~{c.daysToHarvest} दिन
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2 bg-white dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                    <Droplet className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        सिंचाई व मुख्य कार्य:
                      </span>
                      <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                        {c.nextTask}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2 bg-white dark:bg-stone-800/80 p-3 rounded-xl border border-stone-200 dark:border-stone-700">
                    <FlaskConical className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200 block">
                        उर्वरक व पोषण सलाह:
                      </span>
                      <p className="text-stone-600 dark:text-stone-400 mt-0.5">
                        {c.fertilizerAdvice}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Action */}
          <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 flex justify-end shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-stone-800 dark:text-stone-200 text-sm cursor-pointer transition-colors"
            >
              बंद करें
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
