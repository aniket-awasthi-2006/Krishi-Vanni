import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Volume2,
  Store,
  X,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface MandiRate {
  id: string;
  commodity: string;
  mandi: string;
  variety: string;
  minPrice: number;
  maxPrice: number;
  modalPrice: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: string;
}

interface MandiModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MandiModal: React.FC<MandiModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();
  const [rates, setRates] = useState<MandiRate[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchRates = (q = '') => {
    fetch(`/api/farming/mandi?q=${encodeURIComponent(q)}`)
      .then((res) => res.json())
      .then((d) => {
        setRates(d.rates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    if (isOpen) {
      fetchRates();
    }
  }, [isOpen]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchRates(e.target.value);
  };

  const handleReadRate = (rate: MandiRate) => {
    const text =
      currentLanguage === 'en'
        ? `${rate.commodity} in ${rate.mandi}: Today's modal price is ₹${rate.modalPrice} per quintal. Minimum is ₹${rate.minPrice} and maximum is ₹${rate.maxPrice}.`
        : `${rate.mandi} में ${rate.commodity} का आज का मॉडल भाव ₹${rate.modalPrice} प्रति क्विंटल है। न्यूनतम ₹${rate.minPrice} और अधिकतम ₹${rate.maxPrice} है।`;
    speak(text);
  };

  const handleReadAll = () => {
    if (rates.length === 0) return;
    const top3 =
      currentLanguage === 'en'
        ? rates.slice(0, 3).map((r) => `${r.commodity} at ${r.mandi} ₹${r.modalPrice}`).join('. ')
        : rates.slice(0, 3).map((r) => `${r.commodity} ${r.mandi} में ₹${r.modalPrice}`).join('। ');
    speak(
      currentLanguage === 'en'
        ? `Today's key APMC mandi rates: ${top3} per quintal.`
        : `आज के मुख्य मंडी भाव: ${top3} प्रति क्विंटल।`
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
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800">
                <Store className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{currentLanguage === 'en' ? 'Live APMC Rates' : 'लाइव एपीएमसी भाव'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.mandiRatesTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadAll}
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

          {/* Search Bar Filter */}
          <div className="mb-4 relative shrink-0">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              placeholder="फसल खोजें (उदा: गेहूं, सरसों, चना, कपास)..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-11 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-sm font-semibold text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          {/* Commodity Rates List */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-2.5">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-stone-400">
                <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs font-semibold">मंडी भाव लोड हो रहे हैं...</p>
              </div>
            ) : rates.length === 0 ? (
              <div className="py-8 text-center text-stone-400 font-medium text-sm">
                कोई मंडी भाव नहीं मिला।
              </div>
            ) : (
              rates.map((item) => (
                <div
                  key={item.id}
                  className="p-3.5 rounded-2xl bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 flex items-center justify-between hover:border-amber-400 dark:hover:border-amber-600 transition-colors"
                >
                  <div className="flex-1 min-w-0 pr-3">
                    <div className="flex items-center space-x-2">
                      <span className="font-extrabold text-base text-stone-900 dark:text-stone-100 truncate">
                        {item.commodity}
                      </span>
                      <span className="text-[11px] px-2 py-0.5 rounded-md bg-stone-200 dark:bg-stone-700 text-stone-700 dark:text-stone-300 font-bold truncate">
                        {item.variety}
                      </span>
                    </div>
                    <span className="text-xs text-stone-500 dark:text-stone-400 block mt-0.5">
                      📍 {item.mandi}
                    </span>
                  </div>

                  {/* Price info & Voice Readout */}
                  <div className="flex items-center space-x-3 shrink-0">
                    <div className="text-right">
                      <div className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400">
                        ₹{item.modalPrice}
                        <span className="text-[11px] font-normal text-stone-500 ml-1">
                          /{item.unit}
                        </span>
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">
                        न्यूनतम: ₹{item.minPrice} | अधिकतम: ₹{item.maxPrice}
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      {item.trend === 'up' && (
                        <span className="p-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 flex items-center text-xs font-bold">
                          <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                          {item.change}
                        </span>
                      )}
                      {item.trend === 'down' && (
                        <span className="p-1 rounded-lg bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 flex items-center text-xs font-bold">
                          <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                          {item.change}
                        </span>
                      )}
                      {item.trend === 'stable' && (
                        <span className="p-1 rounded-lg bg-stone-200 dark:bg-stone-700 text-stone-600 dark:text-stone-300 flex items-center text-xs font-bold">
                          <Minus className="w-3.5 h-3.5 mr-0.5" />
                          स्थिर
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => handleReadRate(item)}
                        className="p-1.5 rounded-lg bg-stone-200 dark:bg-stone-700 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-stone-700 dark:text-stone-300 hover:text-emerald-700 cursor-pointer transition-colors"
                        title="भाव सुनें"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
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
