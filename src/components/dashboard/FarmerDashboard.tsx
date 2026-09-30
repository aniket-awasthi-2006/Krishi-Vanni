import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  Stethoscope,
  PhoneCall,
  Volume2,
  Send,
  Loader2,
  MapPin,
  CheckCircle,
  Sprout,
  Store,
  CloudSun,
  ChevronRight,
  Headphones,
  Landmark,
  FlaskConical,
  Calendar,
  Droplets,
  TrendingUp,
  Activity,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext.js';
import { useAuth } from '../../context/AuthContext.js';
import { useVoice } from '../../context/VoiceContext.js';
import { VoiceMicButton } from '../voice/VoiceMicButton.js';

// The 4 Core Presentation Modals
import { MyCropsModal } from './MyCropsModal.js';
import { CropDoctorModal } from './CropDoctorModal.js';
import { MandiModal } from './MandiModal.js';
import { WeatherModal } from './WeatherModal.js';

// The 4 Additional High-Value Feature Modals
import { SchemesModal } from './SchemesModal.js';
import { FertilizerCalculatorModal } from './FertilizerCalculatorModal.js';
import { CropCalendarModal } from './CropCalendarModal.js';
import { IrrigationAdvisoryModal } from './IrrigationAdvisoryModal.js';

import heroLandscapeImg from '../../assets/images/hero_farm_landscape_1790652875378.jpg';
import farmerPortraitImg from '../../assets/images/farmer_ramesh_portrait_1790652919656.jpg';

type FeatureKey = 'crops' | 'doctor' | 'mandi' | 'weather' | 'schemes' | 'fertilizer' | 'calendar' | 'irrigation';

export const FarmerDashboard: React.FC = () => {
  const { t, currentLanguage } = useLanguage();
  const { user } = useAuth();
  const { speak, startListening, stopListening, transcript, micState } = useVoice();

  const [questionInput, setQuestionInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [assistantAnswer, setAssistantAnswer] = useState<string | null>(null);

  // Modals state for all 8 presentation features
  const [activeModal, setActiveModal] = useState<FeatureKey | null>(null);

  // Spoken explanations and voice guides for all features in all supported languages
  const featureVoiceGuides: Record<FeatureKey, Record<string, string>> = {
    crops: {
      hi: 'मेरी फसलें: यहाँ अपनी फसलों की वर्तमान अवस्था, क्राउन रूट सिंचाई का सही समय और यूरिया खाद की संतुलित मात्रा देखें।',
      en: 'My Crops feature: Track your active crops stage, scientific crown root irrigation schedule, and balanced fertilizer dosage for maximum harvest yield.',
      mr: 'माझी पिके: येथे आपल्या सक्रिय पिकांची सद्यस्थिती, सिंचनाची वेळ आणि खताचे योग्य प्रमाण तपासा.',
      bn: 'আমার ফসল: আপনার সক্রিয় ফসলের পর্যায়, সেচের সময়সূচি এবং সুষম সার প্রয়োগের সঠিক নির্দেশিকা দেখুন।',
      gu: 'મારા પાક: તમારા પાકની વૃદ્ધિની સ્થિતિ, પિયતનો સમય અને ખાતરના સંતુલિત ડોઝની માહિતી મેળવો.',
      ta: 'எனது பயிர்கள்: உங்கள் பயிர்களின் நிலை, சரியான பாசன அட்டவணை மற்றும் உர பரிந்துரைகளை அறிந்து கொள்ளுங்கள்.',
      te: 'నా పంటలు: మీ పంటల ప్రస్తుత దశ, నీటి పారుదల సమయం మరియు సమతుల్య ఎరువుల మోతాదును తెలుసుకోండి.',
      kn: 'ನನ್ನ ಬೆಳೆಗಳು: ಬೆಳೆಯ ಹಂತ, ವೈಜ್ಞಾನಿಕ ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಸಮತೋಲಿತ ರಸಗೊಬ್ಬರ ಪ್ರಮಾಣವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'എന്റെ വിളകൾ: വിളകളുടെ വളർച്ച ഘട്ടം, ശാസ്ത്രീയ നനയ്ക്കൽ സമയം, വളപ്രയോഗം എന്നിവ പരിശോധിക്കുക.',
      pa: 'ਮੇਰੀਆਂ ਫ਼ਸਲਾਂ: ਆਪਣੀਆਂ ਫ਼ਸਲਾਂ ਦੇ ਵਾਧੇ ਦੇ ਪੜਾਅ, ਸਿੰਚਾਈ ਦਾ ਸਮਾਂ ਅਤੇ ਖਾਦ ਦੀ ਸਹੀ ਮਾਤਰਾ ਦੇਖੋ।',
      or: 'ମୋ ଫସଲ: ଆପଣଙ୍କ ଫସଲର ବୃଦ୍ଧି ପର୍ଯ୍ୟାୟ, ଜଳସେଚନ ସମୟ ଏବଂ ସନ୍ତୁଳିତ ଖତ ପ୍ରୟୋଗ ଯାଞ୍ଚ କରନ୍ତୁ।',
    },
    doctor: {
      hi: 'फसल डॉक्टर: अपनी फसल के रोग, कीट या पीले पत्तों की फोटो अपलोड करें या लक्षण बताएं। कृषिवाणी तुरंत जैविक नीम और सुरक्षित रासायनिक उपाय बताएगी।',
      en: 'Crop Doctor: Upload a leaf photo or speak symptom details. KrishiVaani instantly identifies crop diseases and provides organic neem and safe chemical remedies.',
      mr: 'पीक डॉक्टर: पानावरील रोग किंवा किडीचे छायाचित्र जोडा. कृषीवाणी त्वरित सेंद्रिय आणि सुरक्षित रासायनिक उपाय सुचवेल.',
      bn: 'ফসল ডাক্তার: পাতার ছবি আপলোড করুন বা লক্ষণ বলুন। কৃষিবাণী তৎক্ষণাৎ রোগ নির্ণয় করে জৈব নিম ও নিরাপদ প্রতিকার জানাবে।',
      gu: 'પાક ડૉક્ટર: પાંદડાનો ફોટો અપલોડ કરો અથવા લક્ષણો જણાવો. કૃષિવાણી તાત્કાલિક રોગ ઓળખી યોગ્ય ઉપચાર જણાવશે.',
      ta: 'பயிர் மருத்துவர்: இலையின் புகைப்படத்தை பதிவேற்றவும் அல்லது அறிகுறிகளை கூறவும். இயற்கை வேப்ப எண்ணெய் மற்றும் பூச்சிக்கொல்லி தீர்வுகளை பெறவும்.',
      te: 'పంట డాక్టర్: ఆకు ఫోటో అప్‌లోడ్ చేయండి లేదా లక్షణాలను చెప్పండి. తెగుళ్ళ నివారణకు సేంద్రీయ వేప నూనె మరియు రసాయన మందుల సలహా పొందండి.',
      kn: 'ಬೆಳೆ ವೈದ್ಯ: ಎಲೆಯ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ಅಥವಾ ರೋಗಲಕ್ಷಣಗಳನ್ನು ತಿಳಿಸಿ. ತಕ್ಷಣ ಸಾವಯವ ಬೇವಿನ ಎಣ್ಣೆ ಹಾಗೂ ಪರಿಹಾರಗಳನ್ನು ಪಡೆಯಿರಿ.',
      ml: 'വിള ഡോക്ടർ: ഇലയുടെ ഫോട്ടോ അപ്‌ലോഡ് ചെയ്യുകയോ ലക്ഷണങ്ങൾ പറയുകയോ ചെയ്യുക. കൃഷിവാണി ഉടൻ പരിഹാരങ്ങൾ നൽകും.',
      pa: 'ਫ਼ਸਲ ਡਾਕਟਰ: ਪੱਤਿਆਂ ਦੀ ਫੋਟੋ ਅੱਪਲੋਡ ਕਰੋ ਜਾਂ ਲੱਛਣ ਦੱਸੋ। ਕ੍ਰਿਸ਼ੀਵਾਣੀ ਤੁਰੰਤ ਜੈਵਿਕ ਨਿੰਮ ਅਤੇ ਸਹੀ ਰਸਾਇਣਕ ਇਲਾਜ ਦੱਸੇਗੀ।',
      or: 'ଫସଲ ଡାକ୍ତର: ପତ୍ରର ଫଟୋ ଅପଲୋଡ କରନ୍ତୁ ବା ଲକ୍ଷଣ କୁହନ୍ତୁ। କୃଷିବାଣୀ ତୁରନ୍ତ ଜୈବିକ ନିମ୍ବ ଏବଂ ପ୍ରତିକାର ପ୍ରଦାନ କରିବ।',
    },
    mandi: {
      hi: 'लाइव मंडी भाव: आपके नजदीकी कृषि उपज मंडियों में आज के ताज़ा न्यूनतम, अधिकतम और मॉडल भाव देखें।',
      en: 'Live Mandi Rates: Check real-time APMC market prices for wheat, mustard, cotton, and more in nearby mandis.',
      mr: 'ताजे बाजार भाव: नजीकच्या कृषी उत्पन्न बाजार समित्यांमधील आजचे किमान, कमाल आणि सरासरी दर तपासा.',
      bn: 'লাইভ মাণ্ডি দর: আশেপাশের বাজারে গম, সরিষা, তুলা ইত্যাদির আজকের সর্বনিম্ন, সর্বোচ্চ ও গড় পাইকারি দর দেখুন।',
      gu: 'લાઈવ માર્કેટ ભાવ: નજીકના એપીએમસી માર્કેટ યાર્ડના ઘઉં, રાયડો, કપાસના આજના લાઈવ બજાર ભાવ જુઓ.',
      ta: 'நேரடி சந்தை விலை: அருகிலுள்ள ஒழுங்குமுறை விற்பனைக் கூடங்களில் இன்றைய பயிர் விலைகளை அறிந்து கொள்ளுங்கள்.',
      te: 'లైవ్ మార్కెట్ ధరలు: సమీప మార్కెట్లలో నేటి కనీస, గరిష్ట మరియు సగటు ధరలను సులభంగా తెలుసుకోండి.',
      kn: 'ಲೈವ್ ಎಪಿಎಂಸಿ ದರಗಳು: ಹತ್ತಿರದ ಮಾರುಕಟ್ಟೆಗಳಲ್ಲಿ ಗೋಧಿ, ಸಾಸಿವೆ ಮತ್ತು ಇತರ ಬೆಳೆಗಳ ಇಂದಿನ ಗರಿಷ್ಠ ಹಾಗೂ ಮಾದರಿ ದರಗಳನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'തത്സമയ വിപണി വില: അടുത്തുള്ള കാർഷിക വിപണികളിലെ ഇന്നത്തെ കുറഞ്ഞതും കൂടിയതുമായ വിലവിവരങ്ങൾ കാണുക.',
      pa: 'ਲਾਈਵ ਮੰਡੀ ਭਾਅ: ਨੇੜਲੀਆਂ ਮੰਡੀਆਂ ਵਿੱਚ ਕਣਕ, ਸਰ੍ਹੋਂ, ਨਰਮਾ ਆਦਿ ਦੇ ਅੱਜ ਦੇ ਤਾਜ਼ਾ ਭਾਅ ਦੇਖੋ।',
      or: 'ଲାଇଭ ମଣ୍ଡି ଦର: ନିକଟସ୍ଥ ମଣ୍ଡିରେ ଆଜିର ସର୍ବନିମ୍ନ, ସର୍ବାଧିକ ଏବଂ ହାରାହାରି ଦର ଯାଞ୍ଚ କରନ୍ତୁ।',
    },
    weather: {
      hi: 'मौसम पूर्वानुमान: अगले सात दिनों का मौसम, तापमान, बारिश की संभावना और कीटनाशक छिड़काव की सुरक्षा जांचें।',
      en: 'Weather Advisory: Check 7-day forecast, rain probability, wind speed, and safe pesticide spray window indicators.',
      mr: 'हवामान सल्ला: पुढील सात दिवसांचे हवामान, पाऊस अंदाज आणि औषध फवारणीसाठी योग्य वेळ तपासा.',
      bn: 'আবহাওয়া পরামর্শ: আগামী ৭ দিনের আবহাওয়ার পূর্বাভাস, বৃষ্টির সম্ভাবনা এবং কীটনাশক স্প্রে করার নিরাপদ সময় দেখুন।',
      gu: 'હવામાન સલાહ: આગામી 7 દિવસની હવામાન આગાહી, વરસાદની શક્યતા અને જંતુનાશક દવા છંટકાવની અનુકૂળતા તપાસો.',
      ta: 'வானிலை ஆலோசனை: அடுத்த 7 நாட்களுக்கான வானிலை முன்னறிவிப்பு, மழை வாய்ப்பு மற்றும் மருந்து தெளிக்கும் சாதக நிலையை பார்க்கவும்.',
      te: 'వాతావరణ సలహా: రాబోయే 7 రోజుల వాతావరణం, వర్ష సూచన మరియు మందుల పిచికారీకి అనుకూల సమయం తెలుసుకోండి.',
      kn: 'ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ: ಮುಂದಿನ 7 ದಿನಗಳ ಹವಾಮಾನ, ಮಳೆಯ ಸಂಭವನೀಯತೆ ಮತ್ತು ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆಗೆ ಸುರಕ್ಷಿತ ಸಮಯವನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'കാലാവസ്ഥാ മുന്നറിയിപ്പ്: അടുത്ത 7 ദിവസത്തെ കാലാവസ്ഥ, മഴ സാധ്യത, കീടനാശിനി പ്രയോഗത്തിനുള്ള അനുയോജ്യമായ സമയം എന്നിവ കാണുക.',
      pa: 'ਮੌਸਮ ਸਲਾਹ: ਅਗਲੇ ਸੱਤ ਦਿਨਾਂ ਦਾ ਮੌਸਮ, ਮੀਂਹ ਦੀ ਸੰਭਾਵਨਾ ਅਤੇ ਕੀਟਨਾਸ਼ਕ ਛਿੜਕਾਅ ਲਈ ਢੁਕਵਾਂ ਸਮਾਂ ਦੇਖੋ।',
      or: 'ପାଣିପାଗ ପରାମର୍ଶ: ଆଗାମୀ ୭ ଦିନର ପାଣିପାଗ, ବର୍ଷା ସମ୍ଭାବନା ଏବଂ କୀଟନାଶକ ପ୍ରୟୋଗ ପାଇଁ ଉପଯୁକ୍ତ ସମୟ ଦେਖନ୍ତୁ।',
    },
    schemes: {
      hi: 'सरकारी योजनाएं: प्रधानमंत्री किसान सम्मान निधि के ₹6000, फसल बीमा और सोलर पंप सब्सिडी की पात्रता जांचें।',
      en: 'Government Schemes: Access PM-Kisan Samman Nidhi DBT benefits, PM Fasal Bima crop insurance, and solar pump subsidies.',
      mr: 'शासकीय योजना: पीएम किसान सन्मान निधी, पीक विमा आणि सौर पंप अनुदानाची माहिती मिळवा.',
      bn: 'সরকারি প্রকল্প: পিএম-কিসান সম্মান নিধি, ফসল বিমা এবং সৌর পাম্প ভর্তুকির তথ্য ও যোগ্যতা যাচাই করুন।',
      gu: 'સરકારી યોજનાઓ: પીએમ-કિસાન સન્માન નિધિ, પાક વીમા અને સોલાર પંપ સબસિડીની વિગતો જાણો.',
      ta: 'அரசு திட்டங்கள்: பிஎம்-கிசான் நிதி, பயிர் காப்பீடு மற்றும் சோலார் பம்ப் மானிய விவரங்களை சரிபார்க்கவும்.',
      te: 'ప్రభుత్వ పథకాలు: పీఎం-కిసాన్ సమ్మాన్ నిధి, పంట బీమా మరియు సోలార్ పంపు సబ్సిడీ అర్హతలను పరిశీలించండి.',
      kn: 'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳು: ಪಿಎಂ-ಕಿಸ್ತಾನ್ ಸಮ್ಮಾನ್ ನಿಧಿ, ಬೆಳೆ ವಿಮೆ ಮತ್ತು ಸೋಲಾರ್ ಪಂಪ್ ಸಬ್ಸಿಡಿ ಮಾಹಿತಿ ಪಡೆಯಿರಿ.',
      ml: 'സർക്കാർ പദ്ധതികൾ: പിഎം-കിസാൻ സമ്മാൻ നിധി, വിള ഇൻഷുറൻസ്, സോളാർ പമ്പ് സബ്‌സിഡി വിവരങ്ങൾ അറിയുക.',
      pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ: ਪੀਐਮ-ਕਿਸਾਨ ਸਨਮਾਨ ਨਿਧੀ, ਫ਼ਸਲ ਬੀਮਾ ਅਤੇ ਸੋਲਰ ਪੰਪ ਸਬਸਿਡੀ ਦੀ ਜਾਣਕਾਰੀ ਲਵੋ।',
      or: 'ସରକାରୀ ଯୋଜନା: ପିଏମ-କିସାନ ସମ୍ମାନ ନିଧି, ଫସଲ ବୀମା ଏବଂ ସୌର ପମ୍ପ ସବସିଡି ଯାଞ୍ଚ କରନ୍ତୁ।',
    },
    fertilizer: {
      hi: 'उर्वरक कैलकुलेटर: खेत के रकबे के अनुसार यूरिया, डीएपी, पोटाश और जिंक की वैज्ञानिक गणना करें।',
      en: 'Fertilizer Calculator: Enter your farm acreage to calculate exact bags of Urea, DAP, MOP, and Zinc nutrients.',
      mr: 'खत कॅल्क्युलेटर: शेताच्या क्षेत्रफळानुसार युरिया, डीएपी, पोटॅश आणि झिंकच्या गोण्यांची अचूक गणना करा.',
      bn: 'সার ক্যালকুলেটর: জমির পরিমাণ অনুযায়ী ইউরিয়া, ডিএপি, পটাশ ও জিঙ্কের পরিমাপ গণনা করুন।',
      gu: 'ખાતર કેલ્ક્યુલેટર: જમીનના એકર મુજબ યુરિયા, ડીએપી અને પોટાશની થેલીઓની ચોક્કસ ગણતરી કરો.',
      ta: 'உர கால்குலேட்டர்: நிலத்தின் அளவுக்கு ஏற்ப யூரியா, டிஏபி மற்றும் பொட்டாஷ் அளவை கணக்கிடுங்கள்.',
      te: 'ఎరువుల కాలిక్యులేటర్: మీ భూమి విస్తీర్ణం ఆధారంగా యూరియా, డీఏపీ మరియు పొటాష్ సంచుల లెక్క తెలుసుకోండి.',
      kn: 'ರಸಗೊಬ್ಬರ ಕ್ಯಾಲ್ಕುಲೇಟರ್: ಭೂಮಿಯ ವಿಸ್ತೀರ್ಣಕ್ಕೆ ತಕ್ಕಂತೆ ಯೂರಿಯಾ, ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಚೀಲಗಳ ಲೆಕ್ಕಾಚಾರ ಮಾಡಿ.',
      ml: 'വള കാൽക്കുലേറ്റർ: കൃഷിഭൂമിയുടെ അളവനുസരിച്ച് യൂറിയ, ഡിഎപി എന്നിവയുടെ അളവ് കണക്കാക്കുക.',
      pa: 'ਖਾਦ ਕੈਲਕੁਲੇਟਰ: ਖੇਤ ਦੇ ਰਕਬੇ ਅਨੁਸਾਰ ਯੂਰੀਆ, ਡੀਏਪੀ ਅਤੇ ਪੋਟਾਸ਼ ਦੇ ਥੈਲਿਆਂ ਦਾ ਸਹੀ ਹਿਸਾਬ ਲਗਾਓ।',
      or: 'ଖତ କାଲକୁଲେଟର: ଜମିର ଆକାର ଅନୁଯାୟୀ ୟୁରିଆ, ଡିଏପି ଏବଂ ପୋଟାସର ସଠିକ ପରିମାଣ ଗଣନା କରନ୍ତୁ।',
    },
    calendar: {
      hi: 'फसल कैलेंडर: अंकुरण, कल्ले फूटना, फूल आना, दाना भरना और कटाई तक का दृश्य मार्गदर्शन देखें।',
      en: 'Crop Calendar: Visual interactive timeline tracking germination, CRI tillering, flowering, grain milking, and harvest milestones.',
      mr: 'पीक कॅलेंडर: उगवण, फुटवे, फुले, दाणे भरणे आणि कापणी या सर्व टप्प्यांचे दृश्य मार्गदर्शन पहा.',
      bn: 'ফসল ক্যালেন্ডার: অঙ্কুরোদগম থেকে শুরু করে ফুল আসা, দানা ধরা ও ফসল কাটা পর্যন্ত প্রতিটি ধাপের সময়সূচি দেখুন।',
      gu: 'પાક કેલેન્ડર: અંકુરણ, ફૂટ, ફૂલ આવવા અને લણણી સુધીના દરેક તબક્કાનું વિઝ્યુઅલ માર્ગદર્શન મેળવો.',
      ta: 'பயிர் காலண்டர்: முளைப்பு முதல் அறுவடை வரை அனைத்து வளர்ச்சி நிலைகளின் கால அட்டவணையை பார்க்கவும்.',
      te: 'పంట క్యాలెండర్: మొలకల నుండి కోత వరకు అన్ని దశల కాలక్రమ మార్గదర్శకత్వాన్ని పొందండి.',
      kn: 'ಬೆಳೆ ಕ್ಯಾಲೆಂಡರ್: ಮೊಳಕೆಯೊಡೆಯುವಿಕೆಯಿಂದ ಹಿಡಿದು ಕೊಯ್ಲಿನವರೆಗಿನ ಪ್ರತಿಯೊಂದು ಹಂತದ ವೇಳಾಪಟ್ಟಿಯನ್ನು ನೋಡಿ.',
      ml: 'വിള കലണ്ടർ: മുളയ്ക്കൽ മുതൽ വിളവെടുപ്പ് വരെയുള്ള എല്ലാ വളർച്ചാ ഘട്ടങ്ങളുടെയും വിവരങ്ങൾ കാണുക.',
      pa: 'ਫ਼ਸਲ ਕੈਲੰਡਰ: ਪੁੰਗਰਨ ਤੋਂ ਲੈ ਕੇ ਕਟਾਈ ਤੱਕ ਦੇ ਹਰ ਪੜਾਅ ਦੀ ਸਮਾਂ-ਸਾਰਣੀ ਦੇਖੋ।',
      or: 'ଫସଲ କ୍ୟାଲେଣ୍ଡର: ଗଜା ହେବାଠାରୁ ଅମଳ ପର୍ଯ୍ୟନ୍ତ ସମସ୍ତ ପର୍ଯ୍ୟାୟର ସମୟସାରଣୀ ଦେଖନ୍ତୁ।',
    },
    irrigation: {
      hi: 'स्मार्ट सिंचाई: मिट्टी की नमी, नहर का रोस्टर समय और ड्रिप सिंचाई से पानी बचाने के वैज्ञानिक उपाय देखें।',
      en: 'Smart Irrigation: Monitor root-zone soil moisture levels, canal water rotation rosters, and efficient drip fertigation timings.',
      mr: 'स्मार्ट सिंचन: मातीतील ओलावा, कालवा पाणी पाळी आणि ठिबक सिंचनाचे वैज्ञानिक नियोजन पहा.',
      bn: 'স্মার্ট সেচ: মাটির আর্দ্রতা, ক্যানাল জলের রস্টার ও ড্রিপ সেচের মাধ্যমে জল সাশ্রয়ের বৈজ্ঞানিক উপায় দেখুন।',
      gu: 'સ્માર્ટ પિયત: જમીનનો ભેજ, નહેરનું પાણી રોસ્ટર અને ટપક પિયતથી પાણી બચાવવાની વૈજ્ઞાનિક પદ્ધતિઓ જુઓ.',
      ta: 'நுண்ணீர் பாசனம்: மண் ஈரப்பதம், வாய்க்கால் நீர் அட்டவணை மற்றும் சொட்டு நீர் பாசன முறைகளை அறிந்து கொள்ளவும்.',
      te: 'స్మార్ట్ నీటి పారుదల: నేలలోని తేమ, కాలువ నీటి సరఫరా సమయం మరియు బిందు సేద్యం ద్వారా నీటి పొదుపు చర్యలు తెలుసుకోండి.',
      kn: 'ಸ್ಮಾರ್ಟ್ ನೀರಾವರಿ: ಮಣ್ಣಿನ ತೇವಾಂಶ, ಕಾಲುವೆ ನೀರಿನ ವೇಳಾಪಟ್ಟಿ ಮತ್ತು ಹನಿ ನೀರಾವರಿ ನಿರ್ವಹಣೆಯನ್ನು ಪರಿಶೀಲಿಸಿ.',
      ml: 'സ്മാർട്ട് ജലസേചനം: മണ്ണിന്റെ ഈർപ്പം, കനാൽ ജല വിതരണ സമയം, തുള്ളിനന രീതികൾ എന്നിവ കാണുക.',
      pa: 'ਸਮਾਰਟ ਸਿੰਚਾਈ: ਮਿੱਟੀ ਦੀ ਨਮੀ, ਨਹਿਰੀ ਪਾਣੀ ਦੀ ਵਾਰੀ ਅਤੇ ਤੁਪਕਾ ਸਿੰਚਾਈ ਦੇ ਵਿਗਿਆਨਕ ਤਰੀਕੇ ਦੇਖੋ।',
      or: 'ସ୍ମାର୍ଟ ଜଳସେଚନ: ମାଟିର ଆର୍ଦ୍ରତା, କେନାଲ ପାଣି ସମୟ ଏବଂ ଡ୍ରିପ ଜଳସେଚନର ବୈଜ୍ଞାନିକ ଉପାୟ ଦେଖନ୍ତୁ।',
    },
  };

  const openFeatureWithSpeech = (key: FeatureKey) => {
    const guides = featureVoiceGuides[key];
    const guide = guides[currentLanguage] || (currentLanguage === 'hi' ? guides.hi : guides.en);
    speak(guide);
    setActiveModal(key);
  };

  const handleAskQuestion = async (qText?: string) => {
    const q = qText || questionInput || transcript;
    if (!q || !q.trim()) return;

    setIsAsking(true);
    setAssistantAnswer(null);
    stopListening();

    try {
      const res = await fetch('/api/farming/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, language: currentLanguage }),
      });

      const data = await res.json();
      if (data.answer) {
        setAssistantAnswer(data.answer);
        speak(data.answer);
      }
    } catch {
      setAssistantAnswer(currentLanguage === 'en' ? 'Farming advisory service unavailable. Please retry.' : 'कृषि सलाह उपलब्ध कराने में समस्या हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* 1. Header Profile & Farm Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl p-6 sm:p-7 text-white shadow-xl relative overflow-hidden border border-emerald-600/40 dark:border-stone-800"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.95), rgba(6, 78, 59, 0.88), rgba(28, 25, 23, 0.92)), url(${heroLandscapeImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="flex items-center space-x-4">
            <div className="relative shrink-0">
              <img
                src={farmerPortraitImg}
                alt="Farmer Portrait"
                className="w-16 h-16 sm:w-18 sm:h-18 rounded-2xl object-cover border-2 border-amber-300 shadow-md"
              />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-stone-900 flex items-center justify-center text-white shadow-sm">
                <CheckCircle className="w-3.5 h-3.5" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-amber-400/20 border border-amber-400/40 text-amber-300 text-xs font-bold mb-1 backdrop-blur-xs">
                <Award className="w-3.5 h-3.5" />
                <span>{t('dashboard.verifiedProfile')}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black font-serif tracking-tight">
                {t('dashboard.welcome')}, {user?.name || t('dashboard.kisan')}!
              </h1>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs sm:text-sm text-emerald-200">
                <span className="flex items-center space-x-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user?.district || 'सीहोर'}, {user?.state || 'मध्य प्रदेश'}</span>
                </span>
                <span>•</span>
                <span className="font-semibold text-amber-300">
                  {t('dashboard.primaryCropLabel')}: {user?.primaryCrop || 'गेहूं (Wheat)'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3 self-start md:self-center">
            <a
              href="tel:18001801551"
              className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-700/80 hover:bg-emerald-600 active:scale-95 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer transition-all border border-emerald-500"
              title="1800-180-1551"
            >
              <PhoneCall className="w-4 h-4 text-amber-300" />
              <span>{t('dashboard.kisanCallCenter')}</span>
            </a>
          </div>
        </div>
      </motion.div>

      {/* 2. KrishiVaani Voice AI Interaction Bar */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-lg border-2 border-emerald-300/80 dark:border-stone-800 transition-colors duration-200"
      >
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="shrink-0 flex items-center justify-center">
            <VoiceMicButton
              size="md"
              showLabel={false}
              onMicClick={() => {
                if (micState === 'listening') {
                  stopListening();
                  if (transcript) {
                    handleAskQuestion(transcript);
                  }
                } else {
                  startListening();
                }
              }}
            />
          </div>

          <div className="flex-1 w-full relative">
            <input
              type="text"
              placeholder={t('dashboard.askAssistantPlaceholder')}
              value={questionInput || transcript}
              onChange={(e) => setQuestionInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleAskQuestion();
                }
              }}
              className="w-full pl-4 pr-12 py-3 rounded-2xl bg-stone-50 dark:bg-stone-800/80 border-2 border-stone-200 dark:border-stone-700 focus:border-emerald-600 dark:focus:border-emerald-500 focus:bg-white dark:focus:bg-stone-800 text-sm sm:text-base font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500"
            />
            <button
              type="button"
              onClick={() => handleAskQuestion()}
              disabled={isAsking}
              className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white rounded-xl flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50 shadow-sm"
            >
              {isAsking ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* AI Answer Card */}
        {assistantAnswer && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-400 dark:border-emerald-700 text-stone-900 dark:text-stone-100 flex items-start justify-between space-x-3"
          >
            <div className="flex-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 block mb-1">
                {t('dashboard.advisoryTitle')}:
              </span>
              <p className="text-sm sm:text-base font-medium text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-line">
                {assistantAnswer}
              </p>
            </div>
            <button
              type="button"
              onClick={() => speak(assistantAnswer)}
              className="p-2 rounded-xl bg-emerald-200/80 dark:bg-emerald-900 hover:bg-emerald-300 dark:hover:bg-emerald-800 text-emerald-950 dark:text-emerald-200 transition-colors cursor-pointer shrink-0"
              title={t('readAloud') || 'Listen'}
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </motion.div>

      {/* 3. The 4 Main Pillars (Core Presentation Tiles with Rich Graphical Elements) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.corePillars')}
            </h2>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
              {t('dashboard.corePillarsBadge')}
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline font-medium">
            {t('dashboard.clickToListen')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Tile 1: My Crops */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('crops')}
            className="group relative bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md hover:shadow-xl border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Sprout className="w-8 h-8" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    {t('dashboard.myCropsBadge')}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                🌾 {t('dashboard.myCropsTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 font-medium leading-relaxed">
                {t('dashboard.myCropsDesc')}
              </p>

              {/* Graphical Metric Chip */}
              <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                <span className="text-emerald-600 font-black">{t('dashboard.criStageChip')}</span>
                <span>•</span>
                <span className="text-sky-600">{t('dashboard.irrigationAlertChip')}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center space-x-1.5">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>{t('dashboard.listenAndOpen')}</span>
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Tile 2: Crop Doctor */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('doctor')}
            className="group relative bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md hover:shadow-xl border-2 border-stone-200 dark:border-stone-800 hover:border-amber-500 dark:hover:border-amber-500 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-600 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-8 h-8" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-700">
                    {t('dashboard.cropDoctorBadge')}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                🔬 {t('dashboard.cropDoctorTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 font-medium leading-relaxed">
                {t('dashboard.cropDoctorDesc')}
              </p>

              {/* Graphical Metric Chip */}
              <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                <span className="text-amber-600 font-black">{t('dashboard.aiAccuracyChip')}</span>
                <span>•</span>
                <span className="text-emerald-600">{t('dashboard.organicNeemChip')}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span className="flex items-center space-x-1.5">
                <Headphones className="w-4 h-4 text-amber-600" />
                <span>{t('dashboard.listenAndOpen')}</span>
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Tile 3: Live Mandi Rates */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('mandi')}
            className="group relative bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md hover:shadow-xl border-2 border-stone-200 dark:border-stone-800 hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-800 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <Store className="w-8 h-8" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold border border-emerald-300 dark:border-emerald-700">
                    {t('dashboard.mandiBadge')}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500 animate-ping" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                💰 {t('dashboard.mandiTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 font-medium leading-relaxed">
                {t('dashboard.mandiDesc')}
              </p>

              {/* Graphical Metric Chip */}
              <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                <span className="text-emerald-700 font-black">{t('dashboard.wheatRateChip')}</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-600 font-semibold">{t('dashboard.wheatTrendChip')}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-emerald-700 dark:text-emerald-400">
              <span className="flex items-center space-x-1.5">
                <Headphones className="w-4 h-4 text-emerald-600" />
                <span>{t('dashboard.listenAndOpen')}</span>
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Tile 4: Weather & Spray Advisory */}
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('weather')}
            className="group relative bg-white dark:bg-stone-900 rounded-3xl p-6 shadow-md hover:shadow-xl border-2 border-stone-200 dark:border-stone-800 hover:border-sky-500 dark:hover:border-sky-500 cursor-pointer transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-700 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                  <CloudSun className="w-8 h-8" />
                </div>
                <div className="flex items-center space-x-1.5">
                  <span className="px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 text-xs font-bold border border-sky-300 dark:border-sky-700">
                    {t('dashboard.weatherBadge')}
                  </span>
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-ping" />
                </div>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                🌦️ {t('dashboard.weatherTitle')}
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-2 font-medium leading-relaxed">
                {t('dashboard.weatherDesc')}
              </p>

              {/* Graphical Metric Chip */}
              <div className="mt-3.5 inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-800 text-xs font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700">
                <span className="text-sky-700 font-black">{t('dashboard.tempSunnyChip')}</span>
                <span>•</span>
                <span className="text-emerald-600">{t('dashboard.spraySafeChip')}</span>
              </div>
            </div>

            <div className="mt-5 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
              <span className="flex items-center space-x-1.5">
                <Headphones className="w-4 h-4 text-sky-600" />
                <span>{t('dashboard.listenAndOpen')}</span>
              </span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 4. Additional High-Value Feature Tiles (Positioned directly under the 4 main cards) */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-black text-stone-900 dark:text-stone-100 font-serif">
              {t('dashboard.additionalFeatures')}
            </h2>
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-xs font-bold border border-amber-300 dark:border-amber-800">
              {t('dashboard.additionalFeaturesBadge')}
            </span>
          </div>
          <span className="text-xs text-stone-500 dark:text-stone-400 hidden sm:inline font-medium">
            {t('dashboard.clickToListen')}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sub-Card 1: Government Schemes & Subsidies */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('schemes')}
            className="group bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm hover:shadow-lg border-2 border-stone-200 dark:border-stone-800 hover:border-amber-400 dark:hover:border-amber-600 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 flex items-center justify-center shadow-sm">
                  <Landmark className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                  {t('dashboard.schemesBadge')}
                </span>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                🏛️ {t('dashboard.schemesTitle')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-medium line-clamp-3">
                {t('dashboard.schemesDesc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
              <span>{t('dashboard.listenAndOpen')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Sub-Card 2: Fertilizer Dosage Calculator */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('fertilizer')}
            className="group bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm hover:shadow-lg border-2 border-stone-200 dark:border-stone-800 hover:border-teal-400 dark:hover:border-teal-600 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-400 flex items-center justify-center shadow-sm">
                  <FlaskConical className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-700">
                  {t('dashboard.fertilizerBadge')}
                </span>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                🧪 {t('dashboard.fertilizerTitle')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-medium line-clamp-3">
                {t('dashboard.fertilizerDesc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-teal-700 dark:text-teal-400">
              <span>{t('dashboard.listenAndOpen')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Sub-Card 3: Crop Growth Stages & Sowing Planner */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('calendar')}
            className="group bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm hover:shadow-lg border-2 border-stone-200 dark:border-stone-800 hover:border-indigo-400 dark:hover:border-indigo-600 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-400 flex items-center justify-center shadow-sm">
                  <Calendar className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700">
                  {t('dashboard.calendarBadge')}
                </span>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors">
                🗓️ {t('dashboard.calendarTitle')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-medium line-clamp-3">
                {t('dashboard.calendarDesc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-indigo-700 dark:text-indigo-400">
              <span>{t('dashboard.listenAndOpen')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>

          {/* Sub-Card 4: Smart Soil Moisture & Canal Water Schedule */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => openFeatureWithSpeech('irrigation')}
            className="group bg-white dark:bg-stone-900 rounded-3xl p-5 shadow-sm hover:shadow-lg border-2 border-stone-200 dark:border-stone-800 hover:border-sky-400 dark:hover:border-sky-600 cursor-pointer transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-2xl bg-sky-100 dark:bg-sky-950/80 text-sky-700 dark:text-sky-400 flex items-center justify-center shadow-sm">
                  <Droplets className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 border border-sky-300 dark:border-sky-700">
                  {t('dashboard.irrigationBadge')}
                </span>
              </div>
              <h3 className="text-base font-black text-stone-900 dark:text-stone-100 font-serif group-hover:text-sky-700 dark:group-hover:text-sky-400 transition-colors">
                💧 {t('dashboard.irrigationTitle')}
              </h3>
              <p className="text-xs text-stone-600 dark:text-stone-400 mt-1.5 leading-relaxed font-medium line-clamp-3">
                {t('dashboard.irrigationDesc')}
              </p>
            </div>
            <div className="mt-4 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-xs font-bold text-sky-700 dark:text-sky-400">
              <span>{t('dashboard.listenAndOpen')}</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.div>
        </div>
      </div>

      {/* 5. All 8 Interactive Presentation Modals */}
      <MyCropsModal isOpen={activeModal === 'crops'} onClose={() => setActiveModal(null)} />
      <CropDoctorModal isOpen={activeModal === 'doctor'} onClose={() => setActiveModal(null)} />
      <MandiModal isOpen={activeModal === 'mandi'} onClose={() => setActiveModal(null)} />
      <WeatherModal isOpen={activeModal === 'weather'} onClose={() => setActiveModal(null)} />
      <SchemesModal isOpen={activeModal === 'schemes'} onClose={() => setActiveModal(null)} />
      <FertilizerCalculatorModal isOpen={activeModal === 'fertilizer'} onClose={() => setActiveModal(null)} />
      <CropCalendarModal isOpen={activeModal === 'calendar'} onClose={() => setActiveModal(null)} />
      <IrrigationAdvisoryModal isOpen={activeModal === 'irrigation'} onClose={() => setActiveModal(null)} />
    </div>
  );
};
