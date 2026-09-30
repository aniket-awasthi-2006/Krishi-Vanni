import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  CloudSun,
  Droplets,
  Wind,
  CloudRain,
  Volume2,
  CheckCircle2,
  AlertTriangle,
  Clock,
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

export const WeatherCard: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();
  const [data, setData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/farming/weather')
      .then((res) => res.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleReadAloud = () => {
    if (!data) return;
    const text = `आज का मौसम: तापमान ${data.temp} डिग्री सेल्सियस है। ${data.sprayCondition}। ${data.irrigationAdvice}। बारिश की संभावना ${data.rainProb} है।`;
    speak(text);
  };

  if (loading || !data) {
    return (
      <div className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md border border-stone-200 dark:border-stone-800 animate-pulse h-64 flex items-center justify-center">
        <span className="text-stone-400 font-semibold">मौसम जानकारी लोड हो रही है...</span>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-lg border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 transition-colors duration-200"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-700 dark:text-amber-400">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.weatherTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{data.location}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReadAloud}
          className="p-2.5 rounded-xl bg-amber-100 dark:bg-stone-800 hover:bg-amber-200 dark:hover:bg-stone-700 text-amber-900 dark:text-amber-300 transition-colors cursor-pointer"
          title={t('dashboard.readAloud')}
          aria-label="Listen to weather"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Main Temperature & Condition */}
      <div className="flex items-center justify-between py-3 border-b border-stone-200 dark:border-stone-800">
        <div className="flex items-baseline space-x-2">
          <span className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-stone-100 tabular-nums font-mono">
            {data.temp}°
          </span>
          <span className="text-sm font-bold text-stone-500 dark:text-stone-400">C</span>
        </div>
        <div className="text-right">
          <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-1">
            {data.condition}
          </span>
          <div className="flex items-center justify-end space-x-3 text-xs text-stone-600 dark:text-stone-400 font-semibold tabular-nums">
            <span className="flex items-center space-x-1">
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>{data.humidity}% नमी</span>
            </span>
            <span className="flex items-center space-x-1">
              <Wind className="w-3.5 h-3.5 text-stone-500" />
              <span>{data.windSpeed}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Agronomic Spray Advisory Badge */}
      <div className="mt-4 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-100 flex items-start space-x-3">
        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400">
            {t('dashboard.spraySafe')}
          </div>
          <p className="text-xs sm:text-sm font-semibold text-emerald-950 dark:text-emerald-200 mt-0.5">
            {data.sprayCondition}
          </p>
        </div>
      </div>

      {/* Irrigation Recommendation */}
      <div className="mt-2.5 p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-950 dark:text-blue-200 flex items-start space-x-3">
        <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <p className="text-xs font-medium text-blue-900 dark:text-blue-200">
          <strong className="font-bold">सिंचाई सलाह:</strong> {data.irrigationAdvice}
        </p>
      </div>

      {/* 3-day Forecast */}
      <div className="mt-4 pt-3 border-t border-stone-200 dark:border-stone-800 grid grid-cols-3 gap-2 text-center">
        {data.forecast.map((f, i) => (
          <div key={i} className="p-2 rounded-xl bg-stone-50 dark:bg-stone-800/60 border border-stone-100 dark:border-stone-700/60">
            <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">{f.day}</span>
            <span className="text-sm font-black text-stone-800 dark:text-stone-200 block my-0.5 tabular-nums font-mono">
              {f.high}° / {f.low}°
            </span>
            <span className="text-[10px] text-stone-500 dark:text-stone-400 truncate block">{f.desc}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
