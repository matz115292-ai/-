import React from 'react';
import { Trash2, X, CheckSquare, ShieldAlert, Lock } from 'lucide-react';

interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  itemLabel: string;
  isAdmin: boolean;
  onClearSelection: () => void;
  onBulkDelete: () => void;
  onSelectAll?: () => void;
  allSelected?: boolean;
}

export const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  totalCount,
  itemLabel,
  isAdmin,
  onClearSelection,
  onBulkDelete,
  onSelectAll,
  allSelected = false,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div 
      className="p-3 bg-slate-900 text-white rounded-xl shadow-lg border border-slate-800 flex flex-wrap items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-150"
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-600/30 border border-blue-500/40 rounded-lg text-blue-300 font-bold text-xs">
          <CheckSquare className="w-3.5 h-3.5" />
          <span>تم تحديد {selectedCount} {itemLabel}</span>
        </div>

        {onSelectAll && (
          <button
            type="button"
            onClick={onSelectAll}
            className="text-xs text-slate-300 hover:text-white underline underline-offset-4 transition-colors"
          >
            {allSelected ? `إلغاء تحديد الكل` : `تحديد كافة الـ ${totalCount} ${itemLabel}`}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onClearSelection}
          className="px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
        >
          <X className="w-3.5 h-3.5" />
          <span>إلغاء</span>
        </button>

        <button
          type="button"
          onClick={onBulkDelete}
          className={`px-3.5 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-colors flex items-center gap-1.5 ${
            isAdmin 
              ? 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800' 
              : 'bg-rose-700/90 hover:bg-rose-600 active:bg-rose-800'
          }`}
          title={isAdmin ? `حذف ${selectedCount} ${itemLabel} محدد` : 'تأكيد الحذف كمسؤول'}
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>حذف المحدد ({selectedCount})</span>
          {!isAdmin && <span className="text-[10px] opacity-80">(بصلاحية مسؤول)</span>}
        </button>
      </div>
    </div>
  );
};
