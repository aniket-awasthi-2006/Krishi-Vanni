# KrishiVaani (कृषिवाणी) - Farmer Voice Portal

Voice-first multilingual farming assistant for Indian farmers, supporting 10 Indian languages (Hindi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia) + English fallback.

## 🚜 App Flow
1. **Language Selection**: Large icon-friendly cards in native scripts. Selecting one saves the choice to cookie and `localStorage`, loads the corresponding translation dictionary, and greets the farmer in their native language. Language can also be changed at any time from the persistent header switcher.
2. **Login or Register**: Selectable by touch or hands-free voice command ("login" or "register").
3. **Voice-Driven Authentication**:
   - **Registration**: 10-digit mobile number -> 6-digit OTP verification -> farmer name -> 6-digit PIN setup.
   - **Login**: 10-digit mobile number + 6-digit PIN.
   - **Keypad Fallback**: Explicit warning given that speaking a PIN out loud in public carries privacy risk; farmers can toggle the numeric keypad at any time.
4. **Farmer-Only Dashboard**:
   - Live Weather and Spray Advisory (optimal wind/humidity spray window + irrigation guidance)
   - Live Mandi Rates (AGMARKNET & e-NAM modal prices with daily trend indicators)
   - Crop Doctor (leaf photo upload & symptom analysis with organic + chemical remedies)
   - My Active Crops & Fertilizer Dosage Advisory
   - Government Schemes (PM-Kisan, PMFBY, KCC, Soil Health Card)
   - Kisan Call Center 1800-180-1551 direct dialer
   - "Listen to this" voice readout on every advisory card

---

## 🔐 Security & Architecture
- **PIN Hashing**: PINs are hashed using bcrypt with salt rounds; plaintext PINs are never stored.
- **Sessions**: JWT tokens stored in httpOnly, Secure, SameSite cookies.
- **Rate Limiting**: Sliding-window rate limiting on OTP and login endpoints.
- **Account Lockout**: 5 consecutive failed logins trigger a 15-minute account lockout.
- **OTP Safeguards**: 5-minute validity, max 3 resends per window, max 5 incorrect attempts.

---

## 🛠 Setup & Environment Variables
Copy `.env.example` to `.env`:
```bash
GEMINI_API_KEY="your_gemini_api_key"
JWT_SECRET="your_jwt_secret"

# MongoDB Database URL (Atlas or Local)
DATABASE_URL="mongodb+srv://username:password@cluster0.mongodb.net/krishivaani?retryWrites=true&w=majority"

# Speech-to-Text (ASR) - Completely Free
# Built-in Indic speech transcription powered by GEMINI_API_KEY + Native Browser Web Speech API
# Optional: Self-hosted open-source IndicConformer
INDIC_CONFORMER_URL="http://localhost:8000/asr/recognize"

# Text-to-Speech (TTS) - Optional (Defaults to 100% free browser SpeechSynthesis)
SARVAM_API_KEY="your_sarvam_key"

# TextBee SMS Gateway (https://textbee.dev)
TEXTBEE_API_KEY="your_textbee_api_key"
TEXTBEE_DEVICE_ID="your_textbee_device_id"
```

### 📱 TextBee SMS Gateway Setup
1. Create a free account at [https://textbee.dev](https://textbee.dev).
2. Install the TextBee Android app on your SMS gateway device and scan the QR code to pair your device.
3. In the TextBee dashboard, copy your **API Key** and **Device ID**.
4. Set `TEXTBEE_API_KEY` and `TEXTBEE_DEVICE_ID` in your environment. Real OTP SMS messages will be immediately delivered to farmers' phones via your paired TextBee gateway device.

### 🍃 MongoDB Configuration
- KrishiVaani supports MongoDB Atlas connection strings (`mongodb+srv://...`) or local instances (`mongodb://localhost:27017/krishivaani`).
- Collections used: `users`, `otps`, `lockouts`.
- Automatic fallback: If `DATABASE_URL` is omitted or temporarily unreachable in offline dev, KrishiVaani uses the high-speed local file-persisted store (`data/db.json`) without crashing.

To run development:
```bash
npm run dev
```

---

## 🎙️ Completely Free Voice Architecture
KrishiVaani uses a 100% free voice stack with zero external paid subscriptions:
- **Speech-to-Text (ASR) (`server/voice.ts` & `src/lib/voice/asr.ts`)**:
  - **Free Native Browser Web Speech API**: Built directly into Google Chrome and Android smartphones; transcribes Hindi, Bengali, Marathi, Gujarati, Tamil, Telugu, Kannada, Malayalam, Punjabi, Odia in real time with zero latency and zero cost.
  - **Free Multilingual Indic Audio Transcription**: Powered by Gemini Multimodal Indic Speech Recognition (`gemini-2.5-flash`), included for free with `GEMINI_API_KEY`.
  - **Optional Free IndicConformer**: If running a self-hosted open-source IndicConformer server (`INDIC_CONFORMER_URL`).
- **Text-to-Speech (TTS) (`server/voice.ts` & `src/lib/voice/tts.ts`)**:
  - **Free Client SpeechSynthesis**: Browser-native voices in Indian languages with adjustable cadence suitable for farmers.
  - Optional: Sarvam AI (`bulbul:v1`) if `SARVAM_API_KEY` is provided.
- No UI components need modification when switching voice engines because the `VoiceContext` contract (`startListening`, `speak`, `cancelSpeech`, `subtitles`) remains identical.
