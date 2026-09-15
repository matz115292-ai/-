import React, { useState, useEffect } from 'react';
import { Client, ClientRole, ClientStatus, PropertyType } from '../types';
import { CLIENT_ROLES, CLIENT_STATUSES, PROPERTY_TYPES } from '../utils/helpers';
import { DEFAULT_CITY, SAUDI_CITIES, JEDDAH_NEIGHBORHOODS, CITY_NEIGHBORHOODS } from '../data/locations';
import { X, User, Check } from 'lucide-react';
import { SmartWhatsAppClientParser } from './SmartWhatsAppClientParser';
import { ParsedClientData } from '../utils/whatsappParser';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (clientData: Omit<Client, 'id' | 'createdAt'>, editingId?: string) => void;
  clientToEdit?: Client | null;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  clientToEdit,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<ClientRole>('buyer');
  const [status, setStatus] = useState<ClientStatus>('active');
  const [budgetMin, setBudgetMin] = useState<number | ''>('');
  const [budgetMax, setBudgetMax] = useState<number | ''>('');
  const [preferredPurpose, setPreferredPurpose] = useState<'sale' | 'rent' | 'any'>('sale');
  const [preferredTypes, setPreferredTypes] = useState<PropertyType[]>(['villa']);
  const [preferredCities, setPreferredCities] = useState<string[]>([DEFAULT_CITY]);
  const [neighborhoodsInput, setNeighborhoodsInput] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (clientToEdit) {
      setName(clientToEdit.name);
      setPhone(clientToEdit.phone);
      setEmail(clientToEdit.email || '');
      setRole(clientToEdit.role);
      setStatus(clientToEdit.status);
      setBudgetMin(clientToEdit.budgetMin);
      setBudgetMax(clientToEdit.budgetMax);
      setPreferredPurpose(clientToEdit.preferredPurpose);
      setPreferredTypes(clientToEdit.preferredTypes);
      setPreferredCities(clientToEdit.preferredCities);
      setNeighborhoodsInput((clientToEdit.preferredNeighborhoods || []).join('، '));
      setNotes(clientToEdit.notes);
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setRole('buyer');
      setStatus('active');
      setBudgetMin('');
      setBudgetMax('');
      setPreferredPurpose('sale');
      setPreferredTypes(['villa']);
      setPreferredCities([DEFAULT_CITY]);
      setNeighborhoodsInput('');
      setNotes('');
    }
  }, [clientToEdit, isOpen]);

  if (!isOpen) return null;

  const toggleType = (t: PropertyType) => {
    if (preferredTypes.includes(t)) {
      if (preferredTypes.length > 1) {
        setPreferredTypes(preferredTypes.filter(item => item !== t));
      }
    } else {
      setPreferredTypes([...preferredTypes, t]);
    }
  };

  const toggleCity = (c: string) => {
    if (preferredCities.includes(c)) {
      if (preferredCities.length > 1) {
        setPreferredCities(preferredCities.filter(item => item !== c));
      }
    } else {
      setPreferredCities([...preferredCities, c]);
    }
  };

  const handleSmartParsed = (data: ParsedClientData) => {
    if (data.name) setName(data.name);
    if (data.phone) setPhone(data.phone);
    if (data.email) setEmail(data.email);
    if (data.role) setRole(data.role);
    if (data.preferredPurpose) setPreferredPurpose(data.preferredPurpose);
    if (data.preferredTypes && data.preferredTypes.length > 0) {
      setPreferredTypes(data.preferredTypes);
    }
    if (data.preferredCities && data.preferredCities.length > 0) {
      setPreferredCities(data.preferredCities);
    }
    if (data.preferredNeighborhoods && data.preferredNeighborhoods.length > 0) {
      setNeighborhoodsInput(data.preferredNeighborhoods.join('، '));
    }
    if (data.budgetMin !== undefined && data.budgetMin !== '') {
      setBudgetMin(data.budgetMin);
    }
    if (data.budgetMax !== undefined && data.budgetMax !== '') {
      setBudgetMax(data.budgetMax);
    }
    if (data.notes) {
      setNotes((prev) => (prev ? `${prev}\n\n${data.notes}` : data.notes));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || budgetMax === '') {
      alert('يرجى كتابة اسم العميل ورقم الجوال والحد الأقصى للميزانية');
      return;
    }

    const neighborhoods = neighborhoodsInput
      .split(/[,،]+/)
      .map(s => s.trim())
      .filter(Boolean);

    onSave(
      {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        role,
        status,
        budgetMin: budgetMin !== '' ? Number(budgetMin) : 0,
        budgetMax: Number(budgetMax),
        preferredPurpose,
        preferredTypes,
        preferredCities,
        preferredNeighborhoods: neighborhoods.length > 0 ? neighborhoods : undefined,
        notes: notes.trim(),
      },
      clientToEdit?.id
    );
    onClose();
  };

  const handleToggleNeighborhoodChip = (nhName: string) => {
    const current = neighborhoodsInput
      .split(/[,،]+/)
      .map(s => s.trim())
      .filter(Boolean);
    if (current.includes(nhName)) {
      setNeighborhoodsInput(current.filter(item => item !== nhName).join('، '));
    } else {
      setNeighborhoodsInput([...current, nhName].join('، '));
    }
  };

  const CITIES_LIST = SAUDI_CITIES.slice(0, 8);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-2xl overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                {clientToEdit ? 'تعديل بيانات العميل' : 'تسجيل عميل جديد في قاعدة البيانات'}
              </h2>
              <p className="text-[11px] text-slate-400">سجل متطلبات العميل بدقة لتسهيل المطابقة الذكية</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 max-h-[80vh] overflow-y-auto space-y-4 text-right">
          {/* Smart WhatsApp Text Extractor */}
          <SmartWhatsAppClientParser onParsed={handleSmartParsed} />

          {/* Section 1: Contact details */}
          <div>
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              بيانات التواصل والهوية
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  اسم العميل الكامل *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عبدالله محمد الدوسري"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  رقم الجوال * (للاتصال والواتساب)
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966501234567"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  البريد الإلكتروني (اختياري)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@example.com"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  تصنيف العميل ودوره *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as ClientRole)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {CLIENT_ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Requirements and Budget */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              الميزانية والعقارات المستهدفة
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الحد الأدنى للميزانية (ريال)
                </label>
                <input
                  type="number"
                  min="0"
                  value={budgetMin}
                  onChange={(e) => setBudgetMin(e.target.value ? Number(e.target.value) : '')}
                  placeholder="1000000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الحد الأقصى للميزانية (ريال) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={budgetMax}
                  onChange={(e) => setBudgetMax(e.target.value ? Number(e.target.value) : '')}
                  placeholder="2500000"
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  الغرض المطلوب *
                </label>
                <select
                  value={preferredPurpose}
                  onChange={(e) => setPreferredPurpose(e.target.value as any)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  <option value="sale">شراء (تملك)</option>
                  <option value="rent">استئجار</option>
                  <option value="any">شراء أو إيجار</option>
                </select>
              </div>
            </div>

            {/* Property Types Multiple Selection */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                أنواع العقارات المفضلة (يمكن اختيار أكثر من نوع)
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
                {PROPERTY_TYPES.map((t) => {
                  const isSelected = preferredTypes.includes(t.value);
                  return (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => toggleType(t.value)}
                      className={`py-1.5 px-2 text-center rounded-lg border text-xs transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Cities Multiple Selection */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                المدن المفضلة
              </label>
              <div className="flex flex-wrap gap-1.5">
                {CITIES_LIST.map((city) => {
                  const isSelected = preferredCities.includes(city);
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => toggleCity(city)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-slate-900 dark:bg-blue-600 text-white border-slate-900 dark:border-blue-600 font-semibold'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  الأحياء المفضلة (مفصولة بفواصل)
                </label>
                <span className="text-[11px] text-blue-600 dark:text-blue-400">
                  اضغط على اسم الحي لإضافته سريعاً
                </span>
              </div>
              <input
                type="text"
                value={neighborhoodsInput}
                onChange={(e) => setNeighborhoodsInput(e.target.value)}
                placeholder="مثال: حي الشاطئ، حي الروضة، أبحر الشمالية، الحمراء"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
              {/* Quick chips for Jeddah neighborhoods */}
              <div className="flex flex-wrap gap-1 mt-2">
                {JEDDAH_NEIGHBORHOODS.slice(0, 12).map((nh) => {
                  const isIncluded = neighborhoodsInput.includes(nh);
                  return (
                    <button
                      key={nh}
                      type="button"
                      onClick={() => handleToggleNeighborhoodChip(nh)}
                      className={`text-[10px] px-2 py-0.5 rounded-full border transition-all cursor-pointer ${
                        isIncluded
                          ? 'bg-blue-600 text-white border-blue-600 font-bold'
                          : 'bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {nh.replace('حي ', '')} {isIncluded ? '✓' : '+'}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Section 3: Status and Notes */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              حالة الطلب والملاحظات
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  حالة التعامل مع العميل
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as ClientStatus)}
                  className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                >
                  {CLIENT_STATUSES.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ملاحظات إضافية حول العميل وطلبه
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="شروط الدفع، موعد الشراء المتوقع، أو مواصفات خاصة..."
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none resize-none bg-white dark:bg-slate-800 text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
              />
            </div>
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
              id="btn-save-client-modal"
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
            >
              {clientToEdit ? 'حفظ التعديلات' : 'تسجيل العميل'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
