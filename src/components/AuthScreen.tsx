import React, { useState } from 'react';
import { UserAccount, Property, Client } from '../types';
import { 
  Building2, 
  KeyRound, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  LogIn, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ShieldCheck,
  ChevronLeft,
  FileSpreadsheet
} from 'lucide-react';
import { ClientRequestModal } from './ClientRequestModal';
import { BarqLogo } from './BarqLogo';

interface AuthScreenProps {
  users: UserAccount[];
  onLoginSuccess: (user: UserAccount) => void;
  properties: Property[];
  onSubmitClientRequest: (clientData: Omit<Client, 'id' | 'createdAt'>) => Client;
  onViewProperty?: (property: Property) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
  users,
  onLoginSuccess,
  properties,
  onSubmitClientRequest,
  onViewProperty,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      setErrorMessage('يرجى كتابة اسم المستخدم والرقم السري');
      return;
    }

    const foundUser = users.find(
      u => u.username.toLowerCase() === cleanUsername && u.password === cleanPassword
    );

    if (!foundUser) {
      setErrorMessage('اسم المستخدم أو الرقم السري غير صحيح. يرجى مراجعة مسؤول النظام للحصول على بيانات الدخول.');
      return;
    }

    if (foundUser.status === 'suspended') {
      setErrorMessage('تم إيقاف هذا الحساب من قبل مسؤول النظام. يرجى مراجعة الإدارة.');
      return;
    }

    onLoginSuccess(foundUser);
  };

  const handleQuickLogin = (demoUsername: string, demoPass: string) => {
    setUsername(demoUsername);
    setPassword(demoPass);
    setErrorMessage(null);
    const foundUser = users.find(
      u => u.username.toLowerCase() === demoUsername.toLowerCase() && u.password === demoPass
    );
    if (foundUser) {
      onLoginSuccess(foundUser);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden" dir="rtl">
      {/* Background Decorative Lighting */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="w-full max-w-md space-y-4 relative z-10">
        {/* Top Motivational Marketing Slogan */}
        <div className="bg-gradient-to-r from-amber-500/10 via-blue-500/15 to-indigo-500/15 border border-amber-500/30 rounded-2xl p-3 text-center shadow-lg shadow-black/20 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1.5 text-amber-300 text-xs font-bold mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>«استثمر بذكاء.. واصنع قصة نجاحك العقارية اليوم»</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed">
            المنصة المتكاملة لإغلاق الصفقات بفاعلية، وخدمة العملاء بأعلى معايير الاحترافية والريادة
          </p>
        </div>

        {/* Brand Header with Company Logo */}
        <div className="text-center space-y-2 mb-2">
          <div className="inline-flex items-center justify-center p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/50 backdrop-blur-md">
            <BarqLogo variant="full" size="lg" theme="dark" showSubtitle={true} />
          </div>
          <p className="text-xs text-slate-400">
            نظام إدارة العقارات والعملاء ومطابقة العروض والطلبات
          </p>
        </div>

        {/* 1. Staff & Users Login Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden backdrop-blur-md">
          <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <KeyRound className="w-4 h-4 text-blue-400" />
              <h2 className="text-sm font-bold text-white">تسجيل دخول المستخدمين</h2>
            </div>
            <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-md font-semibold border border-blue-500/30">
              المسؤول والمسوقون
            </span>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                اسم المستخدم للدخول (Username)
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin أو اسم المستخدم الخاص بك"
                  className="w-full text-xs pr-9 pl-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Secret Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">
                  الرقم السري الممنوح من المسؤول
                </label>
                <span className="text-[10px] text-slate-500">خاص بكل مستخدم</span>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="أدخل الرقم السري"
                  className="w-full text-xs pr-9 pl-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-white placeholder:text-slate-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono tracking-wider"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 p-0.5"
                  title={showPassword ? 'إخفاء' : 'إظهار'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Admin password creation notice */}
            <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <span>
                الحسابات وأرقام المرور السرية يتم إنشاؤها وتسليمها حصراً من قبل مسؤول النظام (Admin).
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm shadow-md shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              <span>تسجيل الدخول للنظام</span>
            </button>

            {/* Quick Demo Login Badges for testing */}
            <div className="pt-2 border-t border-slate-800/80">
              <span className="text-[11px] text-slate-500 block mb-2 text-center font-medium">
                حسابات تجريبية سريعة للاختبار:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickLogin('admin', '123')}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
                  title="دخول بحساب المسؤول العام (admin / 123)"
                >
                  <span>👑 كمسؤول</span>
                  <span className="text-[10px] text-slate-500 font-mono">(admin/123)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickLogin('saad', '123')}
                  className="py-1.5 px-2 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white text-[11px] font-semibold transition-all flex items-center justify-center gap-1.5"
                  title="دخول بحساب مسوق عقاري (saad / 123)"
                >
                  <span>👤 كمسوق</span>
                  <span className="text-[10px] text-slate-500 font-mono">(saad/123)</span>
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* 2. THE REQUESTED CLIENT ENTRY SECTION UNDER LOGIN */}
        {/* "واجعل خانة تحت تسجيل الدخول دخول العملاء لتعبئة طلباتهم و أسمائهم و خيارهم" */}
        <div className="bg-gradient-to-br from-slate-900 to-blue-950/80 border-2 border-blue-600/40 rounded-2xl p-5 shadow-xl text-right relative overflow-hidden transition-all hover:border-blue-500/60">
          <div className="flex items-start justify-between gap-3 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded-md border border-blue-800/60">
                  بوابة العملاء الكرام
                </span>
                <h3 className="text-sm font-bold text-white mt-0.5">
                  دخول العملاء لتعبئة وتقديم طلب عقاري
                </h3>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-3.5">
            هل تبحث عن عقار للشراء أو الاستئجار؟ تفضل بالدخول لتسجيل اسمك ورقمك وتحديد خياراتك وميزانيتك، وسيقوم نظامنا بمطابقة طلبك فوراً وتزويدك بالعروض المناسبة.
          </p>

          <button
            type="button"
            id="btn-client-entry-portal"
            onClick={() => setIsClientModalOpen(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 group"
          >
            <span>دخول العميل وتعبئة الطلب العقاري الآن</span>
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Footer Note */}
        <div className="text-center text-[11px] text-slate-500">
          شركة برق العقارية (BARQ REAL ESTATE) • متوافق مع معايير الهيئة العامة للعقار (فال)
        </div>
      </div>

      {/* Client Request Modal */}
      <ClientRequestModal
        isOpen={isClientModalOpen}
        onClose={() => setIsClientModalOpen(false)}
        onSubmitRequest={onSubmitClientRequest}
        properties={properties}
        onViewProperty={onViewProperty}
      />
    </div>
  );
};
