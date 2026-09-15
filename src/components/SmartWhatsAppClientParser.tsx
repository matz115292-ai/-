import React, { useState } from 'react';
import { Sparkles, MessageSquare, Clipboard, CheckCircle2, RotateCcw, Zap, Bot, ArrowDown } from 'lucide-react';
import { parseWhatsAppClientWithAI, ParsedClientData } from '../utils/whatsappParser';

interface SmartWhatsAppClientParserProps {
  onParsed: (data: ParsedClientData) => void;
  className?: string;
}

const SAMPLE_WHATSAPP_MESSAGES = [
  `السلام عليكم ورحمة الله، أنا أبو فهد، رقم جوالي 0551234567.
أبحث عن فيلا للشراء بجدة في حي أبحر الشمالية أو حي الشاطئ أو المرجان،
الميزانية بحدود 2.5 مليون إلى 3 مليون ريال كاش، يفضل دورين مع مسبح ومصعد. شكراً لكم.`,
  `مساك الله بالخير اخوي
معك سلطان الشريف
جوالي: 0509876543
ابغى شقة فاخرة للإيجار السنوي عوائل بجدة حي الروضة أو السلامة
الحد الأقصى للميزانية 50 ألف ريال سنوي
ضروري 4 غرف وصالة وموقف خاص.`,
  `العميل: د. خالد السلمي
الجوال: 0541122334
طلب: شراء دور أرضي مستقل أو تاون هاوس في جدة
الأحياء المفضلة: حي الصواري، حي الياقوت، أبحر
الميزانية: مليون و600 ألف ريال
جاهز للمعاينة بأي وقت`,
];

export const SmartWhatsAppClientParser: React.FC<SmartWhatsAppClientParserProps> = ({
  onParsed,
  className = '',
}) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastExtracted, setLastExtracted] = useState<ParsedClientData | null>(null);
  const [isSuccessNotification, setIsSuccessNotification] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const handleParse = async () => {
    if (!inputText.trim()) {
      return;
    }

    setIsLoading(true);
    setIsSuccessNotification(false);

    try {
      const parsed = await parseWhatsAppClientWithAI(inputText);
      setLastExtracted(parsed);
      onParsed(parsed);
      setIsSuccessNotification(true);
      setTimeout(() => {
        setIsSuccessNotification(false);
      }, 5000);
    } catch (error) {
      console.error('Error parsing WhatsApp text:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
        }
      }
    } catch (e) {
      console.warn('Clipboard read permission denied or unavailable', e);
    }
  };

  const handleLoadSample = (index = 0) => {
    setInputText(SAMPLE_WHATSAPP_MESSAGES[index % SAMPLE_WHATSAPP_MESSAGES.length]);
  };

  return (
    <div className={`rounded-xl border border-emerald-500/30 dark:border-emerald-500/30 bg-gradient-to-br from-emerald-50/70 via-teal-50/40 to-slate-50 dark:from-emerald-950/30 dark:via-slate-900/60 dark:to-slate-900 p-3.5 sm:p-4 text-right transition-all shadow-xs ${className}`}>
      {/* Header with Title and Toggle */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-emerald-200/60 dark:border-emerald-800/40">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
              <span>المساعد الذكي: استخراج بيانات العميل من محادثة الواتساب</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
                <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
                <span>ذكاء اصطناعي فوري</span>
              </span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              الصق نص محادثة أو رسالة العميل بالواتساب لملء كافة الحقول أدناه بضغطة زر
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium px-2 py-1 rounded hover:bg-emerald-100/60 dark:hover:bg-emerald-900/30 transition-colors"
        >
          {isExpanded ? 'طي الخانة' : 'توسيع الخانة'}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-2.5">
          {/* Text Area */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="انسخ رسالة العميل من تطبيق الواتساب والصقها هنا...&#10;مثال: السلام عليكم، أنا أبو فهد جوالي 0551234567 أبحث عن فيلا للشراء بجدة في حي أبحر الشمالية، الميزانية بحدود 2.5 مليون ريال كاش"
              rows={3}
              className="w-full text-xs p-3 rounded-lg border border-emerald-300/80 dark:border-emerald-700/60 bg-white/95 dark:bg-slate-850 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 outline-hidden transition-all shadow-2xs resize-none"
            />

            {inputText && (
              <button
                type="button"
                onClick={() => {
                  setInputText('');
                  setLastExtracted(null);
                }}
                className="absolute left-2.5 top-2.5 p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-xs"
                title="مسح النص"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Helper Actions & Trigger Button */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-2xs"
                title="لصق المحتوى المنسوخ من الحافظة"
              >
                <Clipboard className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>لصق من الحافظة</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample(0)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                title="تعبئة نص واتساب تجريبي لشراء فيلا"
              >
                <span>تجربة (فيلا شراء)</span>
              </button>

              <button
                type="button"
                onClick={() => handleLoadSample(1)}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[11px] font-medium bg-emerald-100/60 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800/40 transition-colors"
                title="تعبئة نص واتساب تجريبي لإيجار شقة"
              >
                <span>تجربة (شقة إيجار)</span>
              </button>
            </div>

            <button
              type="button"
              disabled={isLoading || !inputText.trim()}
              onClick={handleParse}
              className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold text-white transition-all shadow-xs cursor-pointer ${
                !inputText.trim()
                  ? 'bg-slate-400 dark:bg-slate-700 opacity-60 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 active:scale-98 ring-2 ring-emerald-500/20'
              }`}
            >
              {isLoading ? (
                <>
                  <Bot className="w-4 h-4 animate-spin text-white" />
                  <span>جاري تحليل النص بالذكاء الاصطناعي...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>تحليل الرسالة وتعبئة الحقول تلقائياً</span>
                  <ArrowDown className="w-3.5 h-3.5 opacity-80" />
                </>
              )}
            </button>
          </div>

          {/* Success Feedback & Summary of Extracted Data */}
          {lastExtracted && (
            <div className="p-3 rounded-lg bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800/60 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>تم التعرف على البيانات وتعبئة النموذج بنجاح ✨</span>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {lastExtracted.name && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 font-medium">
                    👤 {lastExtracted.name}
                  </span>
                )}
                {lastExtracted.phone && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 font-mono font-medium" dir="ltr">
                    📞 {lastExtracted.phone}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 font-medium">
                  {lastExtracted.preferredPurpose === 'rent' ? '🔑 إيجار' : '🏡 شراء'}
                </span>
                {lastExtracted.budgetMax !== '' && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 font-bold text-emerald-700 dark:text-emerald-300">
                    💰 {Number(lastExtracted.budgetMax).toLocaleString('ar-SA')} ر.س
                  </span>
                )}
                {lastExtracted.preferredNeighborhoods && lastExtracted.preferredNeighborhoods.length > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-emerald-200 dark:border-emerald-800 font-medium">
                    📍 {lastExtracted.preferredNeighborhoods.join('، ')}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
