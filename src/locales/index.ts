import en from './en.json';
import hi from './hi.json';
import bn from './bn.json';
import mr from './mr.json';
import gu from './gu.json';
import ta from './ta.json';
import te from './te.json';
import kn from './kn.json';
import ml from './ml.json';
import pa from './pa.json';
import or_lang from './or.json';

export interface LanguageInfo {
  code: string;
  name: string;
  nativeName: string;
  script: string;
  greetingSample: string;
  sarvamCode: string;
}

export const SUPPORTED_LANGUAGES: LanguageInfo[] = [
  {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    script: 'Devanagari',
    greetingSample: 'नमस्ते किसान भाई',
    sarvamCode: 'hi-IN',
  },
  {
    code: 'bn',
    name: 'Bengali',
    nativeName: 'বাংলা',
    script: 'Bengali',
    greetingSample: 'নমস্কার কৃষক বন্ধু',
    sarvamCode: 'bn-IN',
  },
  {
    code: 'mr',
    name: 'Marathi',
    nativeName: 'मराठी',
    script: 'Devanagari',
    greetingSample: 'नमस्कार शेतकरी बंधू',
    sarvamCode: 'mr-IN',
  },
  {
    code: 'gu',
    name: 'Gujarati',
    nativeName: 'ગુજરાતી',
    script: 'Gujarati',
    greetingSample: 'નમસ્તે ખેડૂત મિત્ર',
    sarvamCode: 'gu-IN',
  },
  {
    code: 'ta',
    name: 'Tamil',
    nativeName: 'தமிழ்',
    script: 'Tamil',
    greetingSample: 'வணக்கம் உழவர் தோழரே',
    sarvamCode: 'ta-IN',
  },
  {
    code: 'te',
    name: 'Telugu',
    nativeName: 'తెలుగు',
    script: 'Telugu',
    greetingSample: 'నమస్కారం రైతు సోదరా',
    sarvamCode: 'te-IN',
  },
  {
    code: 'kn',
    name: 'Kannada',
    nativeName: 'ಕನ್ನಡ',
    script: 'Kannada',
    greetingSample: 'ನಮಸ್ಕಾರ ರೈತ ಮಿತ್ರ',
    sarvamCode: 'kn-IN',
  },
  {
    code: 'ml',
    name: 'Malayalam',
    nativeName: 'മലയാളം',
    script: 'Malayalam',
    greetingSample: 'നമസ്കാരം കർഷക സുഹൃത്തേ',
    sarvamCode: 'ml-IN',
  },
  {
    code: 'pa',
    name: 'Punjabi',
    nativeName: 'ਪੰਜਾਬੀ',
    script: 'Gurmukhi',
    greetingSample: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਕਿਸਾਨ ਵੀਰੋ',
    sarvamCode: 'pa-IN',
  },
  {
    code: 'or',
    name: 'Odia',
    nativeName: 'ଓଡ଼ିଆ',
    script: 'Odia',
    greetingSample: 'ନମସ୍କାର ଚାଷୀ ଭାଇ',
    sarvamCode: 'od-IN',
  },
  {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    script: 'Latin',
    greetingSample: 'Welcome Farmer Friend',
    sarvamCode: 'en-IN',
  },
];

export const DICTIONARIES: Record<string, any> = {
  hi,
  bn,
  mr,
  gu,
  ta,
  te,
  kn,
  ml,
  pa,
  or: or_lang,
  en,
};

// Deep getter with fallback to English, then Hindi
export function getTranslation(dict: any, path: string, fallbackDict = en): string {
  const parts = path.split('.');
  let val = dict;
  for (const part of parts) {
    if (val && typeof val === 'object' && part in val) {
      val = val[part];
    } else {
      val = undefined;
      break;
    }
  }

  if (typeof val === 'string' && val.trim() !== '') return val;

  // Fallback to English
  let fallbackVal: any = fallbackDict;
  for (const part of parts) {
    if (fallbackVal && typeof fallbackVal === 'object' && part in fallbackVal) {
      fallbackVal = fallbackVal[part];
    } else {
      fallbackVal = undefined;
      break;
    }
  }

  if (typeof fallbackVal === 'string' && fallbackVal.trim() !== '') return fallbackVal;

  // Secondary fallback to Hindi
  let hiVal: any = hi;
  for (const part of parts) {
    if (hiVal && typeof hiVal === 'object' && part in hiVal) {
      hiVal = hiVal[part];
    } else {
      hiVal = undefined;
      break;
    }
  }

  if (typeof hiVal === 'string' && hiVal.trim() !== '') return hiVal;

  return path;
}
