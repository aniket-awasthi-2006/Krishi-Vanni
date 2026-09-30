import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Landmark, ExternalLink, Volume2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface Scheme {
  id: string;
  title: string;
  description: string;
  eligibility: string;
  actionUrl: string;
  tag: string;
  status: string;
}

export const SchemesCard: React.FC = () => {
  const { t } = useLanguage();
  const { speak } = useVoice();
  const [schemes, setSchemes] = useState<Scheme[]>([]);

  useEffect(() => {
    fetch('/api/farming/schemes')
      .then((res) => res.json())
      .then((d) => setSchemes(d.schemes || []))
      .catch(() => {});
  }, []);

  const handleReadScheme = (scheme: Scheme) => {
    const text = `${scheme.title}: ${scheme.description}। पात्रता: ${scheme.eligibility}।`;
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
          <div className="w-10 h-10 rounded-2xl bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-amber-800 dark:text-amber-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.schemesTitle')}
            </h3>
            <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">कृषि एवं किसान कल्याण मंत्रालय</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            speak('सरकारी किसान योजनाएं: पीएम किसान में ₹6000 सालाना, पीएम फसल बीमा में जोखिम सुरक्षा, और 4% ब्याज पर किसान क्रेडिट कार्ड उपलब्ध है।');
          }}
          className="p-2.5 rounded-xl bg-amber-50 dark:bg-stone-800 hover:bg-amber-100 dark:hover:bg-stone-700 text-amber-800 dark:text-amber-300 transition-colors cursor-pointer"
          title={t('dashboard.readAloud')}
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-3 flex-1 overflow-y-auto max-h-96 pr-1">
        {schemes.map((scheme) => (
          <div
            key={scheme.id}
            className="p-3.5 rounded-2xl bg-stone-50/80 dark:bg-stone-800/50 hover:bg-amber-50/40 dark:hover:bg-stone-800 border border-stone-200 dark:border-stone-700/60 transition-all space-y-1.5"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
                  {scheme.tag}
                </span>
                <h4 className="text-sm font-extrabold text-stone-900 dark:text-stone-100 mt-1">{scheme.title}</h4>
              </div>
              <button
                type="button"
                onClick={() => handleReadScheme(scheme)}
                className="p-1 rounded-lg text-stone-400 hover:text-amber-700 dark:hover:text-amber-400 hover:bg-amber-100 dark:hover:bg-stone-700 cursor-pointer"
                title={t('dashboard.readAloud')}
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 dark:text-stone-400 leading-snug font-medium">
              {scheme.description}
            </p>

            <div className="text-[11px] text-stone-500 dark:text-stone-400 font-medium pt-1 flex items-center justify-between">
              <span>{scheme.status}</span>
              <a
                href={scheme.actionUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-bold inline-flex items-center space-x-1"
              >
                <span>पोर्टल देखें</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
