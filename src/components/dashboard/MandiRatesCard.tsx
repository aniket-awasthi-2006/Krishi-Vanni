import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Search,
  Volume2,
  Store,
  ArrowUpRight,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import mandiHarvestImg from '../../assets/images/mandi_grain_harvest_1790652905713.jpg';

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

export const MandiRatesCard: React.FC = () => {
  const { t } = useLanguage();
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
    fetchRates();
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    fetchRates(e.target.value);
  };

  const handleReadRate = (rate: MandiRate) => {
    const text = `${rate.mandi} में ${rate.commodity} का आज का मॉडल भाव ₹${rate.modalPrice} प्रति क्विंटल है। न्यूनतम ₹${rate.minPrice} और अधिकतम ₹${rate.maxPrice} है।`;
    speak(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-lg border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 flex flex-col h-full transition-colors duration-200"
    >
      {/* Header with Produce Thumbnail */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <img
            src={mandiHarvestImg}
            alt="Mandi Grain Harvest"
            referrerPolicy="no-referrer"
            className="w-12 h-12 rounded-2xl object-cover border border-amber-300 dark:border-stone-700 shadow-sm shrink-0"
          />
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.mandiTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">AGMARKNET / e-NAM Live Mandi Rates</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            if (rates.length > 0) {
              const top = rates.slice(0, 3).map((r) => `${r.commodity} ₹${r.modalPrice}`).join(', ');
              speak(`आज के मुख्य मंडी भाव: ${top} प्रति क्विंटल।`);
            }
          }}
          className="p-2.5 rounded-xl bg-emerald-50 dark:bg-stone-800 hover:bg-emerald-100 dark:hover:bg-stone-700 text-emerald-800 dark:text-emerald-400 transition-colors cursor-pointer"
          title={t('dashboard.readAloud')}
          aria-label="Listen to all mandi rates"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Search Input */}
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
          <Search className="w-4 h-4" />
        </div>
        <input
          type="text"
          placeholder={t('dashboard.searchMandi')}
          value={search}
          onChange={handleSearchChange}
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/70 border border-stone-200 dark:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-sm font-medium text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
        />
      </div>

      {/* Rates list */}
      <div className="space-y-3 overflow-y-auto max-h-96 pr-1 flex-1">
        {loading ? (
          <div className="py-8 text-center text-stone-400 text-sm">लोड हो रहा है...</div>
        ) : rates.length === 0 ? (
          <div className="py-8 text-center text-stone-400 text-sm">कोई भाव नहीं मिला</div>
        ) : (
          rates.map((rate) => (
            <div
              key={rate.id}
              className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 hover:bg-emerald-50/40 dark:hover:bg-stone-800 border border-stone-200/80 dark:border-stone-700/60 transition-all flex items-center justify-between group"
            >
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-stone-900 dark:text-stone-100">
                    {rate.commodity}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200/70 dark:bg-stone-700 text-stone-700 dark:text-stone-300">
                    {rate.variety}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 font-medium mt-0.5">{rate.mandi}</p>
                <div className="text-[11px] text-stone-400 dark:text-stone-500 mt-1 flex space-x-2 tabular-nums font-mono">
                  <span>न्यूनतम: ₹{rate.minPrice}</span>
                  <span>•</span>
                  <span>अधिकतम: ₹{rate.maxPrice}</span>
                </div>
              </div>

              <div className="text-right flex flex-col items-end">
                <div className="flex items-center space-x-1.5">
                  <span className="font-black text-lg sm:text-xl text-emerald-900 dark:text-emerald-400 font-mono tabular-nums">
                    ₹{rate.modalPrice}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleReadRate(rate)}
                    className="p-1 rounded-lg text-stone-400 hover:text-emerald-700 dark:hover:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-stone-750 transition-colors cursor-pointer"
                    title={t('dashboard.readAloud')}
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex items-center space-x-1 mt-0.5">
                  {rate.trend === 'up' && (
                    <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                      <TrendingUp className="w-3 h-3 mr-0.5" />
                      {rate.change}
                    </span>
                  )}
                  {rate.trend === 'down' && (
                    <span className="text-[11px] font-bold text-rose-600 dark:text-rose-400 flex items-center">
                      <TrendingDown className="w-3 h-3 mr-0.5" />
                      {rate.change}
                    </span>
                  )}
                  {rate.trend === 'stable' && (
                    <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 flex items-center">
                      <Minus className="w-3 h-3 mr-0.5" />
                      {rate.change}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};
