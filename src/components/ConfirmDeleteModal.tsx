import React, { useEffect } from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert, Check } from 'lucide-react';

export interface DeleteModalState {
  isOpen: boolean;
  type?: 'property' | 'client' | 'marketer' | 'user' | 'bulk-properties' | 'bulk-clients' | 'bulk-marketers' | 'reset-data';
  id?: string;
  title: string;
  itemName?: string;
  itemDescription?: string;
  warningText?: string;
  onConfirm?: () => void;
  count?: number;
}

interface ConfirmDeleteModalProps {
  modalState: DeleteModalState | null;
  onClose: () => void;
  onConfirm: () => void;
  isAdmin?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  modalState,
  onClose,
  onConfirm,
  isAdmin = true,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!modalState?.isOpen) return;
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalState?.isOpen, onClose]);

  if (!modalState || !modalState.isOpen) return null;

  const isBulk = Boolean(typeof modalState.type === 'string' && modalState.type.startsWith('bulk-')) || (modalState.count !== undefined && modalState.count > 1);
  const isReset = modalState.type === 'reset-data';

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
      dir="rtl"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          title="إغلاق"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6">
          {/* Warning Icon Badge */}
          <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-100 dark:border-rose-900 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 mx-auto shadow-xs">
            {isReset ? (
              <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
            ) : (
              <Trash2 className="w-7 h-7 text-rose-600 dark:text-rose-400" />
            )}
          </div>

          {/* Heading */}
          <h3 className="text-lg font-bold text-slate-900 dark:text-white text-center mb-2">
            {modalState.title}
          </h3>

          {/* Description */}
          <div className="text-sm text-slate-600 dark:text-slate-300 text-center leading-relaxed mb-4">
            {modalState.itemName && (
              <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-2.5 rounded-xl mb-2.5 break-words">
                «{modalState.itemName}»
              </p>
            )}

            {modalState.itemDescription && (
              <p className="font-mono text-xs text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 p-2 rounded-lg mb-2.5 break-words">
                {modalState.itemDescription}
              </p>
            )}

            {isBulk ? (
              <p>
                أنت على وشك حذف <strong className="text-rose-600 dark:text-rose-400">{modalState.count}</strong> عناصر بشكل نهائي من قاعدة البيانات. لن تتمكن من استرجاعها بعد ذلك.
              </p>
            ) : isReset ? (
              <p>
                سيتم استعادة كافة البيانات النموذجية الافتراضية وإعادة ضبط القوائم العقارية وقائمة العملاء.
              </p>
            ) : (
              <p>
                هل أنت متأكد من تنفيذ عملية الحذف؟ سيتم إزالة هذا السجل نهائياً من النظام.
              </p>
            )}

            {modalState.warningText && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 p-2 rounded-lg mt-2.5">
                {modalState.warningText}
              </p>
            )}
          </div>

          {!isAdmin && (
            <div className="mb-4 p-2.5 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-900 dark:text-amber-200 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                تنبيه: أنت تتصفح حالياً بصلاحية موظف، وسيتم تأكيد العملية بالصلاحية الإدارية الكاملة.
              </span>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-6">
            <button
              id="btn-confirm-delete-action"
              type="button"
              onClick={() => {
                if (modalState.onConfirm) {
                  modalState.onConfirm();
                } else {
                  onConfirm();
                }
              }}
              className={`w-full sm:flex-1 py-2.5 px-4 rounded-xl text-sm font-bold text-white shadow-sm transition-all flex items-center justify-center gap-2 ${
                isReset
                  ? 'bg-amber-600 hover:bg-amber-700 active:bg-amber-800'
                  : 'bg-rose-600 hover:bg-rose-700 active:bg-rose-800'
              }`}
            >
              {isReset ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>تأكيد استعادة البيانات</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>{isBulk ? `حذف ${modalState.count} محدد الآن` : 'نعم، احذف نهائياً'}</span>
                </>
              )}
            </button>

            <button
              id="btn-cancel-delete-action"
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto py-2.5 px-5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600 transition-colors"
            >
              إلغاء التراجع
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
