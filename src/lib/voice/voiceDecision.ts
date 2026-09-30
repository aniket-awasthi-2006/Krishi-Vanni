/**
 * Multilingual Voice Intent Decision Engine for 12 Indian Languages + English
 * Normalizes transcripts and detects Confirm, Cancel, Login, Register, Number strings, and Farming intents.
 */

// Normalized keywords dictionary
const CONFIRM_WORDS = [
  'yes', 'yeah', 'yep', 'ok', 'okay', 'sure', 'confirm', 'correct', 'right', 'ha', 'haan', 'han', 'sahi',
  'thik', 'thik hai', 'accha', 'bilkul', 'avunu', 'sari', 'sare', 'aam', 'aama', 'amang', 'hou', 'hoy',
  'hoye', 'haa', 'ho', 'haji', 'ji haan', 'saty', 'nischit', 'theek', 'haaan', 'ji', 'hawa', 'hoyto'
];

const CANCEL_WORDS = [
  'no', 'nope', 'cancel', 'nah', 'wrong', 'incorrect', 'stop', 'nahi', 'na', 'naa', 'galat',
  'illa', 'illai', 'kadhu', 'kadu', 'nako', 'nahin', 'naahi', 'mat karo', 'rok', 'roko',
  'bhul', 'noye', 'nahin', 'khair', 'chodo', 'badlo', 'punah'
];

const LOGIN_WORDS = [
  'login', 'log in', 'sign in', 'signin', 'khata khole', 'pravesh', 'shuru', 'open',
  'लॉगिन', 'प्रवेश', 'लॉग इन', 'ലോഗിൻ', 'உள்நுழைவு', 'లాగిన్', 'লগইন', 'ਲੌਗਇਨ', 'ଲଗଇନ୍', 'لاگ ان'
];

const REGISTER_WORDS = [
  'register', 'registration', 'sign up', 'signup', 'new account', 'panjikaran', 'naya khata',
  'naya kisan', 'khata banaye', 'nayi entry', 'panjiyan', 'nondani', 'dakhil', 'nond',
  'पंजीकरण', 'रजिस्टर', 'ਰਜਿਸਟਰ', 'ரெஜிஸ்டர்', 'నమోదు', 'রেজিস্টার', 'پنجیکرن', 'رجسٹریشن'
];

// Helper to normalize Indian speech input
export function normalizeVoiceText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .trim()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'।॥]/g, '')
    .replace(/\s+/g, ' ');
}

// Convert spoken number words to digits (English & Hindi transliterations/Devenagari)
const DIGIT_MAP: Record<string, string> = {
  zero: '0', shunye: '0', shunya: '0', sifar: '0',  शून्य: '0', '০': '0', '੦': '0', '೦': '0', '०': '0',
  one: '1', ek: '1', onnu: '1', okati: '1', onde: '1', एक: '1', '১': '1', '੧': '1', '೧': '1', '१': '1',
  two: '2', do: '2', rendu: '2', rendu2: '2', erandu: '2', eradu: '2', dui: '2', don: '2', be: '2', दो: '2', '২': '2', '੨': '2', '೨': '2', '२': '2',
  three: '3', teen: '3', tin: '3', moonu: '3', mudu: '3', mooru: '3', teen3: '3', tran: '3', तीन: '3', '৩': '3', '੩': '3', '೩': '3', '३': '3',
  four: '4', char: '4', chaar: '4', nalu: '4', nalugu: '4', nalku: '4', চার: '4', चार: '4', '৪': '4', '੪': '4', '೪': '4', '४': '4',
  five: '5', panch: '5', paanch: '5', anju: '5', aidu: '5', paanch5: '5', পাঁচ: '5', पांच: '5', '৫': '5', '੫': '5', '೫': '5', '५': '5',
  six: '6', chhah: '6', che: '6', aaru: '6', aaru6: '6', aaru_te: '6', chav: '6', cha: '6', छह: '6', '৬': '6', '੬': '6', '೬': '6', '६': '6',
  seven: '7', saat: '7', sath: '7', yezhu: '7', elu: '7', edu: '7', hat: '7', सात: '7', '৭': '7', '੭': '7', '೭': '7', '७': '7',
  eight: '8', aath: '8', aat: '8', ettu: '8', enimidi: '8', entu: '8', aath8: '8', আট: '8', आठ: '8', '৮': '8', '੮': '8', '೮': '8', '८': '8',
  nine: '9', nau: '9', no: '9', onbadhu: '9', tommidi: '9', ombattu: '9', nav: '9', নয়: '9', नौ: '9', '৯': '9', '੯': '9', '೯': '9', '९': '9',
};

export function extractDigits(transcript: string): string {
  if (!transcript) return '';
  const clean = normalizeVoiceText(transcript);

  // First direct numeric regex
  const directDigits = clean.replace(/\D/g, '');
  if (directDigits.length >= 4) {
    return directDigits;
  }

  // Word-by-word token conversion
  const tokens = clean.split(' ');
  let converted = '';
  for (const token of tokens) {
    if (/^\d+$/.test(token)) {
      converted += token;
    } else if (DIGIT_MAP[token]) {
      converted += DIGIT_MAP[token];
    }
  }

  return converted || directDigits;
}

export type VoiceIntent =
  | 'confirm'
  | 'cancel'
  | 'login'
  | 'register'
  | 'mandi'
  | 'weather'
  | 'crop_doctor'
  | 'unknown';

export function interpretVoiceDecision(transcript: string): {
  intent: VoiceIntent;
  confidence: number;
  extractedDigits: string;
} {
  const normalized = normalizeVoiceText(transcript);
  const digits = extractDigits(transcript);

  // Check confirm
  for (const word of CONFIRM_WORDS) {
    if (normalized === word || normalized.startsWith(word + ' ') || normalized.endsWith(' ' + word)) {
      return { intent: 'confirm', confidence: 0.95, extractedDigits: digits };
    }
  }

  // Check cancel
  for (const word of CANCEL_WORDS) {
    if (normalized === word || normalized.startsWith(word + ' ') || normalized.endsWith(' ' + word)) {
      return { intent: 'cancel', confidence: 0.95, extractedDigits: digits };
    }
  }

  // Check login
  for (const word of LOGIN_WORDS) {
    if (normalized.includes(word)) {
      return { intent: 'login', confidence: 0.92, extractedDigits: digits };
    }
  }

  // Check register
  for (const word of REGISTER_WORDS) {
    if (normalized.includes(word)) {
      return { intent: 'register', confidence: 0.92, extractedDigits: digits };
    }
  }

  // Domain checks
  if (
    normalized.includes('mandi') ||
    normalized.includes('bhav') ||
    normalized.includes('rate') ||
    normalized.includes('price') ||
    normalized.includes('bazaar') ||
    normalized.includes('daam')
  ) {
    return { intent: 'mandi', confidence: 0.9, extractedDigits: digits };
  }

  if (
    normalized.includes('weather') ||
    normalized.includes('mausam') ||
    normalized.includes('barish') ||
    normalized.includes('rain') ||
    normalized.includes('hawa')
  ) {
    return { intent: 'weather', confidence: 0.9, extractedDigits: digits };
  }

  if (
    normalized.includes('disease') ||
    normalized.includes('rog') ||
    normalized.includes('keeda') ||
    normalized.includes('pest') ||
    normalized.includes('patti') ||
    normalized.includes('leaf') ||
    normalized.includes('peela')
  ) {
    return { intent: 'crop_doctor', confidence: 0.9, extractedDigits: digits };
  }

  return { intent: 'unknown', confidence: 0.5, extractedDigits: digits };
}
