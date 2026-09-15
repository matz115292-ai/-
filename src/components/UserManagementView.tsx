import React, { useState } from 'react';
import { UserAccount, CurrentUserRole, Marketer } from '../types';
import { 
  KeyRound, 
  Plus, 
  Search, 
  UserCheck, 
  ShieldCheck, 
  ShieldAlert, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Edit, 
  Trash2, 
  User, 
  Phone, 
  Mail, 
  Lock,
  Sparkles,
  Info,
  ArrowLeftRight
} from 'lucide-react';

interface UserManagementViewProps {
  users: UserAccount[];
  marketers: Marketer[];
  currentUser: UserAccount | null;
  onNewUser: () => void;
  onEditUser: (user: UserAccount) => void;
  onDeleteUser: (userId: string) => void;
  onToggleUserStatus: (userId: string) => void;
  onSwitchEmployee?: (user: UserAccount) => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  users,
  marketers,
  currentUser,
  onNewUser,
  onEditUser,
  onDeleteUser,
  onToggleUserStatus,
  onSwitchEmployee,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'staff'>('all');
  const [revealedPasswords, setRevealedPasswords] = useState<Record<string, boolean>>({});
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleRevealPassword = (id: string) => {
    setRevealedPasswords(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const handleCopyCredentials = (user: UserAccount) => {
    const text = `بيانات الدخول لنظام إدارة العقارات:
اسم المستخدم: ${user.username}
الرقم السري: ${user.password}
الاسم: ${user.name}
الصلاحية: ${user.role === 'admin' ? 'مسؤول' : 'موظف وساطة'}`;

    navigator.clipboard.writeText(text);
    setCopiedId(user.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const totalAdmins = users.filter(u => u.role === 'admin').length;
  const totalStaff = users.filter(u => u.role === 'staff').length;
  const totalActive = users.filter(u => u.status === 'active').length;

  return (
    <div className="space-y-5">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                إدارة حسابات المستخدمين وأرقام الدخول السرية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                أنت كمسؤول مخول بإنشاء حسابات الموظفين وتعيين الرقم السري لكل مستخدم وتسليمه له
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewUser}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء حساب مستخدم جديد</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block mb-1">إجمالي الحسابات</span>
          <span className="text-xl font-bold text-slate-900 dark:text-white">{users.length}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 block mb-1">الحسابات النشطة</span>
          <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400">{totalActive}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 block mb-1">المسؤولون (Admins)</span>
          <span className="text-xl font-bold text-purple-700 dark:text-purple-400">{totalAdmins}</span>
        </div>
        <div className="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <span className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 block mb-1">المسوقون والموظفون</span>
          <span className="text-xl font-bold text-blue-700 dark:text-blue-400">{totalStaff}</span>
        </div>
      </div>

      {/* Info notice for Admin */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 border border-blue-200 dark:border-blue-900/50 p-3.5 rounded-xl flex items-start gap-3 text-xs text-blue-950 dark:text-blue-200">
        <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-0.5">آلية الدخول والأمان في النظام:</span>
          <p className="text-blue-900 dark:text-blue-300 leading-relaxed">
            لا يمكن لأي موظف إنشاء حساب بنفسه؛ المسؤول العام هو المرجع الوحيد لإنشاء الحساب وتحديد كلمة المرور/الرقم السري. بعد إنشائك للحساب يمكنك الضغط على <strong>«نسخ بيانات الدخول»</strong> لإرسال اسم المستخدم والرقم السري مباشرة للمسوق عبر الواتساب أو الرسائل النصية.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم أو اسم المستخدم أو الجوال..."
            className="w-full text-xs pr-9 pl-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:ring-1 focus:ring-blue-500 outline-none text-slate-800 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">تصفية حسب:</span>
          {(['all', 'admin', 'staff'] as const).map(role => (
            <button
              key={role}
              type="button"
              onClick={() => setRoleFilter(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                roleFilter === role
                  ? 'bg-slate-900 dark:bg-blue-600 text-white'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              {role === 'all' ? 'الكل' : role === 'admin' ? 'المسؤولون' : 'الموظفون'}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table / Grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 font-bold">
                <th className="p-3.5">المستخدم والاسم</th>
                <th className="p-3.5">اسم الدخول (Username)</th>
                <th className="p-3.5">الرقم السري الممنوح</th>
                <th className="p-3.5">الصلاحية</th>
                <th className="p-3.5">الحالة</th>
                <th className="p-3.5">المسوق المرتبط</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    لا يوجد مستخدمون يطابقون معايير البحث
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => {
                  const isCurrentUser = currentUser?.id === user.id;
                  const isRevealed = !!revealedPasswords[user.id];
                  const linkedMarketer = marketers.find(m => m.id === user.marketerId);

                  return (
                    <tr key={user.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                      {/* Name & Avatar */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
                            user.role === 'admin' 
                              ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' 
                              : 'bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          }`}>
                            {user.name.slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {isCurrentUser && (
                                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-800">
                                  أنت (حسابك الحالي)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-400 font-mono" dir="ltr">
                              {user.phone || user.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Username */}
                      <td className="p-3.5">
                        <span className="font-mono text-slate-900 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-md font-semibold border border-slate-200 dark:border-slate-700">
                          {user.username}
                        </span>
                      </td>

                      {/* Secret Password with reveal & copy */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 border border-amber-200 dark:border-amber-800/80 px-2.5 py-1 rounded-md font-bold tracking-wider">
                            {isRevealed ? user.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRevealPassword(user.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
                            title={isRevealed ? 'إخفاء الرقم السري' : 'إظهار الرقم السري'}
                          >
                            {isRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="p-3.5">
                        {user.role === 'admin' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-100 dark:bg-purple-900/40 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>مسؤول عام</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                            <User className="w-3.5 h-3.5" />
                            <span>موظف / مسوق</span>
                          </span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <button
                          type="button"
                          onClick={() => !isCurrentUser && onToggleUserStatus(user.id)}
                          disabled={isCurrentUser}
                          className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            user.status === 'active'
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100'
                          } ${isCurrentUser ? 'cursor-default' : 'cursor-pointer'}`}
                          title={isCurrentUser ? 'لا يمكن إيقاف حسابك الحالي' : 'اضغط لتغيير الحالة'}
                        >
                          {user.status === 'active' ? '● نشط' : '○ موقوف'}
                        </button>
                      </td>

                      {/* Linked Marketer */}
                      <td className="p-3.5 text-slate-600 dark:text-slate-300">
                        {linkedMarketer ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            <UserCheck className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                            <span>{linkedMarketer.name}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {/* Copy credentials button */}
                          <button
                            type="button"
                            onClick={() => handleCopyCredentials(user)}
                            className={`p-1.5 rounded-lg border transition-all flex items-center gap-1 text-[11px] font-medium ${
                              copiedId === user.id
                                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                                : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                            title="نسخ اسم المستخدم والرقم السري لإرساله للموظف"
                          >
                            {copiedId === user.id ? (
                              <>
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                                <span className="text-[10px]">تم النسخ!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3.5 h-3.5" />
                                <span className="hidden lg:inline text-[10px]">نسخ الدخول</span>
                              </>
                            )}
                          </button>

                          {/* Switch to this employee button */}
                          {onSwitchEmployee && !isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => onSwitchEmployee(user)}
                              className="p-1.5 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50/80 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:text-blue-900 transition-all flex items-center gap-1 text-[11px]"
                              title={`التبديل إلى ${user.name} ومعاينة النظام بصلاحياته`}
                            >
                              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                              <span className="hidden xl:inline text-[10px] font-semibold">تبديل للموظف</span>
                            </button>
                          )}

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => onEditUser(user)}
                            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                            title="تعديل الحساب أو تغيير الرقم السري"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete button (disabled for self and main admin) */}
                          {!isCurrentUser && (
                            <button
                              type="button"
                              onClick={() => onDeleteUser(user.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                              title="حذف الحساب"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
