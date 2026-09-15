import React from 'react';
import { TabType, CurrentUserRole, UserAccount } from '../types';
import { BarqLogo } from './BarqLogo';
import { 
  Building2, 
  Users, 
  Sparkles, 
  CalendarDays, 
  BarChart3, 
  Download, 
  RotateCcw,
  X,
  FileSpreadsheet,
  CheckCircle2,
  Clock,
  Layers,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  ArrowLeftRight,
  KeyRound,
  LogOut,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface SidebarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  propertiesCount: number;
  clientsCount: number;
  marketersCount?: number;
  usersCount?: number;
  matchedCount: number;
  appointmentsCount: number;
  onResetData: () => void;
  onExportData: () => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  currentUserRole?: CurrentUserRole;
  currentUser?: UserAccount | null;
  isAdminAuthenticated?: boolean;
  users?: UserAccount[];
  onSwitchEmployee?: (user: UserAccount) => void;
  onReturnToAdmin?: () => void;
  onToggleUserRole?: () => void;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  propertiesCount,
  clientsCount,
  marketersCount = 0,
  usersCount = 0,
  matchedCount,
  appointmentsCount,
  onResetData,
  onExportData,
  isMobileOpen,
  setIsMobileOpen,
  currentUserRole = 'admin',
  currentUser,
  isAdminAuthenticated = true,
  users = [],
  onSwitchEmployee,
  onReturnToAdmin,
  onToggleUserRole,
  onLogout,
}) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const navItemsPrimary = [
    {
      id: 'stats' as TabType,
      label: 'لوحة التحكم',
      icon: BarChart3,
      count: null,
    },
    {
      id: 'properties' as TabType,
      label: 'قائمة العقارات',
      icon: Building2,
      count: propertiesCount,
    },
    {
      id: 'map' as TabType,
      label: 'خريطة العقارات 🗺️',
      icon: MapPin,
      count: propertiesCount,
    },
    {
      id: 'clients' as TabType,
      label: 'قاعدة العملاء',
      icon: Users,
      count: clientsCount,
    },
    {
      id: 'marketers' as TabType,
      label: 'إدارة المسوقين',
      icon: UserCheck,
      count: marketersCount,
    },
    ...(currentUserRole === 'admin' ? [
      {
        id: 'users' as TabType,
        label: 'المستخدمون والأرقام السرية',
        icon: KeyRound,
        count: usersCount,
      }
    ] : []),
  ];

  const navItemsSecondary = [
    {
      id: 'matching' as TabType,
      label: 'المطابقة الذكية',
      icon: Sparkles,
      count: matchedCount,
      highlight: true,
    },
    {
      id: 'appointments' as TabType,
      label: 'المعاينات والمواعيد',
      icon: CalendarDays,
      count: appointmentsCount,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 right-0 z-50 w-64 bg-[#98a890] dark:bg-slate-900 text-slate-900 dark:text-slate-300 border-l border-[#86977e] dark:border-slate-800 flex flex-col flex-shrink-0 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 text-slate-950 dark:text-white flex items-center justify-between border-b border-[#86977e] dark:border-slate-800 flex-shrink-0 bg-[#8c9c84]/90 dark:bg-slate-950/40">
          <BarqLogo theme={darkMode ? 'dark' : 'light'} size="md" variant="horizontal" />

          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden text-slate-700 hover:text-slate-950 dark:text-slate-400 dark:hover:text-white p-1.5 rounded-lg hover:bg-[#86977e] dark:hover:bg-slate-800 transition-colors"
            aria-label="إغلاق القائمة"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sections */}
        <nav className="flex-1 py-4 overflow-y-auto space-y-6 px-3">
          {/* Section 1: Main */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider">
              الرئيسية
            </div>
            <div className="space-y-1 mt-1">
              {navItemsPrimary.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all text-right ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-900 dark:text-slate-300 hover:bg-[#889880] dark:hover:bg-slate-800/60 hover:text-white dark:hover:text-white font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-blue-700/80 text-white'
                            : 'bg-[#82927a] dark:bg-slate-800 text-white dark:text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Transactions & Opportunities */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider border-t border-[#86977e] dark:border-slate-800 pt-4">
              المعاملات والتنفيذ
            </div>
            <div className="space-y-1 mt-1">
              {navItemsSecondary.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    id={`sidebar-nav-${item.id}`}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm transition-all text-right ${
                      isActive
                        ? 'bg-blue-600 text-white font-bold shadow-xs'
                        : 'text-slate-900 dark:text-slate-300 hover:bg-[#889880] dark:hover:bg-slate-800/60 hover:text-white dark:hover:text-white font-semibold'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-800 dark:text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.count !== null && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          isActive
                            ? 'bg-blue-700/80 text-white'
                            : item.highlight && item.count > 0
                            ? 'bg-amber-200/90 text-amber-950 border border-amber-300 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30'
                            : 'bg-[#82927a] dark:bg-slate-800 text-white dark:text-slate-400'
                        }`}
                      >
                        {item.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick System Tools & Theme */}
          <div>
            <div className="px-3 py-1.5 text-xs font-bold text-slate-800 dark:text-slate-400 uppercase tracking-wider border-t border-[#86977e] dark:border-slate-800 pt-4">
              المظهر والبيانات
            </div>
            <div className="space-y-1 mt-1">
              <button
                id="sidebar-btn-theme-toggle"
                onClick={toggleDarkMode}
                className="w-full flex items-center justify-between px-3.5 py-2 rounded-lg text-xs text-slate-900 dark:text-slate-300 hover:text-white dark:hover:text-white hover:bg-[#889880] dark:hover:bg-slate-800/80 transition-colors text-right font-semibold"
              >
                <div className="flex items-center gap-3">
                  {darkMode ? (
                    <Sun className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                  ) : (
                    <Moon className="w-3.5 h-3.5 text-blue-700 dark:text-blue-400" />
                  )}
                  <span>{darkMode ? 'الوضع النهاري (فاتح)' : 'الوضع الليلي (شاشة داكنة)'}</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                  darkMode ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-[#82927a] dark:bg-slate-800 text-white dark:text-slate-400'
                }`}>
                  {darkMode ? 'داكن ✓' : 'فاتح'}
                </span>
              </button>

              <button
                id="sidebar-btn-export"
                onClick={onExportData}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-slate-900 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-[#889880] dark:hover:bg-slate-800/60 transition-colors text-right font-medium"
              >
                <Download className="w-3.5 h-3.5 opacity-80" />
                <span>تصدير نسخة احتياطية (JSON)</span>
              </button>

              <button
                id="sidebar-btn-reset"
                onClick={onResetData}
                className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-xs text-slate-900 dark:text-slate-400 hover:text-white dark:hover:text-white hover:bg-[#889880] dark:hover:bg-slate-800/60 transition-colors text-right font-medium"
              >
                <RotateCcw className="w-3.5 h-3.5 opacity-80" />
                <span>استعادة البيانات النموذجية</span>
              </button>
            </div>
          </div>
        </nav>

        {/* User profile footer with Role Display & Switcher */}
        <div className="p-3.5 border-t border-[#86977e] dark:border-slate-800 bg-[#8c9c84]/95 dark:bg-slate-900/80 flex-shrink-0 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#7e8e76] dark:bg-slate-800 text-white dark:text-slate-200 flex items-center justify-center font-bold text-xs border border-[#718069] dark:border-slate-700 shrink-0">
                {currentUser ? currentUser.name.slice(0, 2) : 'م ش'}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-950 dark:text-white truncate">
                  {currentUser ? currentUser.name : 'معتز الشريف'}
                </div>
                <div className="text-[11px] text-slate-800 dark:text-slate-400 truncate font-medium">
                  {currentUserRole === 'admin' ? 'مدير عام (مسؤول)' : 'موظف / مسوق'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                currentUserRole === 'admin' 
                  ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-500/40' 
                  : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-500/40'
              }`}>
                {currentUserRole === 'admin' ? '👑 مسؤول' : '👤 موظف'}
              </span>

              {onLogout && (
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-1.5 rounded-lg text-rose-700 dark:text-rose-300 hover:text-rose-900 dark:hover:text-white bg-rose-100 dark:bg-rose-950/40 hover:bg-rose-200 dark:hover:bg-rose-900/70 border border-rose-200 dark:border-rose-800/50 transition-colors"
                  title="تسجيل الخروج من الحساب"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" />
                </button>
              )}
            </div>
          </div>

          {/* خانة تبديل الموظف (تظهر حصرياً للمسؤول) */}
          {isAdminAuthenticated ? (
            <div className="pt-2 border-t border-[#86977e] dark:border-slate-800/80 space-y-2 bg-[#86967e]/90 dark:bg-slate-950/40 -mx-3.5 -mb-3.5 p-3 rounded-b-xl">
              <div className="flex items-center justify-between text-[11px]">
                <span className="flex items-center gap-1.5 font-bold text-slate-950 dark:text-blue-400">
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>خانة تبديل الموظف</span>
                </span>
                <span className="text-[9px] font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-800/50">
                  خاص بالمسؤول فقط
                </span>
              </div>

              {/* قائمة اختيار الموظف للتبديل السريع */}
              {users && users.length > 0 && onSwitchEmployee && (
                <div className="space-y-1">
                  <label htmlFor="sidebar-employee-select" className="block text-[10px] text-slate-900 dark:text-slate-400 font-medium">
                    اختر الحساب للمعاينة:
                  </label>
                  <select
                    id="sidebar-employee-select"
                    value={currentUser?.id || ''}
                    onChange={(e) => {
                      const selected = users.find(u => u.id === e.target.value);
                      if (selected) {
                        onSwitchEmployee(selected);
                      }
                    }}
                    className="w-full text-xs bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-[#7e8e76] dark:border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.role === 'admin' ? '👑 مسؤول: ' : '👤 موظف: '}
                        {u.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* زر العودة للمسؤول أو التبديل السريع */}
              {currentUserRole !== 'admin' && onReturnToAdmin ? (
                <button
                  type="button"
                  onClick={onReturnToAdmin}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-[11px] font-bold bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-500/50 transition-all shadow-xs"
                  title="العودة لحساب المسؤول العام"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>العودة لحساب المسؤول 👑</span>
                </button>
              ) : onToggleUserRole ? (
                <button
                  type="button"
                  onClick={onToggleUserRole}
                  className="w-full flex items-center justify-center gap-1.5 py-1 px-2 rounded-lg text-[10px] font-medium bg-[#7e8e76] hover:bg-[#72826a] dark:bg-slate-800 dark:hover:bg-slate-700 text-white dark:text-slate-300 hover:text-white dark:hover:text-white transition-all border border-[#718069] dark:border-slate-700/60"
                  title="تبديل الصلاحية لمعاينة وضع الموظف"
                >
                  <ArrowLeftRight className="w-3 h-3 text-white dark:text-blue-400" />
                  <span>تبديل إلى وضع الموظف (معاينة)</span>
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </aside>
    </>
  );
};
