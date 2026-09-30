import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Compass,
  Thermometer,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface WeatherData {
  location: string;
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: string;
  rainProb: string;
  sprayCondition: string;
  irrigationAdvice: string;
  forecast: Array<{ day: string; high: number; low: number; desc: string }>;
}

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WeatherModal: React.FC<WeatherModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/farming/weather')
        .then((res) => res.json())
        .then((d) => {
          setData(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [isOpen]);

  const handleReadAloud = () => {
    if (!data) return;
    const text =
      currentLanguage === 'en'
        ? `Today's weather: Temperature is ${data.temp}°C. ${data.condition}. ${data.sprayCondition}. ${data.irrigationAdvice}. Rain probability is ${data.rainProb}, and wind speed is ${data.windSpeed}.`
        : `आज का मौसम: तापमान ${data.temp} डिग्री सेल्सियस है। ${data.sprayCondition}। ${data.irrigationAdvice}। बारिश की संभावना ${data.rainProb} है। हवा की गति ${data.windSpeed} है।`;
    speak(text);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-2xl bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-2xl border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 my-8"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-700 dark:text-sky-400 shadow-sm border border-sky-200 dark:border-sky-800">
                <CloudSun className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{currentLanguage === 'en' ? 'Weather & Spray Advisory' : 'मौसम व छिड़काव सुरक्षा'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.weatherTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleReadAloud}
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

          {loading || !data ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-400">
              <div className="w-10 h-10 border-4 border-sky-600 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="font-semibold text-sm">मौसम जानकारी लोड हो रही है...</p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Primary Current Weather Display */}
              <div className="flex flex-col sm:flex-row items-center justify-between p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-blue-100/60 dark:from-stone-800/80 dark:to-sky-950/40 border border-sky-200 dark:border-stone-700">
                <div className="flex items-center space-x-4 mb-3 sm:mb-0">
                  <div className="text-5xl font-black font-mono text-sky-950 dark:text-sky-300">
                    {data.temp}°C
                  </div>
                  <div>
                    <span className="font-bold text-lg text-stone-800 dark:text-stone-200 block">
                      {data.condition}
                    </span>
                    <span className="text-xs text-stone-600 dark:text-stone-400">
                      स्थान: {data.location}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs font-semibold text-stone-700 dark:text-stone-300">
                  <div className="flex items-center space-x-1.5">
                    <Droplets className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                    <span>नमी: {data.humidity}%</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>हवा: {data.windSpeed}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <CloudRain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <span>बारिश: {data.rainProb}</span>
                  </div>
                </div>
              </div>

              {/* Agricultural Spray Condition Window Banner */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 text-stone-800 dark:text-stone-200">
                <div className="flex items-start space-x-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-black text-emerald-900 dark:text-emerald-300 text-sm sm:text-base block">
                      छिड़काव अनुकूलता (Spray Window Safety):
                    </span>
                    <p className="text-xs sm:text-sm font-semibold mt-0.5 text-stone-700 dark:text-stone-300">
                      {data.sprayCondition}
                    </p>
                    <p className="text-xs text-emerald-800 dark:text-emerald-400 mt-1 font-medium">
                      💡 {data.irrigationAdvice}
                    </p>
                  </div>
                </div>
              </div>

              {/* 5-Day Agricultural Forecast Grid */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-600 dark:text-stone-400 mb-2">
                  आगामी 5 दिनों का पूर्वानुमान (5-Day Agro Forecast):
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {data.forecast?.map((f, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 text-center"
                    >
                      <span className="text-xs font-bold text-stone-600 dark:text-stone-400 block mb-1">
                        {f.day}
                      </span>
                      <CloudSun className="w-6 h-6 text-amber-500 mx-auto mb-1" />
                      <div className="text-sm font-black text-stone-900 dark:text-stone-100 font-mono">
                        {f.high}° / {f.low}°
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-stone-400 block truncate mt-0.5">
                        {f.desc}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Bottom Action */}
          <div className="mt-6 pt-4 border-t border-stone-200 dark:border-stone-800 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 font-bold text-stone-800 dark:text-stone-200 text-sm cursor-pointer transition-colors"
            >
              बंद करें
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
