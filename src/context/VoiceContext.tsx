import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { asrService } from '../lib/voice/asr.js';
import { ttsService } from '../lib/voice/tts.js';
import { useLanguage } from './LanguageContext.js';

export type MicState = 'idle' | 'listening' | 'processing' | 'speaking' | 'error';

interface VoiceContextType {
  micState: MicState;
  transcript: string;
  interimTranscript: string;
  subtitle: string | null;
  errorMessage: string | null;
  isMicPermitted: boolean;
  startListening: (customLang?: string) => Promise<void>;
  stopListening: () => void;
  speak: (text: string, customLang?: string) => Promise<void>;
  cancelSpeech: () => void;
  clearTranscript: () => void;
  onTranscriptReceived?: (handler: (text: string) => void) => () => void;
}

const VoiceContext = createContext<VoiceContextType | undefined>(undefined);

export const VoiceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { currentLanguage } = useLanguage();
  const [micState, setMicState] = useState<MicState>('idle');
  const [transcript, setTranscript] = useState<string>('');
  const [interimTranscript, setInterimTranscript] = useState<string>('');
  const [subtitle, setSubtitle] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isMicPermitted, setIsMicPermitted] = useState<boolean>(true);

  // Subscribers for final transcript
  const transcriptSubscribers = React.useRef<Set<(text: string) => void>>(new Set());

  // Listen to TTS subtitles
  useEffect(() => {
    const unsubscribe = ttsService.subscribeSubtitles((text) => {
      setSubtitle(text);
      if (text) {
        setMicState('speaking');
      } else {
        setMicState((prev) => (prev === 'speaking' ? 'idle' : prev));
      }
    });
    return unsubscribe;
  }, []);

  const cancelSpeech = useCallback(() => {
    ttsService.cancelSpeech();
    setSubtitle(null);
    setMicState('idle');
  }, []);

  const speak = useCallback(
    async (text: string, customLang?: string) => {
      if (!text) return;
      asrService.stopListening();
      setMicState('speaking');
      await ttsService.speak(text, customLang || currentLanguage);
      setMicState('idle');
    },
    [currentLanguage]
  );

  const clearTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
  }, []);

  const startListening = useCallback(
    async (customLang?: string) => {
      cancelSpeech();
      setErrorMessage(null);
      setMicState('listening');
      setInterimTranscript('');

      try {
        await asrService.startListening(customLang || currentLanguage, {
          onInterim: (text) => {
            setInterimTranscript(text);
          },
          onFinal: (finalText) => {
            setTranscript(finalText);
            setInterimTranscript('');
            setMicState('processing');

            // Notify subscribers
            transcriptSubscribers.current.forEach((handler) => handler(finalText));

            setTimeout(() => {
              setMicState('idle');
            }, 600);
          },
          onError: (err) => {
            setErrorMessage(err);
            setMicState('error');
            if (err.includes('denied') || err.includes('not-allowed')) {
              setIsMicPermitted(false);
            }
          },
          onSilenceTimeout: () => {
            setMicState('idle');
          },
        });
      } catch (err: any) {
        setErrorMessage(err.message || 'Failed to start microphone');
        setMicState('error');
      }
    },
    [cancelSpeech, currentLanguage]
  );

  const stopListening = useCallback(() => {
    asrService.stopListening();
    setMicState('idle');
  }, []);

  const onTranscriptReceived = useCallback((handler: (text: string) => void) => {
    transcriptSubscribers.current.add(handler);
    return () => {
      transcriptSubscribers.current.delete(handler);
    };
  }, []);

  return (
    <VoiceContext.Provider
      value={{
        micState,
        transcript,
        interimTranscript,
        subtitle,
        errorMessage,
        isMicPermitted,
        startListening,
        stopListening,
        speak,
        cancelSpeech,
        clearTranscript,
        onTranscriptReceived,
      }}
    >
      {children}
    </VoiceContext.Provider>
  );
};

export const useVoice = (): VoiceContextType => {
  const ctx = useContext(VoiceContext);
  if (!ctx) {
    throw new Error('useVoice must be used within a VoiceProvider');
  }
  return ctx;
};
