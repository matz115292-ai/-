import React from 'react';
import { TabType, CurrentUserRole, UserAccount } from '../types';
import { BarqLogoIcon } from './BarqLogo';
import { useTheme } from '../context/ThemeContext';
import { 
  Menu, 
  Search, 
  Plus, 
  Building2, 
  Users, 
  Sparkles, 
  CalendarDays, 
  BarChart3,
  ChevronDown,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  LogOut,
  KeyRound,
  Sun,
  Moon
} from 'lucide-react';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  globalSearch: string;
  setGlobalSearch: (s: string) => void;
  onNewProperty: () => void;
  onNewClient: () => void;
  onNewMarketer?: () => void;
  onNewUser?: () => void;
  onOpenMobileMenu: () => void;
  currentUserRole?: CurrentUserRole;
  currentUser?: UserAccount | null;
  isAdminAuthenticated?: boolean;
  isCloudSynced?: boolean;
  onReturnToAdmin?: () => void;
  onToggleUserRole?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  globalSearch,
  setGlobalSearch,
  onNewProperty,
  onNewClient,
  onNewMarketer,
  onNewUser,
  onOpenMobileMenu,
  currentUserRole = 'admin',
  currentUser,
  isAdminAuthenticated = true,
  isCloudSynced = true,
  onReturnToAdmin,
  onToggleUserRole,
  onLogout,
}) => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const { darkMode, toggleDarkMode } = useTheme();

  const getTabTitle = () => {
    switch (activeTab) {
      case 'stats':
        return 'لوحة التحكم والمؤشرات';
      case 'properties':
        return 'قائمة العقارات المسجلة';
      case 'clients':
        return 'قاعدة بيانات العملاء';
      case 'marketers':
        return 'إدارة المسوقين العقاريين';
      case 'users':
        return 'إدارة المستخدمين والحسابات';
      case 'matching':
        return 'محرك المطابقة الذكي';
      case 'appointments':
        return 'المعاينات والمواعيد';
      default:
        return 'نظرة عامة';
    }
  };

  return (
    <header className="h-16 bg-[#98a890] dark:bg-slate-900 border-b border-[#86977e] dark:border-slate-800 flex items-center justify-between px-4 sm:px-8 flex-shrink-0 sticky top-0 z-20 transition-colors">
      {/* Left side (in RTL, Right side): Mobile hamburger + Page Title */}
      <div className="flex items-center gap-3">
        <button
          id="btn-toggle-mobile-sidebar"
          onClick={onOpenMobileMenu}
          className="lg:hidden p-2 text-slate-800 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-[#889880] dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="القائمة الجانبية"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo on top bar */}
        <div className="lg:hidden flex items-center gap-2 border-r border-[#86977e] dark:border-slate-700 pr-2">
          <BarqLogoIcon size={26} className="text-slate-900 dark:text-white" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg sm:text-xl font-bold text-slate-950 dark:text-white leading-none">
              {getTabTitle()}
            </h1>
            <span className="hidden xl:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#8a9a82] dark:bg-emerald-950/60 text-slate-900 dark:text-emerald-300 border border-[#7a8a72] dark:border-emerald-800">
              <Sparkles className="w-3 h-3 text-amber-300 dark:text-emerald-400" />
              <span>فرصتك القادمة تبدأ الآن</span>
            </span>
          </div>
          <div className="text-[11px] text-slate-800 dark:text-slate-400 mt-1 hidden sm:block font-medium">
            شركة برق العقارية (BARQ REAL ESTATE) • كل تواصل مع عميل هو فرصة لصناعة صفقة ناجحة
          </div>
        </div>
      </div>

      {/* Right side (in RTL, Left side): Global Search + Primary Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Global Search Input */}
        <div className="relative hidden md:block">
          <Search className="w-4 h-4 text-slate-600 dark:text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
          <input
            id="input-global-search"
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="بحث عن عقار أو عميل أو حي..."
            className="w-48 lg:w-64 bg-white/95 dark:bg-slate-800 border border-[#86977e] dark:border-slate-700 rounded-lg py-1.5 pr-9 pl-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-500 dark:placeholder:text-slate-500 focus:bg-white dark:focus:bg-slate-900 focus:border-blue-600 dark:focus:border-slate-600 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Cloud Sync Status Badge */}
        {isCloudSynced && (
          <div 
            className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-100/90 text-emerald-950 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800 shadow-2xs"
            title="النظام متصل بقاعدة بيانات سحابية مركزية (Firebase Firestore) - أي تعديل تشاهده فوراً بدون تحديث الصفحة"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span>مزامنة سحابية نشطة</span>
          </div>
        )}

        {/* Dark Mode Toggle Button */}
        <button
          type="button"
          id="btn-header-toggle-dark"
          onClick={toggleDarkMode}
          className="p-2 rounded-lg border border-[#86977e] dark:border-slate-700 bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-amber-400 hover:bg-white dark:hover:bg-slate-700 transition-all flex items-center gap-1.5 text-xs font-semibold shadow-2xs cursor-pointer"
          title={darkMode ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن (شاشة داكنة)"}
          aria-label={darkMode ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"}
        >
          {darkMode ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span className="hidden lg:inline text-slate-200 text-[11px]">نهاري</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-blue-700 dark:text-slate-300" />
              <span className="hidden lg:inline text-slate-900 dark:text-slate-300 text-[11px]">داكن</span>
            </>
          )}
        </button>

        {/* Role indicator & test toggle (only if admin is authenticated) */}
        {isAdminAuthenticated ? (
          <button
            type="button"
            id="btn-header-role-toggle"
            onClick={currentUserRole === 'admin' ? onToggleUserRole : (onReturnToAdmin || onToggleUserRole)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              currentUserRole === 'admin'
                ? 'bg-emerald-100/95 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200 dark:hover:bg-emerald-900/80 shadow-2xs'
                : 'bg-amber-100/95 dark:bg-amber-950/60 text-amber-950 dark:text-amber-300 border-amber-300 dark:border-amber-700 hover:bg-amber-200 dark:hover:bg-amber-900/80 shadow-xs ring-1 ring-amber-400/40'
            }`}
            title={currentUserRole === 'admin' ? "تبديل الصلاحية لمعاينة وضع الموظف" : "أنت في وضع معاينة الموظف - اضغط للعودة للمسؤول 👑"}
          >
            {currentUserRole === 'admin' ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400" />
                <span className="hidden md:inline">صلاحية: مسؤول (حذف متاح)</span>
                <span className="md:hidden">مسؤول</span>
              </>
            ) : (
              <>
                <ShieldAlert className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 animate-pulse" />
                <span>معاينة موظف (عودة 👑)</span>
              </>
            )}
          </button>
        ) : (
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white/95 dark:bg-slate-800 text-slate-900 dark:text-slate-300 border border-[#86977e] dark:border-slate-700 cursor-default">
            <UserCheck className="w-3.5 h-3.5 text-slate-700 dark:text-slate-400" />
            <span>موظف وساطة</span>
          </div>
        )}

        {/* Primary Action Button with Split Dropdown */}
        <div className="relative">
          <div className="inline-flex rounded-lg shadow-xs">
            <button
              id="btn-header-add-property"
              onClick={onNewProperty}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-r-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة عقار</span>
            </button>

            <button
              id="btn-header-add-menu-toggle"
              onClick={() => setShowAddMenu(!showAddMenu)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 sm:py-2 rounded-l-lg border-r border-blue-500 text-xs sm:text-sm transition-colors flex items-center"
              aria-label="المزيد من الإضافات"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Dropdown Menu */}
          {showAddMenu && (
            <>
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowAddMenu(false)} 
              />
              <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-100">
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onNewProperty();
                  }}
                  className="w-full text-right px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>تسجيل عقار جديد</span>
                </button>
                <button
                  onClick={() => {
                    setShowAddMenu(false);
                    onNewClient();
                  }}
                  className="w-full text-right px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 transition-colors"
                >
                  <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>تسجيل عميل جديد</span>
                </button>
                {onNewMarketer && (
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      onNewMarketer();
                    }}
                    className="w-full text-right px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <span>إضافة مسوق عقاري</span>
                  </button>
                )}
                {currentUserRole === 'admin' && onNewUser && (
                  <button
                    onClick={() => {
                      setShowAddMenu(false);
                      onNewUser();
                    }}
                    className="w-full text-right px-3 py-2 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 flex items-center gap-2 border-t border-slate-100 dark:border-slate-800 font-semibold transition-colors"
                  >
                    <KeyRound className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span>إنشاء حساب مستخدم جديد</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        {/* User Info & Logout Button */}
        {onLogout && (
          <div className="flex items-center gap-2 pr-1 border-r border-[#dec0a9] dark:border-slate-800">
            {currentUser && (
              <div className="hidden md:flex flex-col text-right">
                <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-600 dark:text-slate-400">
                  {currentUser.role === 'admin' ? '👑 مسؤول النظام' : '👤 مسوق عقاري'}
                </span>
              </div>
            )}
            <button
              type="button"
              id="btn-header-logout"
              onClick={onLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-slate-700 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-400 bg-white hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-950/40 border border-[#dec0a9] dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-2xs"
              title="تسجيل الخروج من الحساب"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">خروج</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
