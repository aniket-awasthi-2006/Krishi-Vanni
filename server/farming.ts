import { Request, Response } from 'express';
import { GoogleGenAI } from '@google/genai';

export const MANDI_RATES = [
  {
    id: 'm1',
    commodity: 'Wheat (गेहूं)',
    mandi: 'Indore APMC, MP',
    variety: 'Sharbati Lok-1',
    minPrice: 2450,
    maxPrice: 2850,
    modalPrice: 2680,
    unit: '₹ / Quintal',
    trend: 'up',
    change: '+₹45 today',
  },
  {
    id: 'm2',
    commodity: 'Mustard (सरसों)',
    mandi: 'Kota Mandi, Rajasthan',
    variety: 'Pusa Bold',
    minPrice: 5350,
    maxPrice: 5780,
    modalPrice: 5620,
    unit: '₹ / Quintal',
    trend: 'up',
    change: '+₹60 today',
  },
  {
    id: 'm3',
    commodity: 'Soybean (सोयाबीन)',
    mandi: 'Ujjain APMC, MP',
    variety: 'JS-9560 (Yellow)',
    minPrice: 4200,
    maxPrice: 4680,
    modalPrice: 4490,
    unit: '₹ / Quintal',
    trend: 'down',
    change: '-₹25 today',
  },
  {
    id: 'm4',
    commodity: 'Cotton (कपास)',
    mandi: 'Rajkot APMC, Gujarat',
    variety: 'Shankar-6',
    minPrice: 7100,
    maxPrice: 7750,
    modalPrice: 7480,
    unit: '₹ / Quintal',
    trend: 'up',
    change: '+₹110 today',
  },
  {
    id: 'm5',
    commodity: 'Onion (प्याज)',
    mandi: 'Lasalgaon, Nashik, MH',
    variety: 'Red Fresh',
    minPrice: 1650,
    maxPrice: 2350,
    modalPrice: 1980,
    unit: '₹ / Quintal',
    trend: 'stable',
    change: '±0',
  },
  {
    id: 'm6',
    commodity: 'Paddy / Basmati (धान)',
    mandi: 'Karnal Mandi, Haryana',
    variety: 'Pusa 1121',
    minPrice: 3800,
    maxPrice: 4350,
    modalPrice: 4150,
    unit: '₹ / Quintal',
    trend: 'up',
    change: '+₹30 today',
  },
  {
    id: 'm7',
    commodity: 'Potato (आलू)',
    mandi: 'Agra Mandi, UP',
    variety: 'Kufri Jyoti',
    minPrice: 1100,
    maxPrice: 1450,
    modalPrice: 1320,
    unit: '₹ / Quintal',
    trend: 'down',
    change: '-₹15 today',
  },
];

export const SCHEMES = [
  {
    id: 's1',
    title: 'PM-Kisan Samman Nidhi (पीएम किसान)',
    description: '₹6,000 per year in 3 equal installments of ₹2,000 credited directly into farmer bank accounts.',
    eligibility: 'All landholding farmer families across India.',
    actionUrl: 'https://pmkisan.gov.in',
    tag: 'Direct Income Support',
    status: 'Next installment due soon',
  },
  {
    id: 's2',
    title: 'Pradhan Mantri Fasal Bima Yojana (PMFBY)',
    description: 'Comprehensive risk insurance against crop failure due to non-preventable natural risks, drought, unseasonal rain.',
    eligibility: 'All farmers growing notified crops in notified areas.',
    actionUrl: 'https://pmfby.gov.in',
    tag: 'Crop Insurance',
    status: 'Kharif/Rabi Enrollment Open',
  },
  {
    id: 's3',
    title: 'Soil Health Card Scheme (मृदा स्वास्थ्य कार्ड)',
    description: 'Free testing of 12 soil parameters (N, P, K, micronutrients) with tailored fertilizer dosage advisory to increase crop yield.',
    eligibility: 'All agricultural landowners & sharecroppers.',
    actionUrl: 'https://soilhealth.dac.gov.in',
    tag: 'Soil & Fertilizer Advisory',
    status: 'Available at local KVK',
  },
  {
    id: 's4',
    title: 'Kisan Credit Card (KCC) at 4% Interest',
    description: 'Concessional crop loans up to ₹3,00,000 with prompt repayment subvention at an effective interest rate of 4% p.a.',
    eligibility: 'Individual / joint borrower farmers, SHGs, tenant farmers.',
    actionUrl: 'https://www.myscheme.gov.in/schemes/kcc',
    tag: 'Credit & Working Capital',
    status: 'Apply via rural bank branch',
  },
];

export async function handleGetMandiRates(req: Request, res: Response) {
  const query = (req.query.q as string || '').toLowerCase();
  if (!query) {
    return res.json({ rates: MANDI_RATES });
  }
  const filtered = MANDI_RATES.filter(
    (r) =>
      r.commodity.toLowerCase().includes(query) ||
      r.mandi.toLowerCase().includes(query) ||
      r.variety.toLowerCase().includes(query)
  );
  return res.json({ rates: filtered });
}

export async function handleGetWeather(req: Request, res: Response) {
  // Agricultural hyper-local weather summary
  const weatherData = {
    location: 'Central Agro-Climatic Zone (Indore/Malwa)',
    temp: 28,
    condition: 'Partly Cloudy with Clear Afternoon',
    humidity: 48,
    windSpeed: '11 km/h',
    rainProb: '10%',
    sprayCondition: 'Excellent (Wind < 15km/h, No rain alert next 48h)',
    irrigationAdvice: 'Moderate soil moisture. Delay irrigation by 2 days.',
    forecast: [
      { day: 'Tomorrow', high: 30, low: 18, desc: 'Sunny, ideal for harvesting' },
      { day: 'Wednesday', high: 31, low: 19, desc: 'Dry and warm' },
      { day: 'Thursday', high: 29, low: 17, desc: 'Clear skies' },
    ],
  };
  return res.json(weatherData);
}

export async function handleGetSchemes(req: Request, res: Response) {
  return res.json({ schemes: SCHEMES });
}

export async function handleCropDoctor(req: Request, res: Response) {
  try {
    const { crop, symptoms, language = 'hi', imageBase64 } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are KrishiVaani, an expert agronomist advising Indian farmers.
The farmer is inquiring in language: ${language}.
Crop: ${crop || 'Crop leaf'}
Observed Symptoms: ${symptoms || 'Yellowing and spots on leaves'}

Provide a structured diagnosis for the farmer with:
1. Disease / Pest identification (clear name in both English and ${language})
2. Cause (fungal, bacterial, nutrient deficiency, pest)
3. Immediate organic / home remedy (e.g. neem oil spray, wood ash, cow dung solution)
4. Recommended safe pesticide/fungicide with exact dosage per acre (e.g. Mancozeb, Imidacloprid, etc.)
5. Preventive advice for next season.

Keep the language warm, encouraging, respectful, and simple for a farmer with low literacy. Answer directly in language: ${language}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        const reply = response.text || '';
        return res.json({
          success: true,
          diagnosis: reply,
          source: 'gemini_agronomist',
        });
      } catch (geminiErr) {
        console.warn('Gemini diagnosis fallback:', geminiErr);
      }
    }

    // Default agronomist knowledge-base diagnosis
    const fallbackDiagnosis = `KrishiVaani Disease Diagnosis:
Crop: ${crop || 'Wheat / Mustard'}
Condition: Early Leaf Blight / Yellow Rust (पीला रतुआ)
Cause: Fungal spores thriving in high morning humidity.

Immediate Solution:
1. Organic treatment: Spray Neem oil (5ml per litre water) mixed with mild soap.
2. Recommended Treatment: Spray Propiconazole 25% EC @ 200ml dissolved in 200 litres of water per acre.
3. Precautions: Avoid excess nitrogen (Urea) application during cloudy days and ensure field drainage.`;

    return res.json({
      success: true,
      diagnosis: fallbackDiagnosis,
      source: 'knowledge_base',
    });
  } catch (err: any) {
    console.error('Crop Doctor error:', err);
    return res.status(500).json({ error: 'Diagnosis failed' });
  }
}

export async function handleAskAgronomist(req: Request, res: Response) {
  try {
    const { question, language = 'hi' } = req.body;
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are KrishiVaani, a friendly, knowledgeable, and caring voice farming assistant for an Indian farmer.
Farmer question: "${question}"
Target language: ${language}

Provide a short, direct, clear, highly practical farming answer (3-4 bullet points max) that is easy to listen to when read out by text-to-speech.
Ensure dosage, timing, and advice match Indian agricultural university (ICAR/KVK) standards.
Answer in language: ${language}.`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
        });

        return res.json({
          success: true,
          answer: response.text || 'कृपया अपने नजदीकी कृषि विज्ञान केंद्र से संपर्क करें।',
        });
      } catch (err) {
        console.warn('Gemini agronomist error:', err);
      }
    }

    return res.json({
      success: true,
      answer: 'गेहूं और रबी फसलों में सिंचाई क्राउन रूट इनिशिएशन (CRI) अवस्था पर करें। प्रति एकड़ 45 किलो यूरिया और 25 किलो डीएपी की संतुलित मात्रा प्रयोग करें। किसी भी कीट के प्रकोप पर नीम के तेल का छिड़काव करें।',
    });
  } catch (err: any) {
    console.error('Ask Agronomist error:', err);
    return res.status(500).json({ error: 'Failed to get advisory' });
  }
}
