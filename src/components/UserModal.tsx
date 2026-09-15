import React, { useState, useEffect } from 'react';
import { UserAccount, CurrentUserRole, Marketer } from '../types';
import { 
  X, 
  User, 
  KeyRound, 
  ShieldCheck, 
  Phone, 
  Mail, 
  UserCheck, 
  Eye, 
  EyeOff, 
  Sparkles,
  Lock
} from 'lucide-react';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: Omit<UserAccount, 'id' | 'createdAt'>, editingId?: string) => void;
  userToEdit?: UserAccount | null;
  marketers?: Marketer[];
}

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  marketers = [],
}) => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<CurrentUserRole>('staff');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [marketerId, setMarketerId] = useState('');
  const [status, setStatus] = useState<'active' | 'suspended'>('active');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setUsername(userToEdit.username);
      setName(userToEdit.name);
      setPassword(userToEdit.password);
      setRole(userToEdit.role);
      setPhone(userToEdit.phone || '');
      setEmail(userToEdit.email || '');
      setMarketerId(userToEdit.marketerId || '');
      setStatus(userToEdit.status);
    } else {
      setUsername('');
      setName('');
      // Generate a friendly initial 4-6 digit secret PIN or password
      setPassword(Math.floor(1000 + Math.random() * 9000).toString());
      setRole('staff');
      setPhone('+9665');
      setEmail('');
      setMarketerId('');
      setStatus('active');
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const generateRandomPin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setPassword(pin);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !name.trim() || !password.trim()) {
      alert('يرجى ملء الحقول الإلزامية (اسم المستخدم، الاسم، والرقم السري)');
      return;
    }

    onSave(
      {
        username: username.trim().toLowerCase(),
        name: name.trim(),
        password: password.trim(),
        role,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        marketerId: marketerId || undefined,
        status,
      },
      userToEdit?.id
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-lg overflow-hidden shadow-xl border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white px-5 py-4 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base">
                {userToEdit ? 'تعديل بيانات الحساب والرقم السري' : 'إنشاء حساب مستخدم جديد (بواسطة المسؤول)'}
              </h2>
              <p className="text-[11px] text-slate-400">
                المسؤول هو المخوّل بإنشاء الحسابات وتعيين الرقم السري وتسليمه للمستخدم
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-amber-900 dark:text-amber-300 text-xs flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">ملاحظة تنظيمية:</span>
              <span>أنت كمسؤول تقوم بتحديد اسم المستخدم والرقم السري المباشر للموظف، وسيتمكن من تسجيل الدخول بهما فوراً.</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الاسم الكامل للمستخدم *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: عبدالله الرويلي"
                  className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                اسم المستخدم للدخول (Username) *
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                placeholder="مثال: abdullah"
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                dir="ltr"
              />
            </div>
          </div>

          {/* Password Section */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>الرقم السري / كلمة المرور الممنوحة *</span>
              </label>
              <button
                type="button"
                onClick={generateRandomPin}
                className="text-[11px] text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium inline-flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>توليد رقم سري تلقائي</span>
              </button>
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="أدخل الرقم السري"
                className="w-full text-sm px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white tracking-wider"
                dir="ltr"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                title={showPassword ? 'إخفاء' : 'إظهار'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              قم بتسليم هذا الرقم السري للمستخدم ليتمكن من الدخول إلى حسابه.
            </p>
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                الصلاحية ونوع الحساب *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as CurrentUserRole)}
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="staff">موظف / مسوق وساطة (صلاحيات عادية)</option>
                <option value="admin">مسؤول النظام (كامل الصلاحيات والحذف)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                حالة الحساب *
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'active' | 'suspended')}
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium"
              >
                <option value="active">نشط (مسموح بالدخول)</option>
                <option value="suspended">موقوف مؤقتاً (ممنوع من الدخول)</option>
              </select>
            </div>
          </div>

          {/* Optional Phone & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                رقم الجوال (اختياري)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+966500000000"
                  className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                البريد الإلكتروني (اختياري)
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@aqar.sa"
                  className="w-full text-xs pr-9 pl-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none font-mono bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  dir="ltr"
                />
              </div>
            </div>
          </div>

          {/* Linked Marketer */}
          {marketers.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <UserCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>ربط الحساب بمسوق عقاري موجود (اختياري)</span>
              </label>
              <select
                value={marketerId}
                onChange={(e) => {
                  setMarketerId(e.target.value);
                  const selectedMarketer = marketers.find(m => m.id === e.target.value);
                  if (selectedMarketer && !name) {
                    setName(selectedMarketer.name);
                  }
                  if (selectedMarketer?.phone && phone === '+9665') {
                    setPhone(selectedMarketer.phone);
                  }
                }}
                className="w-full text-xs px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="">-- بدون ربط بمسوق محدد --</option>
                {marketers.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.phone}) - {m.specialization || 'مسوق معتمد'}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{userToEdit ? 'حفظ التعديلات' : 'إنشاء وتفعيل الحساب'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
