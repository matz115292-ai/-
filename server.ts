import express from 'express';
import path from 'path';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return aiClient;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// API endpoint to parse WhatsApp text from clients using Gemini AI
app.post('/api/parse-client', async (req, res) => {
  try {
    const { message } = req.body;
    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ success: false, error: 'نص الرسالة مطلوب' });
      return;
    }

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback message indicating local fallback should be used
      res.json({
        success: false,
        reason: 'no_api_key',
        message: 'مفتاح Gemini غير محدد، سيتم الاعتماد على المحلل المحلي الفوري',
      });
      return;
    }

    const systemInstruction = `أنت خبير تحليل ومعالجة رسائل الواتساب العقارية السعودية لشركة عقارية كبرى في جدة والمملكة.
مهمتك استخراج البيانات المنظمة من نص رسالة الواتساب بدقة متناهية باللغة العربية وتحويلها إلى كائن JSON صالح.
القواعد:
1. استخرج اسم العميل بدقة (مثال: "أبو فهد", "عبدالله الدوسري", "سلطان الشريف").
2. استخرج رقم الجوال بصيغة موحدة (مثلاً: +9665xxxxxxxx أو 05xxxxxxxx).
3. حدد الغرض: "sale" (شراء/بيع/تمليك) أو "rent" (إيجار/استئجار/سنوي/شهري) أو "any".
4. حدد دور العميل: "buyer" (مشتري) أو "tenant" (مستأجر) أو "seller" (بائع/مالك) أو "landlord" (مؤجر) أو "investor" (مستثمر).
5. أنواع العقارات المفضلة مصفوفة من: "villa", "apartment", "land", "floor", "building", "townhouse", "resthouse", "office", "shop", "warehouse".
6. المدن المفضلة (افتراضياً ["جدة"] إن لم يحدد مدينة أخرى).
7. أسماء الأحياء المفضلة المذكورة في النص (مثال: ["حي أبحر الشمالية", "حي الشاطئ"]).
8. مبالغ الميزانية بالريال السعودي:
   - "2.5 مليون" تعني 2500000
   - "مليونين" تعني 2000000
   - "500 الف" تعني 500000
   - "45 ألف" تعني 45000
   - استخرج budgetMin و budgetMax. إذا ذُكر رقم واحد فقط (مثل "حد أقصى 3 مليون" أو "بحدود 3 مليون") اجعل budgetMax هو 3000000 و budgetMin هو 0.
9. ملاحظات تلخيصية تحتوي على أي تفاصيل إضافية طلبها العميل (مثل: مسبح، مصعد، دورين، عوائل، كاش، إلخ).`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `قم بتحليل رسالة الواتساب التالية واستخرج بيانات العميل العقاري:
"""
${message}
"""`,
      config: {
        systemInstruction,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'اسم العميل' },
            phone: { type: Type.STRING, description: 'رقم الجوال' },
            email: { type: Type.STRING, description: 'البريد الإلكتروني إن وجد' },
            role: {
              type: Type.STRING,
              enum: ['buyer', 'tenant', 'seller', 'landlord', 'investor'],
              description: 'تصنيف العميل',
            },
            preferredPurpose: {
              type: Type.STRING,
              enum: ['sale', 'rent', 'any'],
              description: 'الغرض (شراء أو إيجار)',
            },
            preferredTypes: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'أنواع العقار المطلوبة',
            },
            preferredCities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'المدن المفضلة',
            },
            preferredNeighborhoods: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'الأحياء المفضلة',
            },
            budgetMin: { type: Type.NUMBER, description: 'الحد الأدنى للميزانية بالريال' },
            budgetMax: { type: Type.NUMBER, description: 'الحد الأقصى للميزانية بالريال' },
            notes: { type: Type.STRING, description: 'ملاحظات تفصيلية' },
          },
          required: ['name', 'phone', 'preferredPurpose', 'role'],
        },
      },
    });

    const outputText = response.text?.trim();
    if (!outputText) {
      res.json({ success: false, reason: 'empty_response' });
      return;
    }

    const parsedData = JSON.parse(outputText);

    res.json({
      success: true,
      parsed: parsedData,
    });
  } catch (error: any) {
    console.error('Gemini parse client error:', error);
    res.json({
      success: false,
      error: error?.message || 'فشل استخراج البيانات',
    });
  }
});

// Setup Vite middleware in dev mode, static files in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Barq Real Estate Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
