import { ClientRole, PropertyType } from '../types';
import { DEFAULT_CITY, SAUDI_CITIES, JEDDAH_NEIGHBORHOODS } from '../data/locations';

export interface ParsedClientData {
  name: string;
  phone: string;
  email?: string;
  role: ClientRole;
  preferredPurpose: 'sale' | 'rent' | 'any';
  preferredTypes: PropertyType[];
  preferredCities: string[];
  preferredNeighborhoods: string[];
  budgetMin: number | '';
  budgetMax: number | '';
  notes: string;
  extractedKeywords: string[];
  confidence: 'high' | 'medium' | 'low';
}

/**
 * تحويل الأرقام العربية المشرقية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية (0123456789)
 */
export function normalizeArabicNumbers(str: string): string {
  const arabicNumerals = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = str;
  for (let i = 0; i < 10; i++) {
    res = res.replaceAll(arabicNumerals[i], String(i));
  }
  return res;
}

/**
 * تحليل مبالغ الميزانية المكتوبة بالنص العربي (مثال: 2.5 مليون، مليونين، 45 ألف، 500 الف)
 */
export function extractBudgetsFromText(rawText: string): { min: number | ''; max: number | '' } {
  const text = normalizeArabicNumbers(rawText);

  // 1. البحث عن صيغ الملايين والألوف
  // أمثلة: 2.5 مليون إلى 3 مليون، مليونين، 500 الف
  const numbersFound: number[] = [];

  // مليون ونصف / مليون ونص
  if (/مليون\s+(?:و|\+)\s*(?:نصف|نص)/i.test(text)) {
    numbersFound.push(1500000);
  }
  // مليونين / مليونان
  if (/(?:مليونين|مليونان)/i.test(text)) {
    numbersFound.push(2000000);
  }
  // مليون واحد / كلمة مليون مفردة بدون رقم قبلها
  if (/(?:^|\s)مليون(?:\s|ريال|$)/i.test(text) && !/(?:مليونين|مليونان)/i.test(text)) {
    numbersFound.push(1000000);
  }

  // أرقام مع ملايين: مثال "2.5 مليون"، "3 مليون"، "10 ملايين"
  const millionRegex = /(\d+(?:\.\d+)?)\s*(?:مليون|ملايين)/gi;
  let match: RegExpExecArray | null;
  while ((match = millionRegex.exec(text)) !== null) {
    const val = parseFloat(match[1]) * 1000000;
    if (!isNaN(val) && !numbersFound.includes(val)) {
      numbersFound.push(val);
    }
  }

  // نصف مليون / نص مليون
  if (/(?:نصف|نص)\s*مليون/i.test(text)) {
    numbersFound.push(500000);
  }

  // أرقام مع آلاف: مثال "45 ألف"، "500 الف"
  const thousandRegex = /(\d+(?:\.\d+)?)\s*(?:الف|آلاف|الاف|ألف)/gi;
  while ((match = thousandRegex.exec(text)) !== null) {
    const val = parseFloat(match[1]) * 1000;
    if (!isNaN(val) && !numbersFound.includes(val)) {
      numbersFound.push(val);
    }
  }

  // أرقام صريحة مكتوبة بالريال: مثال "2,500,000", "2500000", "45000"
  const explicitNumberRegex = /(?:ميزانية|حد|بحدود|بسعر|قيمة|مبلغ)?\s*[:\s]*([1-9]\d{0,2}(?:,\d{3})+|[1-9]\d{3,8})\s*(?:ريال|رس|كاش)?/gi;
  while ((match = explicitNumberRegex.exec(text)) !== null) {
    const cleanNum = match[1].replace(/,/g, '');
    const val = parseInt(cleanNum, 10);
    // نتأكد أن الرقم ليس رقم جوال (أرقام الجوال تبدأ بـ 05 أو 966)
    if (!isNaN(val) && val >= 5000 && !/^0?5\d{8}$/.test(cleanNum) && !/^9665\d{8}$/.test(cleanNum)) {
      if (!numbersFound.includes(val)) {
        numbersFound.push(val);
      }
    }
  }

  if (numbersFound.length === 0) {
    return { min: '', max: '' };
  }

  // ترتيب الأرقام تصاعدياً
  numbersFound.sort((a, b) => a - b);

  if (numbersFound.length === 1) {
    // رقم واحد: نعتبره حداً أقصى للميزانية
    return { min: '', max: numbersFound[0] };
  } else {
    // رقمين أو أكثر: الأدنى كحد أدنى، والأعلى كحد أقصى
    return { min: numbersFound[0], max: numbersFound[numbersFound.length - 1] };
  }
}

/**
 * استخراج رقم الجوال السعودي
 */
export function extractPhoneNumber(rawText: string): string {
  const text = normalizeArabicNumbers(rawText);

  // أنماط الجوالات السعودية: +9665xxxxxxxx أو 009665xxxxxxxx أو 05xxxxxxxx أو 5xxxxxxxx
  const phonePatterns = [
    /(?:\+966|00966)[\s-]?5[0-9]{8}\b/,
    /\b05[0-9]{8}\b/,
    /\b5[0-9]{8}\b/,
    /\b05[0-9]{2}[\s-]?[0-9]{3}[\s-]?[0-9]{3}\b/,
  ];

  for (const regex of phonePatterns) {
    const match = text.match(regex);
    if (match) {
      let cleaned = match[0].replace(/[\s-]/g, '');
      if (cleaned.startsWith('00966')) {
        cleaned = '+' + cleaned.slice(2);
      } else if (cleaned.startsWith('05')) {
        cleaned = '+966' + cleaned.slice(1);
      } else if (cleaned.startsWith('5')) {
        cleaned = '+966' + cleaned;
      }
      return cleaned;
    }
  }
  return '';
}

/**
 * استخراج اسم العميل
 */
export function extractClientName(text: string): string {
  const lines = text.split('\n');

  // 1. فحص الأسطر الصريحة مثل: الاسم: محمد الغامدي أو العميل: أبو فهد
  for (const line of lines) {
    const directMatch = line.match(/(?:الاسم|اسم العميل|العميل|زبون|مرسل)[:\s-]+([^\n,،\.\t]+)/i);
    if (directMatch && directMatch[1].trim()) {
      const clean = directMatch[1].trim().replace(/[•\-\*]/g, '');
      if (clean.length >= 2) return clean;
    }
  }

  // 2. البحث عن "أنا ..." أو "معك ..."
  const introMatch = text.match(/(?:أنا|انا|معك|معاكم|اخوكم|أخوكم)\s+((?:[أ-يa-zA-Z]+\s+){1,4}[أ-يa-zA-Z]+)(?:[،,\.\s]+(?:جوالي|رقمي|ابحث|أبحث|ادور|أدور|طلب|عندي|05|\+966)|$)/i);
  if (introMatch && introMatch[1].trim()) {
    const clean = introMatch[1].trim();
    // إزالة الكلمات الزائدة
    const sanitized = clean.replace(/^(?:المهندس|م\.|الشيخ|د\.|الأخ|الاخ|ابو|أبو)\s+/i, '');
    if (sanitized.length >= 2) return clean;
  }

  // 3. صيغ التحية: "معك أبو فهد" أو "أنا عبدالله الدوسري"
  const abuMatch = text.match(/(?:معك|أنا|انا)\s+(أبو\s+[^\s,،\.]+)/i);
  if (abuMatch && abuMatch[1].trim()) {
    return abuMatch[1].trim();
  }

  return '';
}

/**
 * استخراج نوع العقار المطلوب
 */
export function extractPropertyTypes(text: string): PropertyType[] {
  const types: PropertyType[] = [];
  const lower = text.toLowerCase();

  const addUnique = (t: PropertyType) => {
    if (!types.includes(t)) types.push(t);
  };

  if (/(?:فيلا|فلل|فله|دوبلكس|دوبلكسات|تاون\s*هاوس|تاونهاوس)/i.test(lower)) addUnique('villa');
  if (/(?:شقة|شقق|شقه|استوديو|دور|أدوار|ادوار)/i.test(lower)) addUnique('apartment');
  if (/(?:أرض|ارض|اراضي|أراضي|قطعة أرض)/i.test(lower)) addUnique('land');
  if (/(?:عمارة|عمائر|عماره|مجمع سكني)/i.test(lower)) addUnique('building');
  if (/(?:مكتب|مكاتب|مقر إداري)/i.test(lower)) addUnique('office');
  if (/(?:محل|محلات|معرض|صالات تجارية|مستودع|مستودعات|هنجر|تجاري|استراحة|شاليه)/i.test(lower)) addUnique('commercial');

  return types.length > 0 ? types : ['villa'];
}

/**
 * استخراج الغرض (شراء أو إيجار)
 */
export function extractPurposeAndRole(text: string): { purpose: 'sale' | 'rent' | 'any'; role: ClientRole } {
  const isRent = /(?:إيجار|ايجار|للايجار|للإيجار|مستأجر|استئجار|سنوي|شهري|عوائل|عزاب)/i.test(text);
  const isSale = /(?:شراء|للشراء|شاري|شراء كاش|تمليك|للبيع|تملك)/i.test(text);
  const isInvestor = /(?:استثمار|مستثمر|استثماري|عائد|دخل)/i.test(text);
  const isOwner = /(?:عندي عقار|أملك|املك|صاحب عقار|بايع|أرغب ببيع|اعرض عقاري)/i.test(text);

  if (isOwner) {
    return { purpose: 'sale', role: 'seller' };
  }
  if (isInvestor) {
    return { purpose: isRent ? 'rent' : 'sale', role: 'investor' };
  }
  if (isRent && !isSale) {
    return { purpose: 'rent', role: 'tenant' };
  }
  // الافتراضي في طلبات الواتساب غالباً مشترين
  return { purpose: 'sale', role: 'buyer' };
}

/**
 * استخراج المدينة والأحياء
 */
export function extractLocations(text: string): { cities: string[]; neighborhoods: string[] } {
  const foundCities: string[] = [];
  const foundNeighborhoods: string[] = [];

  // 1. فحص المدن
  for (const city of SAUDI_CITIES) {
    const cityRegex = new RegExp(`(?:مدينة|في|ب|بمدينة)?\\s*${city}`, 'i');
    if (cityRegex.test(text)) {
      if (!foundCities.includes(city)) {
        foundCities.push(city);
      }
    }
  }

  // إذا لم يذكر مدينة صريحة، نعتمد المدينة الافتراضية المحددة بالنظام (جدة)
  const finalCities = foundCities.length > 0 ? foundCities : [DEFAULT_CITY];

  // 2. فحص أحياء جدة والأحياء المعروفة
  for (const nh of JEDDAH_NEIGHBORHOODS) {
    // إزالة كلمة "حي" للبحث عن الاسم النظيف
    const cleanNhName = nh.replace(/^حي\s+/, '');
    const nhRegex = new RegExp(`(?:حي)?\\s*${cleanNhName}`, 'i');
    if (nhRegex.test(text)) {
      const fullLabel = nh.startsWith('حي ') ? nh : `حي ${nh}`;
      if (!foundNeighborhoods.includes(fullLabel)) {
        foundNeighborhoods.push(fullLabel);
      }
    }
  }

  // 3. البحث بالنمط العام: "حي [الاسم]"
  const generalNhRegex = /حي\s+([أ-يa-zA-Z0-9]+(?:\s+[أ-يa-zA-Z0-9]+)?)/gi;
  let nhMatch: RegExpExecArray | null;
  while ((nhMatch = generalNhRegex.exec(text)) !== null) {
    const candidate = `حي ${nhMatch[1].trim()}`;
    if (!foundNeighborhoods.includes(candidate)) {
      foundNeighborhoods.push(candidate);
    }
  }

  return {
    cities: finalCities,
    neighborhoods: foundNeighborhoods,
  };
}

/**
 * استخراج البريد الإلكتروني إذا توفر
 */
export function extractEmail(text: string): string | undefined {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  return emailMatch ? emailMatch[0] : undefined;
}

/**
 * المحرك الرئيسي للتحليل الفوري الذكي لنصوص رسائل الواتساب
 */
export function parseWhatsAppClientTextLocally(rawText: string): ParsedClientData {
  const text = rawText.trim();
  const keywords: string[] = [];

  const name = extractClientName(text);
  if (name) keywords.push(`الاسم: ${name}`);

  const phone = extractPhoneNumber(text);
  if (phone) keywords.push(`الجوال: ${phone}`);

  const email = extractEmail(text);
  if (email) keywords.push(`الإيميل: ${email}`);

  const { purpose, role } = extractPurposeAndRole(text);
  keywords.push(purpose === 'rent' ? 'الغرض: إيجار' : 'الغرض: شراء');

  const preferredTypes = extractPropertyTypes(text);
  keywords.push(`النوع: ${preferredTypes.join('، ')}`);

  const { cities, neighborhoods } = extractLocations(text);
  keywords.push(`المدينة: ${cities.join('، ')}`);
  if (neighborhoods.length > 0) {
    keywords.push(`الأحياء: ${neighborhoods.join('، ')}`);
  }

  const { min: budgetMin, max: budgetMax } = extractBudgetsFromText(text);
  if (budgetMax !== '') {
    keywords.push(`الميزانية: ${budgetMax.toLocaleString('ar-SA')} ر.س`);
  }

  const confidence = (name && phone && budgetMax !== '') 
    ? 'high' 
    : (phone || budgetMax !== '' || neighborhoods.length > 0) 
    ? 'medium' 
    : 'low';

  return {
    name: name || '',
    phone: phone || '',
    email,
    role,
    preferredPurpose: purpose,
    preferredTypes,
    preferredCities: cities,
    preferredNeighborhoods: neighborhoods,
    budgetMin,
    budgetMax,
    notes: `تم استخراج هذا الطلب آلياً عبر الذكاء الاصطناعي من رسالة الواتساب التالية:\n"${text}"`,
    extractedKeywords: keywords,
    confidence,
  };
}

/**
 * استدعاء الخادم للتحليل الذكي المتطور عبر Gemini (مع العودة للتحليل المحلي الفوري كاحتياط موثوق)
 */
export async function parseWhatsAppClientWithAI(whatsappText: string): Promise<ParsedClientData> {
  const localResult = parseWhatsAppClientTextLocally(whatsappText);

  try {
    const response = await fetch('/api/parse-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: whatsappText }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && data.success && data.parsed) {
        // ندمج النتيجة ونفضل النتيجة الأكثر دقة
        return {
          name: data.parsed.name || localResult.name,
          phone: data.parsed.phone || localResult.phone,
          email: data.parsed.email || localResult.email,
          role: data.parsed.role || localResult.role,
          preferredPurpose: data.parsed.preferredPurpose || localResult.preferredPurpose,
          preferredTypes: (data.parsed.preferredTypes && data.parsed.preferredTypes.length > 0) 
            ? data.parsed.preferredTypes 
            : localResult.preferredTypes,
          preferredCities: (data.parsed.preferredCities && data.parsed.preferredCities.length > 0)
            ? data.parsed.preferredCities
            : localResult.preferredCities,
          preferredNeighborhoods: (data.parsed.preferredNeighborhoods && data.parsed.preferredNeighborhoods.length > 0)
            ? data.parsed.preferredNeighborhoods
            : localResult.preferredNeighborhoods,
          budgetMin: data.parsed.budgetMin !== undefined && data.parsed.budgetMin !== '' 
            ? Number(data.parsed.budgetMin) 
            : localResult.budgetMin,
          budgetMax: data.parsed.budgetMax !== undefined && data.parsed.budgetMax !== '' 
            ? Number(data.parsed.budgetMax) 
            : localResult.budgetMax,
          notes: data.parsed.notes || localResult.notes,
          extractedKeywords: data.parsed.extractedKeywords || localResult.extractedKeywords,
          confidence: 'high',
        };
      }
    }
  } catch (err) {
    console.warn('Backend AI parsing fallback to local parser:', err);
  }

  return localResult;
}
