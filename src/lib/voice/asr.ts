/**
 * Automatic Speech Recognition (ASR) Module
 * - Captures audio via MediaRecorder for Bhashini pipeline
 * - Uses Web Speech API for real-time interim results and instant fallback
 * - Auto-stops after 5 seconds of silence
 */

export interface AsrCallbacks {
  onInterim: (interimText: string) => void;
  onFinal: (finalText: string, confidence: number) => void;
  onError: (error: string) => void;
  onSilenceTimeout?: () => void;
}

export class VoiceAsrService {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private speechRecognition: any = null;
  private silenceTimer: any = null;
  private isRecording = false;
  private activeStream: MediaStream | null = null;

  public async startListening(languageCode: string, callbacks: AsrCallbacks) {
    if (this.isRecording) {
      this.stopListening();
    }

    this.isRecording = true;
    this.audioChunks = [];
    this.resetSilenceTimer(callbacks);

    // 1. Initialize browser Web Speech Recognition for real-time interim results and fallback
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    let finalTranscript = '';

    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.maxAlternatives = 1;

        // Map language code to standard BCP-47 for Web Speech
        const bcp47Map: Record<string, string> = {
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
        recognition.lang = bcp47Map[languageCode] || 'hi-IN';

        recognition.onresult = (event: any) => {
          this.resetSilenceTimer(callbacks);
          let interim = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interim += transcript;
            }
          }

          if (interim) {
            callbacks.onInterim(interim.trim());
          }

          if (finalTranscript) {
            callbacks.onInterim(finalTranscript.trim());
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('Speech recognition error/notice:', event.error);
          if (event.error === 'not-allowed') {
            callbacks.onError('Microphone permission was denied. Please allow microphone access or use keypad.');
            this.stopListening();
          }
        };

        recognition.onend = () => {
          if (this.isRecording && finalTranscript.trim()) {
            callbacks.onFinal(finalTranscript.trim(), 0.92);
          }
        };

        this.speechRecognition = recognition;
        recognition.start();
      } catch (e) {
        console.warn('Web Speech API initialization note:', e);
      }
    }

    // 2. Capture microphone stream with MediaRecorder for free Indic ASR backend
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.activeStream = stream;

        const recorder = new MediaRecorder(stream);
        this.mediaRecorder = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            this.audioChunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          if (this.audioChunks.length > 0) {
            const mimeType = this.mediaRecorder?.mimeType || 'audio/webm';
            const audioBlob = new Blob(this.audioChunks, { type: mimeType });
            // Only send if audio blob has substantial recorded bytes (>= 800 bytes)
            if (audioBlob.size >= 800) {
              this.processIndicConformerAudio(audioBlob, languageCode, callbacks, finalTranscript);
            } else if (finalTranscript.trim()) {
              callbacks.onFinal(finalTranscript.trim(), 0.9);
            }
          }
        };

        recorder.start(500);
      }
    } catch (err: any) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        callbacks.onError('Microphone permission denied. You can use the keypad directly.');
      } else {
        console.warn('Audio stream recording initialization:', err);
      }
    }
  }

  private resetSilenceTimer(callbacks: AsrCallbacks) {
    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
    }
    // Auto-stop after 5 seconds of silence as per requirements
    this.silenceTimer = setTimeout(() => {
      if (this.isRecording) {
        this.stopListening();
        if (callbacks.onSilenceTimeout) {
          callbacks.onSilenceTimeout();
        }
      }
    }, 5000);
  }

  private async processIndicConformerAudio(
    audioBlob: Blob,
    languageCode: string,
    callbacks: AsrCallbacks,
    fallbackText: string
  ) {
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Audio = (reader.result as string)?.split(',')[1];
        if (!base64Audio) return;

        const res = await fetch('/api/voice/asr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioContent: base64Audio,
            language: languageCode,
            mimeType: audioBlob.type || 'audio/webm',
          }),
        });

        if (res.ok) {
          const data = await res.json();
          if ((data.provider === 'indic_conformer' || data.provider === 'bhashini') && data.transcript) {
            callbacks.onFinal(data.transcript, data.confidence || 0.95);
            return;
          }
        }

        // If IndicConformer returned fallback or empty, rely on final browser transcript
        if (fallbackText.trim()) {
          callbacks.onFinal(fallbackText.trim(), 0.9);
        }
      };
      reader.readAsDataURL(audioBlob);
    } catch (e) {
      if (fallbackText.trim()) {
        callbacks.onFinal(fallbackText.trim(), 0.9);
      }
    }
  }

  public stopListening() {
    this.isRecording = false;

    if (this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }

    if (this.speechRecognition) {
      try {
        this.speechRecognition.stop();
      } catch (e) {}
      this.speechRecognition = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }

    if (this.activeStream) {
      this.activeStream.getTracks().forEach((track) => track.stop());
      this.activeStream = null;
    }
  }

  public isActive(): boolean {
    return this.isRecording;
  }
}

export const asrService = new VoiceAsrService();
