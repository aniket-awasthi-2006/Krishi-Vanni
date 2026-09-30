import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

// Indian Language metadata for Free Voice Pipeline
export const LANGUAGE_CODES: Record<
  string,
  { code: string; name: string; script: string; sarvam: string }
> = {
  hi: { code: 'hi', name: 'Hindi', script: 'Devanagari', sarvam: 'hi-IN' },
  bn: { code: 'bn', name: 'Bengali', script: 'Bengali', sarvam: 'bn-IN' },
  mr: { code: 'mr', name: 'Marathi', script: 'Devanagari', sarvam: 'mr-IN' },
  gu: { code: 'gu', name: 'Gujarati', script: 'Gujarati', sarvam: 'gu-IN' },
  ta: { code: 'ta', name: 'Tamil', script: 'Tamil', sarvam: 'ta-IN' },
  te: { code: 'te', name: 'Telugu', script: 'Telugu', sarvam: 'te-IN' },
  kn: { code: 'kn', name: 'Kannada', script: 'Kannada', sarvam: 'kn-IN' },
  ml: { code: 'ml', name: 'Malayalam', script: 'Malayalam', sarvam: 'ml-IN' },
  pa: { code: 'pa', name: 'Punjabi', script: 'Gurmukhi', sarvam: 'pa-IN' },
  or: { code: 'or', name: 'Odia', script: 'Odia', sarvam: 'od-IN' },
  en: { code: 'en', name: 'English', script: 'Latin', sarvam: 'en-IN' },
};

/**
 * Completely Free Multilingual Automatic Speech Recognition (ASR):
 * 1. Self-hosted / Open-source IndicConformer (if INDIC_CONFORMER_URL provided)
 * 2. Server-side Gemini Multilingual Indic Audio Speech-to-Text (100% free via GEMINI_API_KEY)
 * 3. Client-side Web Speech API (zero-latency browser fallback on Android Chrome / desktop)
 */
export async function handleAsr(req: Request, res: Response) {
  try {
    const { audioContent, language = 'hi', mimeType: clientMimeType } = req.body;
    const langConfig = LANGUAGE_CODES[language] || LANGUAGE_CODES.hi;

    // Fast-path: if audioContent is missing or empty (< 300 base64 chars / < 220 bytes), return fallback gracefully
    if (!audioContent || typeof audioContent !== 'string' || audioContent.length < 300) {
      return res.json({
        provider: 'fallback_web_speech',
        model: 'Free Client Web Speech ASR',
        message: 'Awaiting voice input or active speech.',
      });
    }

    // 1. Check if user configured a self-hosted free IndicConformer instance
    const indicConformerUrl = process.env.INDIC_CONFORMER_URL;
    if (indicConformerUrl) {
      try {
        const conformerRes = await fetch(indicConformerUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audio_content: audioContent,
            language: langConfig.code,
            model: 'indicconformer',
          }),
        });

        if (conformerRes.ok) {
          const conformerData = await conformerRes.json();
          const transcript =
            conformerData.transcript ||
            conformerData.text ||
            conformerData.output?.[0]?.source ||
            '';

          if (transcript) {
            return res.json({
              provider: 'indic_conformer',
              model: 'Free IndicConformer ASR',
              transcript: transcript.trim(),
              confidence: conformerData.confidence || 0.95,
            });
          }
        }
      } catch (err: any) {
        // Silently proceed to Gemini
      }
    }

    // 2. Free Server-Side Multilingual Indic Audio Transcription via Gemini API
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const cleanAudio = audioContent.replace(/^data:[^;]+;base64,/, '').replace(/\s+/g, '');
        if (cleanAudio.length > 50) {
          const ai = new GoogleGenAI({ apiKey: geminiKey });
          const prompt = `You are a specialized speech-to-text audio transcriber for Indian farmers.
Listen carefully to the audio and transcribe the spoken words verbatim into ${langConfig.name} (${langConfig.script} script).
Rules:
- Transcribe EXACTLY what is spoken.
- If digits/numbers are spoken (e.g. mobile number or OTP), write them as standard digits (0-9) or standard native words.
- Do NOT translate into English unless the speaker spoke English.
- Do NOT add quotes, markdown formatting, explanations, or conversational answers.
- Return ONLY the raw transcribed text.`;

          // Determine actual mimeType from magic bytes or client
          let detectedMime = clientMimeType ? clientMimeType.split(';')[0] : 'audio/webm';
          try {
            const headerBuf = Buffer.from(cleanAudio.slice(0, 32), 'base64');
            if (headerBuf.slice(0, 4).toString() === 'RIFF') {
              detectedMime = 'audio/wav';
            } else if (headerBuf.slice(0, 4).toString() === 'OggS') {
              detectedMime = 'audio/ogg';
            } else if (headerBuf.slice(4, 8).toString() === 'ftyp') {
              detectedMime = 'audio/mp4';
            } else if (headerBuf[0] === 0x1a && headerBuf[1] === 0x45) {
              detectedMime = 'audio/webm';
            }
          } catch {}

          const audioPart = {
            inlineData: {
              mimeType: detectedMime,
              data: cleanAudio,
            },
          };

          let transcript = '';
          try {
            const response = await ai.models.generateContent({
              model: 'gemini-3.5-transcribe',
              contents: {
                parts: [audioPart, { text: prompt }],
              },
            });
            transcript = response.text?.trim() || '';
          } catch {
            try {
              const fallbackRes = await ai.models.generateContent({
                model: 'gemini-3.8-flash',
                contents: {
                  parts: [audioPart, { text: prompt }],
                },
              });
              transcript = fallbackRes.text?.trim() || '';
            } catch {}
          }

          if (transcript) {
            return res.json({
              provider: 'indic_conformer',
              model: 'Free Indic Voice Transcriber',
              transcript,
              confidence: 0.98,
            });
          }
        }
      } catch (e: any) {
        // Handled cleanly; fallback to browser speech recognition
      }
    }

    // 3. Fallback advice: Client Browser Web Speech API (100% free, native, zero-latency)
    return res.json({
      provider: 'fallback_web_speech',
      model: 'Free Client Web Speech ASR',
      message: 'Client Web Speech API active.',
    });
  } catch (err: any) {
    console.error('Free ASR error:', err);
    return res.status(500).json({ error: 'Failed to process speech' });
  }
}

/**
 * Helper to concatenate multiple WAV base64 audio chunks into a single valid WAV file
 */
function concatWavBase64(base64List: string[]): string {
  if (base64List.length === 0) return '';
  if (base64List.length === 1) return base64List[0];

  const buffers = base64List.map((b) => Buffer.from(b, 'base64'));
  const dataParts = buffers.map((buf) => buf.subarray(44));
  const totalDataLen = dataParts.reduce((acc, p) => acc + p.length, 0);

  const header = Buffer.from(buffers[0].subarray(0, 44));
  header.writeUInt32LE(totalDataLen + 36, 4); // RIFF chunk size
  header.writeUInt32LE(totalDataLen, 40); // data chunk size

  const combined = Buffer.concat([header, ...dataParts]);
  return combined.toString('base64');
}

export async function handleTts(req: Request, res: Response) {
  try {
    const { text, language = 'hi' } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS' });
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;
    const langConfig = LANGUAGE_CODES[language] || LANGUAGE_CODES.hi;
    // Cap text to 2500 characters max per specification
    const cleanText = text.replace(/[*_#`]/g, '').trim().slice(0, 2500);

    console.log(`[TTS Request] Lang: ${language} (${langConfig.sarvam}) | Length: ${cleanText.length} chars (max 2500) | Speaker: roopa | Model: bulbul:v3`);

    // If Sarvam AI key is configured, synthesize via Sarvam API (bulbul:v3, speaker: roopa, codec: wav)
    if (sarvamApiKey) {
      try {
        console.log(`[Sarvam AI] Dispatching to https://api.sarvam.ai/text-to-speech with model 'bulbul:v3' and speaker 'roopa'...`);

        // Sarvam enforces max 500 characters per string in 'inputs' list, and max 3 items per API call
        // Split cleanText (up to 2500 chars) into chunks of <= 480 characters
        const sentences = cleanText
          .split(/([।\.\n!?]+)/)
          .map((s) => s.trim())
          .filter(Boolean);

        const allChunks: string[] = [];
        let currentChunk = '';
        for (const s of sentences) {
          if ((currentChunk + ' ' + s).length > 480) {
            if (currentChunk) allChunks.push(currentChunk.trim());
            currentChunk = s;
          } else {
            currentChunk = currentChunk ? `${currentChunk} ${s}` : s;
          }
        }
        if (currentChunk) {
          allChunks.push(currentChunk.trim());
        }

        if (allChunks.length === 0) {
          allChunks.push(cleanText.slice(0, 480));
        }

        // Group into batches of up to 3 items per Sarvam API call
        const batches: string[][] = [];
        for (let i = 0; i < allChunks.length; i += 3) {
          batches.push(allChunks.slice(i, i + 3));
        }

        const generatedAudios: string[] = [];

        for (const batch of batches) {
          const sarvamRes = await fetch('https://api.sarvam.ai/text-to-speech', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-subscription-key': sarvamApiKey,
            },
            body: JSON.stringify({
              inputs: batch,
              target_language_code: langConfig.sarvam,
              speaker: 'roopa',
              pitch: 0,
              pace: 1.0,
              loudness: 1.5,
              speech_sample_rate: 22050,
              enable_preprocessing: true,
              model: 'bulbul:v3',
            }),
          });

          if (sarvamRes.ok) {
            const data = await sarvamRes.json();
            const base64Audio = data.audios?.[0];
            if (base64Audio) {
              generatedAudios.push(base64Audio);
            } else {
              console.warn('[Sarvam AI] Response did not contain audios array:', data);
            }
          } else {
            const errBody = await sarvamRes.text();
            console.warn(`[Sarvam AI] HTTP ${sarvamRes.status} Error:`, errBody);
          }
        }

        if (generatedAudios.length > 0) {
          const mergedWav = concatWavBase64(generatedAudios);
          console.log(`[Sarvam AI] Speech synthesis SUCCESS! Generated ${mergedWav.length} base64 chars (WAV format, speaker 'roopa', model 'bulbul:v3')`);
          return res.json({
            audioBase64: mergedWav,
            format: 'wav',
            provider: 'sarvam',
            speaker: 'roopa',
            model: 'bulbul:v3',
            targetLanguage: langConfig.sarvam,
          });
        }
      } catch (err: any) {
        console.warn('[Sarvam AI] Network/execution exception:', err.message);
      }
    } else {
      console.warn('[TTS] SARVAM_API_KEY environment variable is not defined. Falling back to browser SpeechSynthesis.');
    }

    // Default: instruct client to use client browser SpeechSynthesis
    return res.json({
      provider: 'browser_speech_synthesis',
      message: 'Using browser SpeechSynthesis fallback.',
      targetLanguage: langConfig.sarvam,
    });
  } catch (err: any) {
    console.error('TTS error:', err);
    return res.status(500).json({ error: 'Failed to synthesize speech' });
  }
}
