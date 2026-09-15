import React, { useState } from 'react';
import { Marketer, Property } from '../types';
import { 
  UserCheck, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  Award, 
  Percent, 
  Building2, 
  Edit, 
  Trash2, 
  MessageSquare, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  UserX,
  ExternalLink,
  TrendingUp,
  CheckSquare
} from 'lucide-react';
import { getMarketerTierInfo } from '../utils/helpers';
import { BulkActionBar } from './BulkActionBar';

interface MarketersViewProps {
  marketers: Marketer[];
  properties: Property[];
  onAddMarketer: () => void;
  onEditMarketer: (marketer: Marketer) => void;
  onDeleteMarketer: (id: string) => void;
  onViewMarketerProperties?: (marketerId: string) => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string) => void;
  onToggleSelectAll?: () => void;
  onBulkDelete?: () => void;
  onPromoteMarketer?: (marketer: Marketer) => void;
  isAdmin?: boolean;
}

export const MarketersView: React.FC<MarketersViewProps> = ({
  marketers,
  properties,
  onAddMarketer,
  onEditMarketer,
  onDeleteMarketer,
  onViewMarketerProperties,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  onBulkDelete,
  onPromoteMarketer,
  isAdmin = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Compute property count per marketer
  const getAssignedProperties = (marketerId: string) => {
    return properties.filter(p => p.marketerId === marketerId);
  };

  const filteredMarketers = marketers.filter(m => {
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = !q || (
      m.name.toLowerCase().includes(q) ||
      m.phone.toLowerCase().includes(q) ||
      (m.email && m.email.toLowerCase().includes(q)) ||
      (m.licenseNumber && m.licenseNumber.toLowerCase().includes(q)) ||
      (m.specialization && m.specialization.toLowerCase().includes(q))
    );

    const matchesStatus = filterStatus === 'all' || m.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const activeMarketersCount = marketers.filter(m => m.status === 'active').length;
  const totalAssignedProperties = properties.filter(p => p.marketerId).length;
  const avgCommission = marketers.length > 0 
    ? (marketers.reduce((acc, m) => acc + (m.commissionRate || 2.5), 0) / marketers.length).toFixed(1)
    : '2.5';

  return (
    <div className="space-y-6" dir="rtl">
      {/* Metric Counters Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">إجمالي المسوقين</span>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-lg">
              <UserCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{marketers.length}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">كافة الوسطاء والمسوقين المسجلين</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">المسوقين النشطين</span>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{activeMarketersCount}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">متاحون لإسناد العروض والصفقات</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">عقارات مسندة لمسوقين</span>
            <div className="p-2 bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 rounded-lg">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalAssignedProperties}</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">من إجمالي {properties.length} عقار مسجل</div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-semibold">متوسط نسبة العمولة</span>
            <div className="p-2 bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-lg">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{avgCommission}%</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">وفق اللائحة التنفيذية لوساطة فال</div>
        </div>
      </div>

      {/* Control bar: Search, Filter, Add */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-3 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-search-marketers"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم، الجوال، رقم رخصة فال، التخصص..."
            className="w-full text-xs pr-8 pl-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:bg-white dark:focus:bg-slate-800 focus:ring-1 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-wrap">
          {/* Status Filter */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                filterStatus === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              الكل ({marketers.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                filterStatus === 'active' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              نشط ({activeMarketersCount})
            </button>
            <button
              onClick={() => setFilterStatus('inactive')}
              className={`px-3 py-1 rounded-md text-xs transition-all ${
                filterStatus === 'inactive' ? 'bg-slate-700 text-white font-bold' : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              غير نشط ({marketers.length - activeMarketersCount})
            </button>
          </div>

          {onToggleSelectAll && filteredMarketers.length > 0 && (
            <button
              type="button"
              onClick={onToggleSelectAll}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-lg shadow-2xs transition-colors"
            >
              <CheckSquare className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>{selectedIds.length === filteredMarketers.length ? 'إلغاء التحديد' : 'تحديد الكل'}</span>
            </button>
          )}

          <button
            id="btn-add-marketer-main"
            onClick={onAddMarketer}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>إضافة مسوق جديد</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Bar */}
      {selectedIds.length > 0 && onBulkDelete && (
        <BulkActionBar
          selectedCount={selectedIds.length}
          totalCount={filteredMarketers.length}
          itemLabel="مسوق"
          isAdmin={isAdmin}
          onClearSelection={() => {
            if (onToggleSelectAll && selectedIds.length === filteredMarketers.length) {
              onToggleSelectAll();
            } else {
              selectedIds.forEach(id => onToggleSelect?.(id));
            }
          }}
          onBulkDelete={onBulkDelete}
          onSelectAll={onToggleSelectAll}
          allSelected={filteredMarketers.length > 0 && selectedIds.length === filteredMarketers.length}
        />
      )}

      {/* Marketers Grid */}
      {filteredMarketers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMarketers.map((marketer) => {
            const assignedProps = getAssignedProperties(marketer.id);
            const initials = marketer.name
              .split(' ')
              .map(n => n[0])
              .slice(0, 2)
              .join('');

            const isSelected = selectedIds.includes(marketer.id);
            const tierInfo = getMarketerTierInfo(marketer.tier);

            return (
              <div
                key={marketer.id}
                id={`marketer-card-${marketer.id}`}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all p-4 flex flex-col justify-between ${
                  isSelected 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md' 
                    : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xs'
                }`}
              >
                {/* Header info */}
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {onToggleSelect && (
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(marketer.id)}
                          className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700 dark:bg-slate-800 cursor-pointer shrink-0"
                          title="تحديد هذا المسوق"
                        />
                      )}
                      <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
                        {initials || 'مس'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {marketer.name}
                          </h3>
                        </div>
                        {marketer.specialization && (
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                            {marketer.specialization}
                          </div>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                      marketer.status === 'active'
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      {marketer.status === 'active' ? 'نشط ومعتمد' : 'غير نشط'}
                    </span>
                  </div>

                  {/* Badges / License & Tier */}
                  <div className="flex flex-wrap items-center gap-1.5 mb-3 text-[11px]">
                    {/* Tier badge */}
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${tierInfo.bg} ${tierInfo.color} ${tierInfo.border}`}>
                      <span>{tierInfo.badge}</span>
                      <span>{tierInfo.label}</span>
                    </span>

                    {marketer.licenseNumber ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-mono font-medium">
                        <Award className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                        <span>رخصة فال: {marketer.licenseNumber}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700">
                        بدون ترخيص فال
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800 font-medium">
                      عمولة: {marketer.commissionRate ?? 2.5}%
                    </span>
                  </div>

                  {/* Contact row */}
                  <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">الجوال:</span>
                      <div className="flex items-center gap-2">
                        <a
                          href={`tel:${marketer.phone}`}
                          className="font-mono text-slate-800 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 font-medium dir-ltr"
                          dir="ltr"
                        >
                          {marketer.phone}
                        </a>
                        <a
                          href={`https://wa.me/${marketer.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="محادثة واتساب"
                          className="p-1 rounded bg-emerald-100 dark:bg-emerald-900/60 hover:bg-emerald-200 dark:hover:bg-emerald-800 text-emerald-700 dark:text-emerald-300 transition-colors"
                        >
                          <MessageSquare className="w-3 h-3" />
                        </a>
                      </div>
                    </div>

                    {marketer.email && (
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
                        <span className="text-[11px] text-slate-400 dark:text-slate-500">البريد:</span>
                        <a
                          href={`mailto:${marketer.email}`}
                          className="font-mono text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-[11px] dir-ltr truncate max-w-[180px]"
                          dir="ltr"
                        >
                          {marketer.email}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Notes if available */}
                  {marketer.notes && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mb-3 bg-transparent">
                      {marketer.notes}
                    </p>
                  )}
                </div>

                {/* Footer: assigned properties + Actions */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-auto">
                  <div className="text-xs">
                    <span className="text-slate-500 dark:text-slate-400">العقارات المسندة: </span>
                    <button
                      onClick={() => onViewMarketerProperties && onViewMarketerProperties(marketer.id)}
                      className={`font-bold inline-flex items-center gap-1 ${
                        assignedProps.length > 0 
                          ? 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline underline-offset-2' 
                          : 'text-slate-400 dark:text-slate-500'
                      }`}
                      title={assignedProps.length > 0 ? 'عرض عقارات هذا المسوق' : 'لا توجد عقارات مسندة'}
                    >
                      <span>{assignedProps.length} عقار</span>
                      {assignedProps.length > 0 && <ExternalLink className="w-3 h-3" />}
                    </button>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Promote Marketer Button */}
                    {onPromoteMarketer && (
                      <button
                        onClick={() => onPromoteMarketer(marketer)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 dark:hover:bg-amber-900/60 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors shadow-2xs"
                        title="تعيين ترقية وتعديل العمولة والرتبة للمسوق"
                      >
                        <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>ترقية الرتبة</span>
                      </button>
                    )}

                    <button
                      onClick={() => onEditMarketer(marketer)}
                      className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-lg transition-colors"
                      title="تعديل بيانات المسوق"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMarketer(marketer.id)}
                      className="p-1.5 rounded-lg text-rose-500 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                      title="حذف هذا المسوق"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <UserCheck className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-1">لم يتم العثور على أي مسوق</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-3">
            لا توجد نتائج مطابقة لبحثك. يمكنك تسجيل مسوقين جدد لتوزيع العروض العقارية ومتابعة نسب العمولات.
          </p>
          <button
            onClick={onAddMarketer}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>تسجيل مسوق عقاري جديد</span>
          </button>
        </div>
      )}
    </div>
  );
};
