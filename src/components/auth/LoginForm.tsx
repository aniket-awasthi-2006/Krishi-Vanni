import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'motion/react';
import {
  Phone,
  KeyRound,
  ShieldAlert,
  ArrowRight,
  ArrowLeft,
  Volume2,
  Check,
  RotateCcw,
  Loader2,
  Lock,
  Sun,
  Moon,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useTheme } from '../../context/ThemeContext.js';
import {
  interpretVoiceDecision,
  extractDigits,
} from '../../lib/voice/voiceDecision.js';
import { VoiceMicButton } from '../voice/VoiceMicButton.js';

interface LoginFormProps {
  onSuccess: () => void;
  onNavigateRegister: () => void;
  onBack: () => void;
}

const loginSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a 10-digit Indian mobile number starting with 6-9'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be exactly 6 digits'),
});

type LoginFormData = z.infer<typeof loginSchema>;

type VoiceLoginStep =
  | 'input_mobile'
  | 'confirm_mobile'
  | 'input_pin'
  | 'confirm_pin'
  | 'submitting'
  | 'completed';

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onNavigateRegister,
  onBack,
}) => {
  const { currentLanguage, t } = useLanguage();
  const { speak, startListening, stopListening, onTranscriptReceived } = useVoice();
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<VoiceLoginStep>('input_mobile');
  const [mobileValue, setMobileValue] = useState<string>('');
  const [pinValue, setPinValue] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [useKeypad, setUseKeypad] = useState<boolean>(false);

  // Automation tracking refs
  const promptedStepRef = useRef<VoiceLoginStep | null>(null);
  const retryCountRef = useRef<number>(0);
  const isBusyRef = useRef<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { mobile: '', pin: '' },
  });

  // Step 1: On mount, speak greeting and auto-start listening
  useEffect(() => {
    if (promptedStepRef.current === null) {
      promptedStepRef.current = 'input_mobile';
      isBusyRef.current = true;
      speak(t('login.mobilePrompt')).then(() => {
        isBusyRef.current = false;
        startListening();
      });
    }
  }, [speak, startListening, t]);

  // Voice decision automation handler
  useEffect(() => {
    if (!onTranscriptReceived) return;

    const unsubscribe = onTranscriptReceived(async (transcript) => {
      if (isBusyRef.current || useKeypad) return;

      const decision = interpretVoiceDecision(transcript);
      const digits = extractDigits(transcript);

      // Global navigation intent
      if (decision.intent === 'register') {
        onNavigateRegister();
        return;
      }

      // Voice Step Machine
      switch (step) {
        case 'input_mobile': {
          if (digits && digits.length >= 10) {
            const tenDigits = digits.slice(-10);
            if (/^[6-9]\d{9}$/.test(tenDigits)) {
              setMobileValue(tenDigits);
              setValue('mobile', tenDigits);
              setErrorMessage(null);
              retryCountRef.current = 0;
              setStep('confirm_mobile');
              promptedStepRef.current = 'confirm_mobile';
              isBusyRef.current = true;

              const confirmationPrompt = t('login.confirmMobile', {
                mobile: tenDigits.split('').join(' '),
              });
              await speak(confirmationPrompt);
              isBusyRef.current = false;
              startListening();
              return;
            }
          }

          // Invalid input
          retryCountRef.current += 1;
          if (retryCountRef.current >= 3) {
            setUseKeypad(true);
            speak('कृपया नीचे दिए गए कीपैड से अपना मोबाइल नंबर दर्ज करें।');
          } else {
            isBusyRef.current = true;
            await speak(t('login.invalidMobile'));
            isBusyRef.current = false;
            setTimeout(() => startListening(), 500);
          }
          break;
        }

        case 'confirm_mobile': {
          if (decision.intent === 'confirm') {
            // Auto advance to PIN
            setStep('input_pin');
            promptedStepRef.current = 'input_pin';
            retryCountRef.current = 0;
            isBusyRef.current = true;
            await speak(t('login.pinPrompt'));
            isBusyRef.current = false;
            startListening();
          } else if (decision.intent === 'cancel') {
            // Cancel clears mobile field and re-asks
            setMobileValue('');
            setValue('mobile', '');
            setStep('input_mobile');
            promptedStepRef.current = 'input_mobile';
            isBusyRef.current = true;
            await speak(t('login.mobilePrompt'));
            isBusyRef.current = false;
            startListening();
          }
          break;
        }

        case 'input_pin': {
          if (digits && digits.length >= 6) {
            const sixDigits = digits.slice(0, 6);
            setPinValue(sixDigits);
            setValue('pin', sixDigits);
            setErrorMessage(null);
            retryCountRef.current = 0;
            setStep('confirm_pin');
            promptedStepRef.current = 'confirm_pin';
            isBusyRef.current = true;
            await speak(t('login.confirmPin'));
            isBusyRef.current = false;
            startListening();
            return;
          }

          // Invalid PIN spoken
          retryCountRef.current += 1;
          if (retryCountRef.current >= 2) {
            setUseKeypad(true);
            speak('सुरक्षा के लिए कृपया कीपैड से अपना 6 अंकों का पिन दर्ज करें।');
          } else {
            isBusyRef.current = true;
            await speak(t('login.invalidPin'));
            isBusyRef.current = false;
            setTimeout(() => startListening(), 500);
          }
          break;
        }

        case 'confirm_pin': {
          if (decision.intent === 'confirm') {
            executeLogin(mobileValue, pinValue);
          } else if (decision.intent === 'cancel') {
            setPinValue('');
            setValue('pin', '');
            setStep('input_pin');
            promptedStepRef.current = 'input_pin';
            isBusyRef.current = true;
            await speak(t('login.pinPrompt'));
            isBusyRef.current = false;
            startListening();
          }
          break;
        }
      }
    });

    return unsubscribe;
  }, [
    step,
    mobileValue,
    pinValue,
    useKeypad,
    onTranscriptReceived,
    speak,
    startListening,
    setValue,
    t,
    onNavigateRegister,
  ]);

  const executeLogin = async (mobile: string, pin: string) => {
    setIsSubmitting(true);
    isBusyRef.current = true;
    stopListening();
    setErrorMessage(null);

    const res = await login(mobile, pin);
    setIsSubmitting(false);

    if (res.success) {
      await speak(t('login.loginSuccess'));
      onSuccess();
    } else {
      setErrorMessage(res.error || t('login.failed'));
      await speak(res.error || t('login.failed'));
      isBusyRef.current = false;
      setUseKeypad(true);
    }
  };

  const onKeypadSubmit = (data: LoginFormData) => {
    executeLogin(data.mobile, data.pin);
  };

  const handleKeypadDigit = (digit: string) => {
    if (step === 'input_mobile' || step === 'confirm_mobile') {
      if (mobileValue.length < 10) {
        const next = mobileValue + digit;
        setMobileValue(next);
        setValue('mobile', next);
      }
    } else {
      if (pinValue.length < 6) {
        const next = pinValue + digit;
        setPinValue(next);
        setValue('pin', next);
      }
    }
  };

  const handleBackspace = () => {
    if (step === 'input_mobile' || step === 'confirm_mobile') {
      const next = mobileValue.slice(0, -1);
      setMobileValue(next);
      setValue('mobile', next);
    } else {
      const next = pinValue.slice(0, -1);
      setPinValue(next);
      setValue('pin', next);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto">
      {/* Back button */}
      <div className="w-full flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-semibold text-xs sm:text-sm cursor-pointer transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('back')}</span>
        </button>

        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-amber-500 dark:text-amber-400 cursor-pointer transition-all border border-stone-300 dark:border-stone-700"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => setUseKeypad(!useKeypad)}
            className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 hover:bg-emerald-200 dark:hover:bg-emerald-900 border border-emerald-300 dark:border-emerald-700 px-3.5 py-1.5 rounded-xl cursor-pointer transition-colors shadow-sm flex items-center space-x-1.5"
          >
            <span>{useKeypad ? '🎙️ Voice Guide' : '⌨️ Full Manual Form'}</span>
          </button>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full bg-white dark:bg-stone-900 rounded-3xl p-6 sm:p-8 shadow-xl border-2 border-stone-200 dark:border-stone-800 text-stone-900 dark:text-stone-100 transition-colors duration-200"
      >
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-white p-1.5 shadow-md border-2 border-emerald-300 dark:border-emerald-600 overflow-hidden flex items-center justify-center">
            <img src="/logo.png" alt="KrishiVaani" className="w-full h-full object-contain" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-100 font-serif">
            {t('login.title')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            {t('login.subtitle')}
          </p>
        </div>

        {/* 1-Click Demo Login Credentials Banner for quick testing/presentation */}
        <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-xl">🌾</span>
            <div>
              <span className="font-bold text-amber-900 dark:text-amber-200 block">
                {currentLanguage === 'en' ? 'Demo Farmer Account' : 'डेमो किसान खाता'}
              </span>
              <span className="text-stone-600 dark:text-stone-300 font-mono text-[11px]">
                {currentLanguage === 'en' ? 'Mobile' : 'मोबाइल'}: 9876543210 • {currentLanguage === 'en' ? 'PIN' : 'पिन'}: 123456
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              setMobileValue('9876543210');
              setPinValue('123456');
              setValue('mobile', '9876543210');
              setValue('pin', '123456');
              executeLogin('9876543210', '123456');
            }}
            className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-black rounded-xl text-xs shadow-sm transition-transform active:scale-95 cursor-pointer shrink-0 self-start sm:self-auto"
          >
            {currentLanguage === 'en' ? '1-Click Demo Login ➔' : '1-क्लिक डेमो लॉगिन ➔'}
          </button>
        </div>

        {/* PIN Privacy Warning */}
        <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm flex items-start space-x-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">{t('speakPinWarning')}</span>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Voice & Direct Interactive Step View */}
        {!useKeypad ? (
          <div className="flex flex-col items-center justify-center my-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 w-full mb-5 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                {step === 'input_mobile' && (t('login.step1Title') || 'Step: Mobile Number')}
                {step === 'confirm_mobile' && 'Confirm Mobile Number'}
                {step === 'input_pin' && t('login.pinLabel')}
                {step === 'confirm_pin' && 'Confirm & Submit'}
              </span>
              <p className="text-base sm:text-lg font-extrabold text-stone-800 dark:text-stone-200 mb-3">
                {step === 'input_mobile' && t('login.mobilePrompt')}
                {step === 'confirm_mobile' && t('login.confirmMobile', { mobile: mobileValue })}
                {step === 'input_pin' && t('login.pinPrompt')}
                {step === 'confirm_pin' && t('login.confirmPin')}
              </p>

              {/* Interactive manual typing directly on screen */}
              <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
                {step.includes('mobile') && (
                  <div className="w-full">
                    <div className="relative w-full">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-stone-500 dark:text-stone-400 text-base pointer-events-none">+91</span>
                      <input
                        type="tel"
                        maxLength={10}
                        value={mobileValue}
                        placeholder="9876543210"
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setMobileValue(val);
                          setValue('mobile', val);
                          if (val.length === 10 && /^[6-9]\d{9}$/.test(val)) {
                            setStep('confirm_mobile');
                          }
                        }}
                        className="w-full pl-12 pr-4 py-2.5 text-center font-mono text-2xl font-bold tracking-wider text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">🎙️ बोलें या ⌨️ सीधे मोबाइल नंबर टाइप करें</span>
                  </div>
                )}

                {step.includes('pin') && (
                  <div className="w-full">
                    <input
                      type="password"
                      maxLength={6}
                      value={pinValue}
                      placeholder="••••••"
                      autoFocus
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setPinValue(val);
                        setValue('pin', val);
                        if (val.length === 6) {
                          setStep('confirm_pin');
                        }
                      }}
                      className="w-full py-2.5 text-center font-mono text-3xl font-black tracking-widest text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">⌨️ 6-अंकों का सुरक्षा पिन टाइप करें</span>
                  </div>
                )}
              </div>
            </div>

            {/* Voice Mic Button */}
            <VoiceMicButton size="lg" showLabel={true} className="my-2" />

            {/* Direct button to advance if mobile entered */}
            {(step === 'input_mobile' && mobileValue.length === 10) && (
              <div className="w-full mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('input_pin');
                    promptedStepRef.current = 'input_pin';
                    speak(t('login.pinPrompt')).then(() => startListening());
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>आगे बढ़ें (पिन दर्ज करें)</span>
                </button>
              </div>
            )}

            {/* Confirm / Cancel buttons */}
            {(step === 'confirm_mobile' || step === 'confirm_pin' || (step === 'input_pin' && pinValue.length === 6)) && (
              <div className="flex items-center space-x-3 w-full mt-4">
                <button
                  type="button"
                  onClick={() => {
                    if (step === 'confirm_mobile') {
                      setStep('input_pin');
                      promptedStepRef.current = 'input_pin';
                      speak(t('login.pinPrompt')).then(() => startListening());
                    } else {
                      executeLogin(mobileValue, pinValue);
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>{step === 'confirm_mobile' ? 'पिन दर्ज करें' : 'लॉग इन करें'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (step === 'confirm_mobile') {
                      setMobileValue('');
                      setValue('mobile', '');
                      setStep('input_mobile');
                      promptedStepRef.current = 'input_mobile';
                      speak(t('login.mobilePrompt')).then(() => startListening());
                    } else {
                      setPinValue('');
                      setValue('pin', '');
                      setStep('input_pin');
                      promptedStepRef.current = 'input_pin';
                      speak(t('login.pinPrompt')).then(() => startListening());
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 text-stone-800 dark:text-stone-200 font-bold text-base flex items-center justify-center space-x-2 hover:bg-stone-300 dark:hover:bg-stone-700 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('cancel')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Typed Keypad Fallback */
          <form onSubmit={handleSubmit(onKeypadSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                {t('login.mobileLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  {...register('mobile')}
                  type="tel"
                  maxLength={10}
                  placeholder={t('login.mobilePlaceholder')}
                  value={mobileValue}
                  onChange={(e) => {
                    setMobileValue(e.target.value.replace(/\D/g, ''));
                    setValue('mobile', e.target.value.replace(/\D/g, ''));
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg font-mono tracking-wider text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                  {errors.mobile.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                {t('login.pinLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('pin')}
                  type="password"
                  maxLength={6}
                  placeholder={t('login.pinPlaceholder')}
                  value={pinValue}
                  onChange={(e) => {
                    setPinValue(e.target.value.replace(/\D/g, ''));
                    setValue('pin', e.target.value.replace(/\D/g, ''));
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg font-mono tracking-widest text-stone-900 dark:text-stone-100 placeholder:text-stone-400"
                />
              </div>
              {errors.pin && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">
                  {errors.pin.message}
                </p>
              )}
            </div>

            {/* Quick numeric keypad for low-literacy touch */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => {
                    if (key === 'C') {
                      if (step.includes('mobile')) {
                        setMobileValue('');
                        setValue('mobile', '');
                      } else {
                        setPinValue('');
                        setValue('pin', '');
                      }
                    } else if (key === '⌫') {
                      handleBackspace();
                    } else {
                      handleKeypadDigit(key);
                    }
                  }}
                  className="py-3 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-750 active:bg-stone-300 text-stone-900 dark:text-stone-100 rounded-xl font-bold text-xl shadow-sm border border-stone-200 dark:border-stone-700 cursor-pointer transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('login.loggingIn')}</span>
                </>
              ) : (
                <>
                  <span>{t('login.title')}</span>
                  <ArrowRight className="w-5 h-5 text-amber-300" />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer switch to registration */}
        <div className="mt-6 pt-5 border-t border-stone-200 dark:border-stone-800 text-center">
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400">
            {t('login.noAccount')}{' '}
            <button
              type="button"
              onClick={onNavigateRegister}
              className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-bold underline cursor-pointer ml-1"
            >
              {t('login.registerNow')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
