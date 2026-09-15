import React, { useState, useEffect } from 'react';
import { Sparkles, TrendingUp, RefreshCw, Trophy, Target, ChevronDown, ChevronUp } from 'lucide-react';

const MOTIVATIONAL_PHRASES = [
  {
    quote: "كل صفقة تبدأ برؤية، وكل عقار يحمل قصة نجاح.. انطلق اليوم بشغف واصنع فارقاً حقيقياً!",
    highlight: "اصنع فارقاً حقيقياً",
    category: "عزيمة وريادة",
  },
  {
    quote: "«الفرص لا تأتي بالصدفة، بل تُصنع باحترافية وسرعة المبادرة» — خطوتك اليوم تصنع صفقة الغد.",
    highlight: "سرعة المبادرة",
    category: "إغلاق الصفقات",
  },
  {
    quote: "العقار ملاذ الأمان وصانع الثروات.. ثقة العميل واهتمامك بأدق التفاصيل هما رأس مالنا الأغلى.",
    highlight: "ثقة العميل",
    category: "خدمة العملاء",
  },
  {
    quote: "«التميّز ليس محطة وصول، بل أسلوب عمل يومي» — كل تواصل احترافي يقرّبنا من القمة.",
    highlight: "التميّز أسلوب عمل",
    category: "الجودة والاحتراف",
  },
  {
    quote: "حوّل استفسار كل باحث عن عقار إلى حلم يتحقق وشراكة مستدامة.. معاً نبني مستقبلاً واعداً.",
    highlight: "شراكة مستدامة",
    category: "صناعة الفرص",
  },
];

export const TopMotivationBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Rotate every 18 seconds automatically
  useEffect(() => {
    const timer = setInterval(() => {
      handleNextPhrase();
    }, 18000);
    return () => clearInterval(timer);
  }, [currentIndex]);

  const handleNextPhrase = () => {
    setIsFading(true);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % MOTIVATIONAL_PHRASES.length);
      setIsFading(false);
    }, 200);
  };

  const current = MOTIVATIONAL_PHRASES[currentIndex];

  if (isCollapsed) {
    return (
      <div className="bg-[#98a890] dark:bg-slate-900 border-b border-[#86977e] dark:border-blue-900/30 px-4 py-1 flex items-center justify-between text-[11px] text-slate-800 dark:text-slate-400 select-none">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3 h-3 text-amber-300 dark:text-amber-400" />
          <span className="font-bold text-slate-950 dark:text-slate-300">ومضة تحفيزية:</span>
          <span className="text-slate-900 dark:text-slate-400 truncate max-w-md font-medium">{current.quote}</span>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="flex items-center gap-1 text-slate-900 hover:text-white dark:text-blue-400 dark:hover:text-blue-300 transition-colors py-0.5 px-2 rounded hover:bg-[#86977e] dark:hover:bg-slate-800 font-medium"
          title="توسيع شريط التحفيز"
        >
          <span>إظهار</span>
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>
    );
  }

  return (
    <aside aria-label="شريط التحفيز العقاري" className="relative bg-[#8f9f87] dark:bg-gradient-to-r dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 text-slate-950 dark:text-white border-b border-[#86977e] dark:border-blue-800/40 px-3 sm:px-6 py-2 flex-shrink-0 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 min-h-[30px]">
        {/* Right side (RTL): Tag & Motivational Quote */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7e8e76] dark:bg-gradient-to-r dark:from-amber-500/20 dark:to-orange-500/20 text-white dark:text-amber-300 border border-[#718069] dark:border-amber-500/30 shrink-0 shadow-2xs">
            <Sparkles className="w-3 h-3 text-amber-300 dark:text-amber-400 animate-pulse" />
            <span>ومضة تحفيزية</span>
            <span className="text-white/80 dark:text-amber-400/60 font-semibold">| {current.category}</span>
          </div>

          <div
            className={`flex items-center gap-2 text-xs sm:text-sm font-semibold tracking-wide text-slate-950 dark:text-slate-100 transition-opacity duration-200 min-w-0 ${
              isFading ? 'opacity-0' : 'opacity-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-900 dark:text-emerald-400 shrink-0 hidden md:block" />
            <span className="truncate font-bold">
              {current.quote}
            </span>
          </div>
        </div>

        {/* Left side (RTL): Actions (Change Quote + Minimize) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleNextPhrase}
            className="flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-white hover:text-white dark:text-slate-300 dark:hover:text-white bg-[#7e8e76] hover:bg-[#718069] dark:bg-slate-900/60 dark:hover:bg-slate-800 border border-[#718069] dark:border-slate-700/60 transition-all active:scale-95 shadow-2xs"
            title="عرض عبارة تحفيزية أخرى"
          >
            <RefreshCw className="w-3 h-3 text-white dark:text-blue-400" />
            <span className="hidden sm:inline">عبارة أخرى</span>
          </button>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-md text-slate-900 hover:text-white dark:text-slate-400 dark:hover:text-slate-200 hover:bg-[#7e8e76] dark:hover:bg-slate-800 transition-colors"
            title="تصغير الشريط"
            aria-label="تصغير شريط التحفيز"
          >
            <ChevronUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
