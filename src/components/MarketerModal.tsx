import React, { useState, useEffect } from 'react';
import { Marketer, MarketerStatus } from '../types';
import { X, UserCheck, Phone, Mail, Award, Percent, Tag, FileText } from 'lucide-react';

interface MarketerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (marketerData: Omit<Marketer, 'id' | 'createdAt'>, editingId?: string) => void;
  marketerToEdit?: Marketer | null;
}

export const MarketerModal: React.FC<MarketerModalProps> = ({
  isOpen,
  onClose,
  onSave,
  marketerToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [commissionRate, setCommissionRate] = useState<number | ''>(2.5);
  const [status, setStatus] = useState<MarketerStatus>('active');
  const [specialization, setSpecialization] = useState('');
  const [notes, setNotes] = useState('');

  const specializationPresets = [
    'فلل وقصور فاخرة',
    'شقق تمليك ومجمعات',
    'أراضي ومخططات استثمارية',
    'عمائر وتجاري',
    'إيجارات ومكاتب شركات',
    'شمال جدة وأبحر',
    'أحياء الشاطئ والروضة',
    'وسط وشرق جدة',
    'شمال الرياض',
  ];

  useEffect(() => {
    if (marketerToEdit) {
      setName(marketerToEdit.name);
      setPhone(marketerToEdit.phone);
      setEmail(marketerToEdit.email || '');
      setLicenseNumber(marketerToEdit.licenseNumber || '');
      setCommissionRate(marketerToEdit.commissionRate ?? 2.5);
      setStatus(marketerToEdit.status);
      setSpecialization(marketerToEdit.specialization || '');
      setNotes(marketerToEdit.notes || '');
    } else {
      setName('');
      setPhone('+9665');
      setEmail('');
      setLicenseNumber('');
      setCommissionRate(2.5);
      setStatus('active');
      setSpecialization('');
      setNotes('');
    }
  }, [marketerToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('يرجى كتابة اسم المسوق ورقم الجوال');
      return;
    }

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        licenseNumber: licenseNumber.trim() || undefined,
        commissionRate: commissionRate === '' ? 2.5 : Number(commissionRate),
        status,
        specialization: specialization.trim() || undefined,
        notes: notes.trim() || undefined,
      },
      marketerToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150" 
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold leading-tight">
                {marketerToEdit ? 'تعديل بيانات المسوق العقاري' : 'إضافة مسوق عقاري جديد'}
              </h2>
              <p className="text-xs text-slate-400">
                تسجيل بيانات الوسيط أو المسوق لتوزيع العروض وتتبع الصفقات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Row 1: Name and Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم المسوق العقاري <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-marketer-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="مثال: معتز الشريف"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الحالة
              </label>
              <select
                id="select-marketer-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as MarketerStatus)}
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
              >
                <option value="active">نشط ومعتمد</option>
                <option value="inactive">غير نشط / إجازة</option>
              </select>
            </div>
          </div>

          {/* Row 2: Phone and Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="w-3 h-3 text-slate-400" />
                <span>رقم الجوال / الواتساب</span> <span className="text-rose-500">*</span>
              </label>
              <input
                id="input-marketer-phone"
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+96650XXXXXXX"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="w-3 h-3 text-slate-400" />
                <span>البريد الإلكتروني (اختياري)</span>
              </label>
              <input
                id="input-marketer-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="motaz@example.com"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                dir="ltr"
              />
            </div>
          </div>

          {/* Row 3: License and Commission */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-500" />
                <span>رقم ترخيص فال (الهيئة العامة للعقار)</span>
              </label>
              <input
                id="input-marketer-license"
                type="text"
                value={licenseNumber}
                onChange={(e) => setLicenseNumber(e.target.value)}
                placeholder="مثال: 1200034821"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Percent className="w-3 h-3 text-slate-400" />
                <span>نسبة السعي / العمولة المتفق عليها (%)</span>
              </label>
              <input
                id="input-marketer-commission"
                type="number"
                step="0.1"
                min="0"
                max="100"
                value={commissionRate}
                onChange={(e) => setCommissionRate(e.target.value === '' ? '' : parseFloat(e.target.value))}
                placeholder="2.5"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Row 4: Specialization & Quick Presets */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <Tag className="w-3 h-3 text-blue-500" />
              <span>مجال التخصص ونطاق العمل</span>
            </label>
            <input
              id="input-marketer-specialization"
              type="text"
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              placeholder="مثال: فلل وقصور فاخرة - شمال جدة وأبحر"
              className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none mb-2 bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
            {/* Quick chips */}
            <div className="flex flex-wrap gap-1.5">
              {specializationPresets.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => {
                    if (specialization.includes(preset)) return;
                    setSpecialization(specialization ? `${specialization}، ${preset}` : preset);
                  }}
                  className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 dark:hover:text-blue-400 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 transition-colors"
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3 h-3 text-slate-400" />
              <span>ملاحظات وسجل الأداء</span>
            </label>
            <textarea
              id="input-marketer-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="أضف أي تفاصيل أخرى، مثل سنوات الخبرة أو المناطق المحددة..."
              className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              id="btn-save-marketer-submit"
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {marketerToEdit ? 'حفظ التعديلات' : 'تسجيل المسوق الآن'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
