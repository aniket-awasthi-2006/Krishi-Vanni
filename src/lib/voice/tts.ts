/**
 * Text-to-Speech (TTS) Service
 * - Calls Sarvam AI API (/api/voice/tts) and plays via HTMLAudioElement
 * - Falls back to browser Web SpeechSynthesis API if Sarvam is not configured
 * - Supports cancelling speech immediately
 * - Shows subtitle of spoken text for 3 seconds
 */

type SubtitleListener = (text: string | null) => void;

class VoiceTtsService {
  private currentAudio: HTMLAudioElement | null = null;
  private isSpeaking = false;
  private subtitleListeners: Set<SubtitleListener> = new Set();
  private subtitleTimeout: any = null;

  public subscribeSubtitles(listener: SubtitleListener) {
    this.subtitleListeners.add(listener);
    return () => {
      this.subtitleListeners.delete(listener);
    };
  }

  private emitSubtitle(text: string | null) {
    if (this.subtitleTimeout) {
      clearTimeout(this.subtitleTimeout);
      this.subtitleTimeout = null;
    }

    this.subtitleListeners.forEach((fn) => fn(text));

    if (text) {
      // Subtitle auto-dismisses after 3 seconds per specification
      this.subtitleTimeout = setTimeout(() => {
        this.subtitleListeners.forEach((fn) => fn(null));
      }, 3500);
    }
  }

  public async speak(text: string, languageCode = 'hi'): Promise<void> {
    if (!text || !text.trim()) return;

    this.cancelSpeech();
    this.isSpeaking = true;
    this.emitSubtitle(text);

    return new Promise(async (resolve) => {
      try {
        // First attempt Sarvam AI backend synthesis
        const response = await fetch('/api/voice/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, language: languageCode }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.provider === 'sarvam' && data.audioBase64) {
            const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
            this.currentAudio = audio;

            audio.onended = () => {
              this.isSpeaking = false;
              this.currentAudio = null;
              resolve();
            };

            audio.onerror = () => {
              this.speakViaWebSpeech(text, languageCode, resolve);
            };

            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('Sarvam audio playback fallback to Web Speech:', err);
      }

      // Fallback: Web SpeechSynthesis
      this.speakViaWebSpeech(text, languageCode, resolve);
    });
  }

  private speakViaWebSpeech(text: string, languageCode: string, onDone: () => void) {
    if (!('speechSynthesis' in window)) {
      this.isSpeaking = false;
      onDone();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);

      const langMap: Record<string, string> = {
        hi: 'hi-IN',
        bn: 'bn-IN',
        mr: 'mr-IN',
        gu: 'gu-IN',
        ta: 'ta-IN',
        te: 'te-IN',
        kn: 'kn-IN',
        ml: 'ml-IN',
        pa: 'pa-IN',
        or: 'or-IN',
        en: 'en-IN',
      };

      const targetLang = langMap[languageCode] || 'hi-IN';
      utterance.lang = targetLang;
      utterance.rate = 0.95; // slightly slower for maximum clarity for rural farmers
      utterance.pitch = 1.0;

      // Select matching voice if available
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === targetLang || v.lang.startsWith(languageCode));
      if (match) {
        utterance.voice = match;
      }

      utterance.onend = () => {
        this.isSpeaking = false;
        onDone();
      };

      utterance.onerror = (e) => {
        console.warn('Speech synthesis utterance error:', e);
        this.isSpeaking = false;
        onDone();
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn('SpeechSynthesis error:', e);
      this.isSpeaking = false;
      onDone();
    }
  }

  public cancelSpeech() {
    this.isSpeaking = false;
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }

  public getSpeakingState(): boolean {
    return this.isSpeaking;
  }
}

export const ttsService = new VoiceTtsService();
