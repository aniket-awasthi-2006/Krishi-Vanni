import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Landmark,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
  Volume2,
  X,
  Sparkles,
  FileText,
  BadgeIndianRupee,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';

interface SchemesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface SchemeItem {
  id: string;
  name: string;
  benefit: string;
  eligibility: string;
  documents: string[];
  status: 'eligible' | 'applied' | 'active';
  link: string;
}

const SCHEMES_DATA: SchemeItem[] = [
  {
    id: 'pmkisan',
    name: 'प्रधानमंत्री किसान सम्मान निधि (PM-KISAN)',
    benefit: '₹6,000 प्रति वर्ष (₹2,000 की 3 समान किश्तों में सीधे बैंक खाते में)',
    eligibility: 'सभी भूमिधारक किसान परिवार जिनके नाम कृषि भूमि की खतौनी/जमाबंदी है।',
    documents: ['आधार कार्ड', 'बैंक खाता (आधार लिंक)', 'जमीन के कागजात (खतौनी)'],
    status: 'active',
    link: 'https://pmkisan.gov.in',
  },
  {
    id: 'pmfby',
    name: 'प्रधानमंत्री फसल बीमा योजना (PMFBY)',
    benefit: 'सूखा, बाढ़, ओलावृष्टि व कीट प्रकोप से फसल नुकसान पर 100% तक क्षतिपूर्ति',
    eligibility: 'रबी एवं खरीफ की अधिसूचित फसलें उगाने वाले सभी ऋणी व गैर-ऋणी किसान।',
    documents: ['फसल बुवाई प्रमाण पत्र / पटवारी गिरदावरी', 'आधार कार्ड', 'बैंक पासबुक'],
    status: 'eligible',
    link: 'https://pmfby.gov.in',
  },
  {
    id: 'pmksy',
    name: 'प्रधानमंत्री कृषि सिंचाई योजना (सूक्ष्म सिंचाई - ड्रिप/स्प्रिंकलर)',
    benefit: 'ड्रिप व फव्वारा सिंचाई उपकरण लगाने पर 55% तक सरकारी अनुदान (सब्सिडी)',
    eligibility: 'स्वयं का जल स्रोत (कुआं/नलकूप/तालाब) रखने वाले सभी लघु व सीमांत किसान।',
    documents: ['भू-अभिलेख खसरा नकल', 'बिजली बिल / सिंचाई स्रोत प्रमाण', 'आधार कार्ड'],
    status: 'eligible',
    link: 'https://pmksy.gov.in',
  },
  {
    id: 'kusum',
    name: 'पीएम कुसुम सोलर पंप योजना (PM-KUSUM)',
    benefit: 'खेत में 3 HP से 7.5 HP सोलर पंप स्थापित करने पर 60% से 90% तक भारी सब्सिडी',
    eligibility: 'सिंचाई हेतु डीजल पंप का उपयोग करने वाले अथवा बिना बिजली कनेक्शन वाले किसान।',
    documents: ['खसरा-खतौनी', 'पहचान पत्र', 'बैंक विवरण'],
    status: 'eligible',
    link: 'https://pmkusum.mnre.gov.in',
  },
];

export const SchemesModal: React.FC<SchemesModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();
  const [selectedScheme, setSelectedScheme] = useState<SchemeItem>(SCHEMES_DATA[0]);

  const handleReadScheme = (scheme: SchemeItem) => {
    const text =
      currentLanguage === 'en'
        ? `${scheme.name}: Offers ${scheme.benefit}. Eligibility: ${scheme.eligibility}. Required documents: ${scheme.documents.join(', ')}.`
        : `${scheme.name}: इसके तहत ${scheme.benefit} मिलता है। पात्रता: ${scheme.eligibility}। आवश्यक दस्तावेज: ${scheme.documents.join(', ')}।`;
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
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/80 flex items-center justify-center text-amber-700 dark:text-amber-400 shadow-sm border border-amber-200 dark:border-amber-800">
                <Landmark className="w-7 h-7" />
              </div>
              <div>
                <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold uppercase tracking-wider">
                  <span>{t('dashboard.schemesBadge')}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
                  {t('dashboard.schemesTitle')}
                </h3>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleReadScheme(selectedScheme)}
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

          {/* Scheme Cards */}
          <div className="overflow-y-auto flex-1 pr-1 space-y-3.5">
            {SCHEMES_DATA.map((scheme) => (
              <div
                key={scheme.id}
                onClick={() => setSelectedScheme(scheme)}
                className={`p-4 sm:p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  selectedScheme.id === scheme.id
                    ? 'bg-amber-50/50 dark:bg-stone-800/80 border-amber-400 dark:border-amber-600 shadow-md'
                    : 'bg-stone-50 dark:bg-stone-800/40 border-stone-200 dark:border-stone-700 hover:border-amber-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 mb-2 border-b border-stone-200 dark:border-stone-700">
                  <h4 className="font-extrabold text-base sm:text-lg text-stone-900 dark:text-stone-100">
                    {scheme.name}
                  </h4>
                  <div className="flex items-center space-x-2 shrink-0">
                    {scheme.status === 'active' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                        सक्रिय लाभार्थी
                      </span>
                    )}
                    {scheme.status === 'eligible' && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold">
                        आवेदन हेतु पात्र
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadScheme(scheme);
                      }}
                      className="p-1 rounded-lg hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-start space-x-2">
                    <BadgeIndianRupee className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">योजना लाभ:</span>
                      <p className="text-emerald-800 dark:text-emerald-300 font-semibold">{scheme.benefit}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">पात्रता:</span>
                      <p className="text-stone-600 dark:text-stone-400">{scheme.eligibility}</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-stone-800 dark:text-stone-200">जरूरी दस्तावेज:</span>
                      <p className="text-stone-600 dark:text-stone-400">{scheme.documents.join(' • ')}</p>
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
