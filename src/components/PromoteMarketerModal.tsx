import React, { useState, useEffect } from 'react';
import { Marketer, MarketerTier } from '../types';
import { MARKETER_TIERS, getMarketerTierInfo } from '../utils/helpers';
import { Award, X, Check, ShieldAlert, Sparkles, TrendingUp, AlertCircle, Calendar } from 'lucide-react';

interface PromoteMarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  marketer: Marketer | null;
  onPromote: (marketerId: string, newTier: MarketerTier, newCommissionRate: number, reason: string) => void;
  isAdmin: boolean;
}

export const PromoteMarketerModal: React.FC<PromoteMarketerModalProps> = ({
  isOpen,
  onClose,
  marketer,
  onPromote,
  isAdmin,
}) => {
  const [selectedTier, setSelectedTier] = useState<MarketerTier>('senior');
  const [commissionRate, setCommissionRate] = useState<number>(3.0);
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (marketer) {
      const currentTier = marketer.tier || 'certified';
      // Pick next tier if available
      let nextTier: MarketerTier = 'senior';
      if (currentTier === 'junior') nextTier = 'certified';
      else if (currentTier === 'certified') nextTier = 'senior';
      else if (currentTier === 'senior') nextTier = 'director';
      else nextTier = 'director';

      setSelectedTier(nextTier);
      const tierInfo = getMarketerTierInfo(nextTier);
      setCommissionRate(tierInfo.recommendedCommission);
      setReason('');
    }
  }, [marketer, isOpen]);

  if (!isOpen || !marketer) return null;

  const currentTierInfo = getMarketerTierInfo(marketer.tier);
  const targetTierInfo = getMarketerTierInfo(selectedTier);

  const handleTierChange = (tier: MarketerTier) => {
    setSelectedTier(tier);
    const info = getMarketerTierInfo(tier);
    setCommissionRate(info.recommendedCommission);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;
    onPromote(
      marketer.id,
      selectedTier,
      Number(commissionRate),
      reason.trim() || `ترقية إدارية إلى رتبة ${targetTierInfo.label}`
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-amber-600 via-amber-700 to-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <Award className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug">ترقية وتعيين رتبة المسوق</h3>
              <p className="text-xs text-amber-100">تطوير المسار المهني وتحديث نسبة العمولة والامتيازات</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
          {/* Admin authorization warning if not admin */}
          {!isAdmin && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-xl flex items-center gap-3 text-rose-800 dark:text-rose-200 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
              <span>
                <strong>تنبيه الصلاحيات:</strong> ترقية المسوقين متاحة فقط لمدير النظام (المسؤول). يرجى التبديل لحساب المسؤول لتنفيذ الإجراء.
              </span>
            </div>
          )}

          {/* Current Marketer Status Box */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/70 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">المسوق الحالي</p>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm mt-0.5">{marketer.name}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                العمولة الحالية: <span className="font-bold text-slate-700 dark:text-slate-200">{marketer.commissionRate || 2.5}%</span>
              </p>
            </div>
            <div className="text-left">
              <span className="text-[11px] text-slate-400 dark:text-slate-500 block mb-1">الرتبة الحالية</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${currentTierInfo.bg} ${currentTierInfo.color} ${currentTierInfo.border}`}>
                {currentTierInfo.badge}
              </span>
            </div>
          </div>

          {/* Tiers Selection Grid */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
              اختر الرتبة الجديدة للمسوق:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {MARKETER_TIERS.map((tier) => {
                const isSelected = selectedTier === tier.value;
                const isCurrent = marketer.tier === tier.value;

                return (
                  <button
                    key={tier.value}
                    type="button"
                    onClick={() => handleTierChange(tier.value)}
                    className={`p-3 rounded-xl border text-right transition-all flex flex-col justify-between relative ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/40 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${tier.bg} ${tier.color} ${tier.border}`}>
                        {tier.badge}
                      </span>
                      {isCurrent ? (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded">الحالي</span>
                      ) : isSelected ? (
                        <Check className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      ) : null}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-white">{tier.label}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-1 line-clamp-2">
                        {tier.description}
                      </p>
                    </div>
                    <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 dark:text-slate-400">العمولة المقترحة:</span>
                      <span className="font-bold text-amber-700 dark:text-amber-400">{tier.recommendedCommission}%</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Commission Rate field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                نسبة العمولة المعتمدة (%)
              </label>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                المقترحة: {targetTierInfo.recommendedCommission}%
              </span>
            </div>
            <div className="relative">
              <input
                type="number"
                step="0.1"
                min="0.5"
                max="10"
                value={commissionRate}
                onChange={(e) => setCommissionRate(parseFloat(e.target.value) || 0)}
                required
                className="w-full pl-8 pr-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 font-semibold text-slate-800 dark:text-white"
              />
              <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">%</span>
            </div>
          </div>

          {/* Promotion reason / note */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              سبب الترقية وملاحظات الإنجاز (اختياري)
            </label>
            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="مثال: تحقيق مستهدف المبيعات وتجاوز 5 ملايين ريال في صفقات الربع الأول..."
              className="w-full p-2.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 resize-none"
            />
          </div>

          {/* Promotion History (if any) */}
          {marketer.promotionHistory && marketer.promotionHistory.length > 0 && (
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs font-bold text-slate-600 dark:text-slate-300 mb-2 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>سجل الترقيات السابقة:</span>
              </p>
              <div className="space-y-1.5 max-h-24 overflow-y-auto">
                {marketer.promotionHistory.map((p, idx) => {
                  const toInfo = getMarketerTierInfo(p.toTier);
                  return (
                    <div key={p.id || idx} className="text-[11px] p-2 bg-slate-50 dark:bg-slate-800 rounded-md flex items-center justify-between text-slate-600 dark:text-slate-300">
                      <span>ترقية إلى <strong>{toInfo.label}</strong> ({p.newCommissionRate}%)</span>
                      <span className="text-slate-400 dark:text-slate-500 text-[10px]">{p.date}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={!isAdmin}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>تأكيد اعتماد الترقية</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
