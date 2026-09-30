import React, { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'motion/react';
import {
  Phone,
  KeyRound,
  User,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
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

interface RegisterFormProps {
  onSuccess: () => void;
  onNavigateLogin: () => void;
  onBack: () => void;
}

const registerSchema = z.object({
  mobile: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Must be a 10-digit Indian mobile number starting with 6-9'),
  otp: z.string().regex(/^\d{6}$/, 'OTP must be 6 digits'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  pin: z.string().regex(/^\d{6}$/, 'PIN must be 6 digits'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

type RegisterStep =
  | 'step1_mobile'
  | 'step1_confirm_mobile'
  | 'step2_otp'
  | 'step2_confirm_otp'
  | 'step3_name'
  | 'step3_confirm_name'
  | 'step4_pin'
  | 'submitting';

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSuccess,
  onNavigateLogin,
  onBack,
}) => {
  const { currentLanguage, t } = useLanguage();
  const { speak, startListening, stopListening, onTranscriptReceived } = useVoice();
  const { sendOtp, verifyOtp, register: registerUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [step, setStep] = useState<RegisterStep>('step1_mobile');
  const [mobileValue, setMobileValue] = useState<string>('');
  const [otpValue, setOtpValue] = useState<string>('');
  const [nameValue, setNameValue] = useState<string>('');
  const [pinValue, setPinValue] = useState<string>('');
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);
  const [demoOtp, setDemoOtp] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [useKeypad, setUseKeypad] = useState<boolean>(false);

  // Automation refs
  const promptedStepRef = useRef<RegisterStep | null>(null);
  const retryCountRef = useRef<number>(0);
  const isBusyRef = useRef<boolean>(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { mobile: '', otp: '', name: '', pin: '' },
  });

  // Step 1: On mount, speak greeting and auto-start listening
  useEffect(() => {
    if (promptedStepRef.current === null) {
      promptedStepRef.current = 'step1_mobile';
      isBusyRef.current = true;
      speak(t('register.greeting') + ' ' + t('register.step1Prompt')).then(() => {
        isBusyRef.current = false;
        startListening();
      });
    }
  }, [speak, startListening, t]);

  // Voice decision automation
  useEffect(() => {
    if (!onTranscriptReceived) return;

    const unsubscribe = onTranscriptReceived(async (transcript) => {
      if (isBusyRef.current || useKeypad) return;

      const decision = interpretVoiceDecision(transcript);
      const digits = extractDigits(transcript);

      // Global navigation
      if (decision.intent === 'login') {
        onNavigateLogin();
        return;
      }

      switch (step) {
        case 'step1_mobile': {
          if (digits && digits.length >= 10) {
            const tenDigits = digits.slice(-10);
            if (/^[6-9]\d{9}$/.test(tenDigits)) {
              setMobileValue(tenDigits);
              setValue('mobile', tenDigits);
              setErrorMessage(null);
              retryCountRef.current = 0;
              setStep('step1_confirm_mobile');
              promptedStepRef.current = 'step1_confirm_mobile';
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

        case 'step1_confirm_mobile': {
          if (decision.intent === 'confirm') {
            // Send OTP and auto-advance
            isBusyRef.current = true;
            stopListening();
            const otpRes = await sendOtp(mobileValue, 'register');
            if (!otpRes.success) {
              setErrorMessage(otpRes.error || 'Failed to send OTP');
              await speak(otpRes.error || 'Failed to send OTP');
              isBusyRef.current = false;
              return;
            }

            if (otpRes.demoOtp) {
              setDemoOtp(otpRes.demoOtp);
            }
            setSmsSentNotice(true);

            setStep('step2_otp');
            promptedStepRef.current = 'step2_otp';
            await speak(t('register.step2Prompt'));
            isBusyRef.current = false;
            startListening();
          } else if (decision.intent === 'cancel') {
            setMobileValue('');
            setValue('mobile', '');
            setStep('step1_mobile');
            promptedStepRef.current = 'step1_mobile';
            isBusyRef.current = true;
            await speak(t('register.step1Prompt'));
            isBusyRef.current = false;
            startListening();
          }
          break;
        }

        case 'step2_otp': {
          if (digits && digits.length >= 6) {
            const sixDigits = digits.slice(0, 6);
            setOtpValue(sixDigits);
            setValue('otp', sixDigits);
            setStep('step2_confirm_otp');
            promptedStepRef.current = 'step2_confirm_otp';
            isBusyRef.current = true;
            await speak(`आपने ओटीपी ${sixDigits.split('').join(' ')} कहा। क्या यह सही है?`);
            isBusyRef.current = false;
            startListening();
            return;
          }

          retryCountRef.current += 1;
          if (retryCountRef.current >= 3) {
            setUseKeypad(true);
            speak('कृपया कीपैड से 6 अंकों का ओटीपी दर्ज करें।');
          } else {
            isBusyRef.current = true;
            await speak('कृपया 6 अंकों का सही ओटीपी बताएं।');
            isBusyRef.current = false;
            setTimeout(() => startListening(), 500);
          }
          break;
        }

        case 'step2_confirm_otp': {
          if (decision.intent === 'confirm') {
            isBusyRef.current = true;
            const verifyRes = await verifyOtp(mobileValue, otpValue);
            if (!verifyRes.success) {
              setErrorMessage(verifyRes.error || 'Invalid OTP');
              await speak(verifyRes.error || 'Invalid OTP');
              setStep('step2_otp');
              promptedStepRef.current = 'step2_otp';
              isBusyRef.current = false;
              startListening();
              return;
            }

            // OTP verified, prompt name
            setStep('step3_name');
            promptedStepRef.current = 'step3_name';
            await speak(t('register.step3Prompt'));
            isBusyRef.current = false;
            startListening();
          } else if (decision.intent === 'cancel') {
            setOtpValue('');
            setValue('otp', '');
            setStep('step2_otp');
            promptedStepRef.current = 'step2_otp';
            isBusyRef.current = true;
            await speak(t('register.step2Prompt'));
            isBusyRef.current = false;
            startListening();
          }
          break;
        }

        case 'step3_name': {
          const rawName = transcript.trim();
          if (rawName.length >= 2 && !decision.intent) {
            setNameValue(rawName);
            setValue('name', rawName);
            setStep('step3_confirm_name');
            promptedStepRef.current = 'step3_confirm_name';
            isBusyRef.current = true;
            await speak(`आपका नाम ${rawName} है। क्या यह सही है?`);
            isBusyRef.current = false;
            startListening();
            return;
          }
          break;
        }

        case 'step3_confirm_name': {
          if (decision.intent === 'confirm') {
            setStep('step4_pin');
            promptedStepRef.current = 'step4_pin';
            isBusyRef.current = true;
            await speak(t('register.step4Prompt'));
            isBusyRef.current = false;
            startListening();
          } else if (decision.intent === 'cancel') {
            setNameValue('');
            setValue('name', '');
            setStep('step3_name');
            promptedStepRef.current = 'step3_name';
            isBusyRef.current = true;
            await speak(t('register.step3Prompt'));
            isBusyRef.current = false;
            startListening();
          }
          break;
        }

        case 'step4_pin': {
          if (digits && digits.length >= 6) {
            const sixDigits = digits.slice(0, 6);
            setPinValue(sixDigits);
            setValue('pin', sixDigits);
            executeRegistration(mobileValue, otpValue, nameValue, sixDigits);
          }
          break;
        }
      }
    });

    return unsubscribe;
  }, [
    step,
    mobileValue,
    otpValue,
    nameValue,
    pinValue,
    useKeypad,
    onTranscriptReceived,
    speak,
    startListening,
    stopListening,
    sendOtp,
    verifyOtp,
    setValue,
    t,
    onNavigateLogin,
  ]);

  const executeRegistration = async (
    mobile: string,
    otp: string,
    name: string,
    pin: string
  ) => {
    setIsSubmitting(true);
    isBusyRef.current = true;
    stopListening();
    setErrorMessage(null);

    const res = await registerUser({
      mobile,
      otp,
      name: name || 'किसान भाई',
      pin,
      language: currentLanguage,
    });
    setIsSubmitting(false);

    if (res.success) {
      await speak(t('register.registerSuccess'));
      onSuccess();
    } else {
      setErrorMessage(res.error || 'Registration failed');
      await speak(res.error || 'Registration failed');
      isBusyRef.current = false;
      setUseKeypad(true);
    }
  };

  const onKeypadSubmit = (data: RegisterFormData) => {
    executeRegistration(data.mobile, data.otp, data.name, data.pin);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-8 max-w-lg mx-auto">
      {/* Back button & keypad switch */}
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
            {t('register.title')}
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1 font-medium">
            {t('register.subtitle')}
          </p>
        </div>

        {/* SMS Dispatch Confirmation Notice */}
        {smsSentNotice && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-700 rounded-2xl text-emerald-900 dark:text-emerald-200 text-xs sm:text-sm flex items-center space-x-3 shadow-sm">
            <span className="text-2xl">📩</span>
            <div className="flex-1">
              <span className="font-bold block">SMS Verification Code Sent</span>
              <span className="text-stone-600 dark:text-stone-400 text-xs">
                A 6-digit OTP code has been dispatched to +91-{mobileValue}.
              </span>
            </div>
          </div>
        )}

        {/* Demo OTP Banner for immediate demonstration */}
        {demoOtp && (
          <div className="mb-4 p-3.5 bg-amber-50 dark:bg-amber-950/70 border-2 border-amber-400 dark:border-amber-600 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
            <div className="flex items-center space-x-2.5">
              <span className="text-2xl">🔑</span>
              <div>
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 uppercase tracking-wider block">
                  Demo Verification OTP (डेमो ओटीपी)
                </span>
                <span className="text-[11px] text-amber-800 dark:text-amber-300">
                  Use this 6-digit code for instant demo:
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2 shrink-0">
              <span className="font-mono text-2xl font-black bg-white dark:bg-stone-900 px-3.5 py-1 rounded-xl border border-amber-400 dark:border-amber-600 text-stone-900 dark:text-amber-300 tracking-widest shadow-inner">
                {demoOtp}
              </span>
              <button
                type="button"
                onClick={() => {
                  setOtpValue(demoOtp);
                  setValue('otp', demoOtp);
                  setStep('step2_confirm_otp');
                }}
                className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl cursor-pointer transition-colors shadow-sm"
              >
                Auto-fill
              </button>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-sm font-semibold text-center">
            {errorMessage}
          </div>
        )}

        {/* Interactive Guided View (Voice + Direct Manual Typing at Every Step) */}
        {!useKeypad ? (
          <div className="flex flex-col items-center justify-center my-4">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 w-full mb-5 text-center">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                {step.startsWith('step1') && t('register.step1Title')}
                {step.startsWith('step2') && t('register.step2Title')}
                {step.startsWith('step3') && t('register.step3Title')}
                {step === 'step4_pin' && t('register.step4Title')}
              </span>
              <p className="text-base sm:text-lg font-extrabold text-stone-800 dark:text-stone-200 mb-3">
                {step === 'step1_mobile' && t('register.step1Prompt')}
                {step === 'step1_confirm_mobile' && `मोबाइल: +91 ${mobileValue}. क्या यह सही है?`}
                {step === 'step2_otp' && t('register.step2Prompt')}
                {step === 'step2_confirm_otp' && `ओटीपी: ${otpValue}. क्या यह सही है?`}
                {step === 'step3_name' && t('register.step3Prompt')}
                {step === 'step3_confirm_name' && `नाम: ${nameValue}. क्या यह सही है?`}
                {step === 'step4_pin' && t('register.step4Prompt')}
              </p>

              {/* Direct interactive manual entry at each step */}
              <div className="flex flex-col items-center justify-center w-full max-w-xs mx-auto">
                {step.startsWith('step1') && (
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
                            setStep('step1_confirm_mobile');
                          }
                        }}
                        className="w-full pl-12 pr-4 py-2.5 text-center font-mono text-2xl font-bold tracking-wider text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                      />
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">🎙️ बोलें या ⌨️ सीधे मोबाइल नंबर टाइप करें</span>

                    <button
                      type="button"
                      onClick={async () => {
                        const demoNum = '9876543222';
                        setMobileValue(demoNum);
                        setValue('mobile', demoNum);
                        setStep('step1_confirm_mobile');
                        const res = await sendOtp(demoNum, 'register');
                        if (res.demoOtp) setDemoOtp(res.demoOtp);
                        setSmsSentNotice(true);
                      }}
                      className="mt-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-3 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-200 dark:hover:bg-emerald-900 cursor-pointer transition-colors"
                    >
                      ⚡ डेमो के लिए त्वरित नंबर (Quick Demo Number)
                    </button>
                  </div>
                )}

                {step.startsWith('step2') && (
                  <div className="w-full">
                    <input
                      type="tel"
                      maxLength={6}
                      value={otpValue}
                      placeholder="••••••"
                      autoFocus
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                        setOtpValue(val);
                        setValue('otp', val);
                        if (val.length === 6) {
                          setStep('step2_confirm_otp');
                        }
                      }}
                      className="w-full py-2.5 text-center font-mono text-3xl font-black tracking-widest text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">🎙️ बोलें या ⌨️ SMS से 6-अंकों का OTP कोड टाइप करें</span>
                    <div className="flex items-center justify-center space-x-3 mt-2">
                      <button
                        type="button"
                        onClick={async () => {
                          const targetNum = mobileValue || '9876543222';
                          const res = await sendOtp(targetNum, 'register');
                          if (res.demoOtp) setDemoOtp(res.demoOtp);
                          setSmsSentNotice(true);
                          speak('ओटीपी आपके मोबाइल पर फिर से भेज दिया गया है।');
                        }}
                        className="text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline cursor-pointer"
                      >
                        {t('register.resendOtp')}
                      </button>
                      {!demoOtp && (
                        <button
                          type="button"
                          onClick={async () => {
                            const res = await sendOtp(mobileValue || '9876543222', 'register');
                            if (res.demoOtp) setDemoOtp(res.demoOtp);
                          }}
                          className="text-xs font-bold text-emerald-700 dark:text-emerald-400 underline cursor-pointer"
                        >
                          🔑 स्क्रीन पर डेमो कोड दिखाएं
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {step.startsWith('step3') && (
                  <div className="w-full">
                    <input
                      type="text"
                      value={nameValue}
                      placeholder="e.g. Ramesh Kumar"
                      autoFocus
                      onChange={(e) => {
                        setNameValue(e.target.value);
                        setValue('name', e.target.value);
                        if (e.target.value.trim().length >= 2) {
                          setStep('step3_confirm_name');
                        }
                      }}
                      className="w-full py-2.5 px-3 text-center text-xl font-bold text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">🎙️ बोलें या ⌨️ अपना नाम टाइप करें</span>
                  </div>
                )}

                {step === 'step4_pin' && (
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
                          onKeypadSubmit({
                            mobile: mobileValue,
                            otp: otpValue,
                            name: nameValue,
                            pin: val,
                          });
                        }
                      }}
                      className="w-full py-2.5 text-center font-mono text-3xl font-black tracking-widest text-emerald-950 dark:text-emerald-200 bg-white dark:bg-stone-800 rounded-xl border-2 border-emerald-400 dark:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 mt-1 block">⌨️ 6-अंकों का सुरक्षा पिन टाइप करें</span>
                  </div>
                )}
              </div>
            </div>

            <VoiceMicButton size="lg" showLabel={true} className="my-2" />

            {/* Confirm / Advance manual buttons */}
            {(step === 'step1_mobile' && mobileValue.length === 10) && (
              <div className="w-full mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    const res = await sendOtp(mobileValue, 'register');
                    if (res.demoOtp) setDemoOtp(res.demoOtp);
                    setSmsSentNotice(true);
                    setStep('step2_otp');
                    promptedStepRef.current = 'step2_otp';
                    speak(t('register.step2Prompt')).then(() => startListening());
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>आगे बढ़ें (OTP भेजें)</span>
                </button>
              </div>
            )}

            {(step === 'step2_otp' && otpValue.length === 6) && (
              <div className="w-full mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    await verifyOtp(mobileValue, otpValue);
                    setStep('step3_name');
                    promptedStepRef.current = 'step3_name';
                    speak(t('register.step3Prompt')).then(() => startListening());
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>OTP सत्यापित करें</span>
                </button>
              </div>
            )}

            {(step === 'step3_name' && nameValue.trim().length >= 2) && (
              <div className="w-full mt-4">
                <button
                  type="button"
                  onClick={() => {
                    setStep('step4_pin');
                    promptedStepRef.current = 'step4_pin';
                    speak(t('register.step4Prompt')).then(() => startListening());
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>पिन सेट करें</span>
                </button>
              </div>
            )}

            {/* Confirm / Cancel voice fallback buttons */}
            {(step === 'step1_confirm_mobile' ||
              step === 'step2_confirm_otp' ||
              step === 'step3_confirm_name') && (
              <div className="flex items-center space-x-3 w-full mt-4">
                <button
                  type="button"
                  onClick={async () => {
                    if (step === 'step1_confirm_mobile') {
                      const res = await sendOtp(mobileValue, 'register');
                      if (res.demoOtp) setDemoOtp(res.demoOtp);
                      setSmsSentNotice(true);
                      setStep('step2_otp');
                      promptedStepRef.current = 'step2_otp';
                      speak(t('register.step2Prompt')).then(() => startListening());
                    } else if (step === 'step2_confirm_otp') {
                      await verifyOtp(mobileValue, otpValue);
                      setStep('step3_name');
                      promptedStepRef.current = 'step3_name';
                      speak(t('register.step3Prompt')).then(() => startListening());
                    } else if (step === 'step3_confirm_name') {
                      setStep('step4_pin');
                      promptedStepRef.current = 'step4_pin';
                      speak(t('register.step4Prompt')).then(() => startListening());
                    }
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-bold text-base flex items-center justify-center space-x-2 shadow-md cursor-pointer"
                >
                  <Check className="w-5 h-5 text-amber-300" />
                  <span>{t('confirm')}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (step === 'step1_confirm_mobile') {
                      setMobileValue('');
                      setStep('step1_mobile');
                      promptedStepRef.current = 'step1_mobile';
                    } else if (step === 'step2_confirm_otp') {
                      setOtpValue('');
                      setStep('step2_otp');
                      promptedStepRef.current = 'step2_otp';
                    } else {
                      setNameValue('');
                      setStep('step3_name');
                      promptedStepRef.current = 'step3_name';
                    }
                    startListening();
                  }}
                  className="flex-1 py-3 px-4 rounded-xl bg-stone-200 dark:bg-stone-800 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 font-bold text-base flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{t('cancel')}</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Typed Form Fallback */
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
                    const clean = e.target.value.replace(/\D/g, '');
                    setMobileValue(clean);
                    setValue('mobile', clean);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg font-mono"
                />
              </div>
              {errors.mobile && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.mobile.message}</p>
              )}
            </div>

            <div className="flex space-x-2">
              <button
                type="button"
                onClick={async () => {
                  if (/^[6-9]\d{9}$/.test(mobileValue)) {
                    const res = await sendOtp(mobileValue, 'register');
                    if (res.demoOtp) setDemoOtp(res.demoOtp);
                    setSmsSentNotice(true);
                    alert(res.message || 'OTP Sent via SMS');
                  } else {
                    alert('Please enter a valid 10-digit mobile number');
                  }
                }}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                {t('register.resendOtp')}
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                {t('register.otpLabel')}
              </label>
              <input
                {...register('otp')}
                type="text"
                maxLength={6}
                placeholder={t('register.otpPlaceholder')}
                value={otpValue}
                onChange={(e) => {
                  const clean = e.target.value.replace(/\D/g, '');
                  setOtpValue(clean);
                  setValue('otp', clean);
                }}
                className="w-full px-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg font-mono tracking-widest"
              />
              {errors.otp && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.otp.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                {t('register.nameLabel')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  {...register('name')}
                  type="text"
                  placeholder={t('register.namePlaceholder')}
                  value={nameValue}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setValue('name', e.target.value);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase mb-1">
                {t('register.step4Title')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <Lock className="w-5 h-5" />
                </div>
                <input
                  {...register('pin')}
                  type="password"
                  maxLength={6}
                  placeholder="••••••"
                  value={pinValue}
                  onChange={(e) => {
                    const clean = e.target.value.replace(/\D/g, '');
                    setPinValue(clean);
                    setValue('pin', clean);
                  }}
                  className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:border-emerald-600 dark:focus:border-emerald-500 focus:ring-0 text-lg font-mono tracking-widest"
                />
              </div>
              {errors.pin && (
                <p className="text-xs text-rose-600 dark:text-rose-400 mt-1 font-semibold">{errors.pin.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 mt-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-extrabold text-lg shadow-lg flex items-center justify-center space-x-2 cursor-pointer transition-all disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>{t('register.creatingAccount')}</span>
                </>
              ) : (
                <>
                  <span>{t('register.title')}</span>
                  <ArrowRight className="w-5 h-5 text-amber-300" />
                </>
              )}
            </button>
          </form>
        )}

        <div className="mt-6 pt-5 border-t border-stone-200 text-center">
          <p className="text-xs sm:text-sm text-stone-600">
            {t('register.alreadyHaveAccount')}{' '}
            <button
              type="button"
              onClick={onNavigateLogin}
              className="text-emerald-700 hover:text-emerald-800 font-bold underline cursor-pointer ml-1"
            >
              {t('register.loginNow')}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
};
