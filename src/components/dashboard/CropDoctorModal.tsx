import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Stethoscope,
  Camera,
  Upload,
  Sparkles,
  Volume2,
  X,
  CheckCircle,
  AlertTriangle,
  Leaf,
  Loader2,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import cropLeafImg from '../../assets/images/crop_leaf_specimen_1790652891770.jpg';

interface CropDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CropDoctorModal: React.FC<CropDoctorModalProps> = ({ isOpen, onClose }) => {
  const { t, currentLanguage } = useLanguage();
  const { speak } = useVoice();

  const [crop, setCrop] = useState('Wheat (गेहूं)');
  const [selectedSymptom, setSelectedSymptom] = useState('पत्तियों पर पीले-नारंगी धब्बे (Yellow Rust / रतुआ)');
  const [customSymptom, setCustomSymptom] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);

  const sampleSymptoms = [
    'पत्तियों पर पीले-नारंगी धब्बे (Yellow Rust / रतुआ)',
    'पत्तियों का किनारों से सूखना और भूरा होना (Leaf Blight / झुलसा)',
    'पत्तियों का मुड़ना और छोटे कीड़े (Aphid / माहू का प्रकोप)',
    'जड़ों के पास तने का काला पड़ना (Root Rot / जड़ सड़न)',
  ];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDiagnose = async () => {
    setLoading(true);
    setDiagnosis(null);

    try {
      const res = await fetch('/api/farming/crop-doctor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          crop,
          symptoms: customSymptom || selectedSymptom,
          language: currentLanguage,
          imageBase64: imagePreview ? imagePreview.split(',')[1] : undefined,
        }),
      });

      const data = await res.json();
      if (data.diagnosis) {
        setDiagnosis(data.diagnosis);
        // Automatically speak summary
        speak(data.diagnosis.slice(0, 180));
      }
    } catch {
      setDiagnosis('निदान प्रक्रिया में त्रुटि आई। कृपया नजदीकी केवीके कृषि विशेषज्ञ से संपर्क करें।');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="bg-white dark:bg-stone-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border-2 border-emerald-500/30 dark:border-stone-800 text-stone-900 dark:text-stone-100 relative max-h-[90vh] overflow-y-auto transition-colors duration-200"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-600 dark:text-stone-300 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-400 flex items-center justify-center shadow-inner">
            <Stethoscope className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black font-serif text-stone-900 dark:text-stone-100">
              {t('dashboard.cropDoctorTitle')}
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 font-medium">
              पत्ती का फोटो अपलोड करें या लक्षण चुनकर तुरंत सटीक उपचार पाएं
            </p>
          </div>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              फसल चुनें (Crop)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['Wheat (गेहूं)', 'Mustard (सरसों)', 'Soybean / Cotton', 'Gram (चना)', 'Paddy (धान)', 'Vegetables (सब्जियां)'].map(
                (c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCrop(c)}
                    className={`py-2 px-3 rounded-xl text-xs sm:text-sm font-bold border transition-all cursor-pointer ${
                      crop === c
                        ? 'bg-emerald-700 dark:bg-emerald-600 text-white border-emerald-700 dark:border-emerald-600 shadow-sm'
                        : 'bg-stone-50 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
                    }`}
                  >
                    {c}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Leaf photo upload and specimen reference */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300">
                पत्ती का फोटो लगाएं (वैकल्पिक)
              </label>
              <button
                type="button"
                onClick={() => setImagePreview(cropLeafImg)}
                className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline cursor-pointer"
              >
                नमूना पत्ती जांचें (Sample Specimen)
              </button>
            </div>
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 dark:border-stone-700 rounded-2xl p-4 hover:border-emerald-500 bg-stone-50/70 dark:bg-stone-800/40 hover:bg-emerald-50/20 cursor-pointer transition-colors">
              {imagePreview ? (
                <div className="relative text-center">
                  <img
                    src={imagePreview}
                    alt="Leaf preview"
                    referrerPolicy="no-referrer"
                    className="h-32 object-cover rounded-xl shadow-md border border-stone-200 dark:border-stone-700 mx-auto"
                  />
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">
                    फोटो चुना गया (बदलने के लिए क्लिक करें)
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-1 text-stone-500 dark:text-stone-400">
                  <div className="p-3 bg-white dark:bg-stone-800 rounded-full shadow-sm text-emerald-700 dark:text-emerald-400">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-stone-800 dark:text-stone-200">
                    {t('dashboard.uploadLeafPhoto')}
                  </span>
                  <span className="text-[11px] text-stone-400 dark:text-stone-500">कैमरा या गैलरी से फोटो जोड़ें</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Select common symptoms */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 dark:text-stone-300 mb-1.5">
              पत्ती में क्या खराबी दिख रही है?
            </label>
            <div className="space-y-1.5">
              {sampleSymptoms.map((sym) => (
                <button
                  key={sym}
                  type="button"
                  onClick={() => {
                    setSelectedSymptom(sym);
                    setCustomSymptom('');
                  }}
                  className={`w-full text-left p-2.5 rounded-xl text-xs sm:text-sm font-medium border flex items-center justify-between transition-colors cursor-pointer ${
                    selectedSymptom === sym && !customSymptom
                      ? 'bg-amber-100/70 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border-amber-400 dark:border-amber-700 font-bold'
                      : 'bg-stone-50 dark:bg-stone-800/60 text-stone-700 dark:text-stone-300 border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-750'
                  }`}
                >
                  <span>{sym}</span>
                  {selectedSymptom === sym && !customSymptom && (
                    <CheckCircle className="w-4 h-4 text-amber-700 dark:text-amber-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Action Diagnose button */}
          <button
            type="button"
            onClick={handleDiagnose}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 active:scale-98 text-white font-extrabold text-base sm:text-lg shadow-xl flex items-center justify-center space-x-2 transition-all cursor-pointer disabled:opacity-60"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>{t('dashboard.diagnosing')}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-amber-300" />
                <span>{t('dashboard.diagnoseButton')}</span>
              </>
            )}
          </button>
        </div>

        {/* Diagnosis Result View */}
        {diagnosis && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/50 border-2 border-emerald-400 dark:border-emerald-700 text-stone-900 dark:text-stone-100 shadow-md"
          >
            <div className="flex items-center justify-between border-b border-emerald-300/60 dark:border-emerald-800 pb-2 mb-3">
              <span className="font-extrabold text-sm sm:text-base text-emerald-950 dark:text-emerald-300 flex items-center space-x-1.5">
                <Leaf className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
                <span>कृषि विशेषज्ञ निदान रिपोर्ट (Diagnosis Report)</span>
              </span>
              <button
                type="button"
                onClick={() => speak(diagnosis)}
                className="p-1.5 rounded-lg bg-emerald-200/60 dark:bg-emerald-900 hover:bg-emerald-300 dark:hover:bg-emerald-800 text-emerald-900 dark:text-emerald-200 transition-colors cursor-pointer"
                title={t('dashboard.readAloud')}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>

            <div className="whitespace-pre-line text-xs sm:text-sm font-medium text-stone-800 dark:text-stone-200 leading-relaxed font-sans">
              {diagnosis}
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};
