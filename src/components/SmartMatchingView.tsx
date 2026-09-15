import React, { useState } from 'react';
import { Property, Client } from '../types';
import { calculateMatch, formatCurrency, formatArea, PROPERTY_TYPES } from '../utils/helpers';
import { 
  Sparkles, 
  MessageSquare, 
  Calendar, 
  Building, 
  User, 
  CheckCircle2, 
  SlidersHorizontal,
  ChevronLeft
} from 'lucide-react';

interface SmartMatchingViewProps {
  properties: Property[];
  clients: Client[];
  onScheduleVisit: (property: Property, client: Client) => void;
  onViewProperty: (property: Property) => void;
  onViewClient: (client: Client) => void;
  onAddNewProperty?: () => void;
  onAddNewClient?: () => void;
}

export const SmartMatchingView: React.FC<SmartMatchingViewProps> = ({
  properties,
  clients,
  onScheduleVisit,
  onViewProperty,
  onViewClient,
  onAddNewProperty,
  onAddNewClient,
}) => {
  const [selectedClientId, setSelectedClientId] = useState<string>('all');
  const [minScore, setMinScore] = useState<number>(50);

  const availableProperties = properties.filter(p => p.status !== 'sold' && p.status !== 'rented');

  // Generate all pairs
  const allMatches: {
    client: Client;
    property: Property;
    score: number;
    reasons: string[];
  }[] = [];

  clients.forEach(client => {
    if (selectedClientId !== 'all' && client.id !== selectedClientId) return;

    availableProperties.forEach(property => {
      const match = calculateMatch(client, property);
      if (match.score >= minScore) {
        allMatches.push({
          client,
          property,
          score: match.score,
          reasons: match.reasons,
        });
      }
    });
  });

  // Sort by highest score first
  allMatches.sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-5">
      {/* High Density Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 text-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-blue-600/20 text-blue-400 text-xs font-semibold mb-2 border border-blue-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            <span>نظام التوفيق العقاري الآلي</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">مطابقة العروض والطلبات العقارية الذكية</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            مقارنة آلية فورية بين ميزانية واهتمامات كل عميل مع العقارات المتوفرة لاقتراح أفضل صفقات الإغلاق.
          </p>
        </div>

        <div className="bg-slate-800/80 px-4 py-3 rounded-lg border border-slate-700 text-center shrink-0">
          <div className="text-xl font-bold text-blue-400">{allMatches.length}</div>
          <div className="text-[11px] text-slate-400">فرصة متطابقة</div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 w-full md:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
          <div className="flex-1 sm:w-64">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full text-xs font-medium px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200"
            >
              <option value="all">كافة العملاء المسجلين ({clients.length})</option>
              {clients.map(c => (
                <option key={c.id} value={c.id}>{c.name} ({c.role === 'buyer' ? 'مشتري' : 'مستأجر'})</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">درجة التوافق:</span>
          <div className="flex items-center gap-1">
            {[
              { label: 'الكل (50%+)', val: 50 },
              { label: 'عالي (70%+)', val: 70 },
              { label: 'تطابق تام (90%+)', val: 90 },
            ].map(pill => (
              <button
                key={pill.val}
                onClick={() => setMinScore(pill.val)}
                className={`text-xs px-2.5 py-1 rounded-lg font-medium border transition-all ${
                  minScore === pill.val
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Match cards grid */}
      {allMatches.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {allMatches.map(({ client, property, score, reasons }, index) => {
            const cleanPhone = client.phone.replace(/\D/g, '');
            const whatsappMsg = `السلام عليكم أستاذ ${client.name}، لدينا عرض عقاري يطابق ميزانيتك وطلبك تماماً:\n\n*${property.title}*\nالسعر: ${formatCurrency(property.price)}\nالموقع: ${property.city} - ${property.neighborhood}\nالمساحة: ${formatArea(property.area)}\n\nهل ترغب في تحديد موعد لمعاينة العقار؟`;
            const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappMsg)}`;

            return (
              <div
                key={`${client.id}-${property.id}`}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm transition-all p-4 flex flex-col justify-between"
              >
                {/* Score Header */}
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50 flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                      <span>تطابق {score}%</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      Ref: {property.referenceCode}
                    </span>
                  </div>

                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    {property.purpose === 'sale' ? 'شراء' : 'إيجار'}
                  </span>
                </div>

                {/* Match Comparison: Client (Left/Right) and Property */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-3">
                  {/* Client Info */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <User className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>العميل الراغب</span>
                      </div>
                      <h4 
                        onClick={() => onViewClient(client)}
                        className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
                      >
                        {client.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5" dir="ltr">{client.phone}</p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">الميزانية</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(client.budgetMin)} - {formatCurrency(client.budgetMax)}
                      </span>
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mb-1">
                        <Building className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                        <span>العقار المتوفر</span>
                      </div>
                      <h4 
                        onClick={() => onViewProperty(property)}
                        className="font-bold text-slate-900 dark:text-white text-xs hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer line-clamp-1"
                      >
                        {property.title}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {property.city}، {property.neighborhood}
                      </p>
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-700 text-[11px]">
                      <span className="text-slate-400 block text-[10px]">السعر المطلوب</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{formatCurrency(property.price)}</span>
                    </div>
                  </div>
                </div>

                {/* Match Reasons Badges */}
                <div className="mb-3">
                  <div className="flex flex-wrap gap-1">
                    {reasons.map((r, i) => (
                      <span key={i} className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 border border-slate-200 dark:border-slate-700">
                        <CheckCircle2 className="w-2.5 h-2.5 text-blue-600 dark:text-blue-400" />
                        <span>{r}</span>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors shadow-xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>مشاركة العرض بالواتساب</span>
                  </a>

                  <button
                    onClick={() => onScheduleVisit(property, client)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors"
                  >
                    <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                    <span>جدولة معاينة</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : properties.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-3 border border-amber-200 dark:border-amber-800">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">لا توجد عقارات مسجلة في النظام للمطابقة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            تم حذف أو عدم توفر أي عقارات في قاعدة البيانات حالياً. يحتاج محرك المطابقة إلى عروض عقارية معروضة لمقارنتها مع متطلبات واهتمامات العملاء ({clients.length} عميل مسجل).
          </p>
          {onAddNewProperty && (
            <button
              onClick={onAddNewProperty}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <span>+ تسجيل عقار جديد الآن</span>
            </button>
          )}
        </div>
      ) : availableProperties.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Building className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">كافة العقارات الحالية مباعة أو مؤجرة</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            جميع العقارات المسجلة ({properties.length} عقار) حالتها حالياً "تم البيع" أو "تم التأجير"، ولذلك يستثنيها المحرك تلقائياً لتفادي تقديم عروض غير متاحة للعملاء.
          </p>
        </div>
      ) : clients.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-3 border border-blue-100 dark:border-blue-900">
            <User className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1.5">لا يوجد عملاء مسجلين</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
            سجل طلبات واهتمامات العملاء بالحي أو الميزانية للبدء في تشغيل محرك المطابقة الذكي فوراً.
          </p>
          {onAddNewClient && (
            <button
              onClick={onAddNewClient}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              <span>+ تسجيل عميل جديد</span>
            </button>
          )}
        </div>
      ) : (
        <div className="p-10 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs max-w-xl mx-auto">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">لا توجد تطابقات بهذه النسبة ({minScore}%+)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4 leading-relaxed">
            العقارات المتاحة حالياً ({availableProperties.length} عقار) تختلف في الميزانية أو المدينة أو النوع عن طلبات العملاء المحددين. جرب خفض نسبة التوافق لرؤية الفرص الأقرب.
          </p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            {minScore > 50 && (
              <button
                onClick={() => setMinScore(50)}
                className="px-3 py-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all border border-blue-200 dark:border-blue-800"
              >
                عرض كافة التطابقات المحتملة (50%+)
              </button>
            )}
            {selectedClientId !== 'all' && (
              <button
                onClick={() => setSelectedClientId('all')}
                className="px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-all border border-slate-200 dark:border-slate-700"
              >
                عرض كافة العملاء
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
