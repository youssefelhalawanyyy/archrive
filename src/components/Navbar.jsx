import React, { useState, useEffect } from 'react';
import {
  Search,
  Mic,
  Archive,
  Building2,
  ChevronDown,
  Download,
  Menu,
  Sparkles,
  QrCode,
  FileSpreadsheet,
  Wifi,
  WifiOff,
  LogOut,
  ShieldCheck
} from 'lucide-react';
import OmniSearchDropdown from './OmniSearchDropdown';

export default function Navbar({
  searchQuery,
  setSearchQuery,
  docsCount = 0,
  syncStatus = 'synced',
  offlineQueueCount = 0,
  onToggleMobileMenu,
  onTriggerInstall,
  onOpenQRModal,
  onOpenExcel,
  onOpenExportExcel,
  onOpenOfflineModal,
  currentUser = null,
  onLogout = null,
  chapters = [],
  binders = [],
  separators = [],
  onNavigateToItem = null,
  onInspectItem = null
}) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
    const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
    setIsStandalone(standalone);
  }, []);

  const handleToggleVoiceSearch = () => {
    if (!speechSupported) {
      alert("خاصية البحث الصوتي غير مدعومة في هذا المتصفح حالياً. يرجى استخدام متصفح Chrome.");
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'ar-SA';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognition.start();
    } catch (e) {
      setIsListening(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs font-cairo select-none pwa-draggable-header">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-6">

        {/* Right side: Mobile Menu Toggle + Corporate Branding */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 shrink-0 pwa-no-drag">
          {/* Mobile Hamburger Drawer Toggle */}
          <button
            type="button"
            id="mobile-drawer-toggle-btn"
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-lg text-slate-700 hover:bg-slate-100 active:bg-slate-200 transition-colors cursor-pointer"
            aria-label="فتح القائمة الرئيسية"
          >
            <Menu className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Logo Icon */}
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
            <Archive className="w-5 h-5 text-blue-400 stroke-[2.2]" />
          </div>

          {/* Titles */}
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400 inline" />
                شركة المستقبل
              </span>
              <span className="text-slate-300 hidden sm:inline">•</span>
              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">نظام الأرشفة الميداني</span>
            </div>
            <h1 className="text-xs sm:text-base font-extrabold text-slate-900 leading-tight">
              نظام أرشفة الملفات والوثائق
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar (Hidden on ultra-small if collapsed, or full) */}
        <div className="hidden sm:block flex-1 max-w-xl pwa-no-drag">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              id="global-archive-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكود الفاصل، اسم المجلد، عنوان الموضوع..."
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-3 focus:ring-blue-100 transition-all outline-hidden shadow-2xs font-medium"
            />

            {/* Mic Search */}
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center">
              <button
                type="button"
                id="voice-search-trigger"
                onClick={handleToggleVoiceSearch}
                title={isListening ? "جاري الاستماع... اضغط للإيقاف" : "بحث صوتي باللغة العربية"}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${isListening
                  ? "bg-red-500 text-white animate-pulse"
                  : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                  }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Desktop OmniSearch Live Dropdown */}
            <OmniSearchDropdown
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              chapters={chapters}
              binders={binders}
              separators={separators}
              onSelectItem={(item) => {
                if (onNavigateToItem) onNavigateToItem(item);
              }}
              onInspectItem={(item) => {
                if (onInspectItem) onInspectItem(item);
              }}
            />
          </div>
        </div>

        {/* Left side: Quick QR Scan + Cloud Sync Status + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pwa-no-drag">

          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="البحث في الأرشيف"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick QR Scan Button */}
          {onOpenQRModal && (
            <button
              type="button"
              onClick={onOpenQRModal}
              title="مسح كود QR ميدانياً"
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs hover:shadow-xs active:scale-95"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline font-bold">مسح كود QR</span>
            </button>
          )}

          {/* Cloud sync status tag */}
          <button
            type="button"
            id="navbar-sync-status-btn"
            onClick={onOpenOfflineModal}
            title="انقر لفتح مركز المزامنة وإدارة العمليات المعلقة"
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border border-slate-200/80 transition-all cursor-pointer hover:shadow-2xs active:scale-95 bg-white"
          >
            {syncStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-amber-700">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span>جاري الحفظ...</span>
              </div>
            ) : syncStatus === 'offline' ? (
              <div className="flex items-center gap-1.5 text-amber-700">
                <WifiOff className="w-3.5 h-3.5 text-amber-600" />
                <span>أوفلاين</span>
                {offlineQueueCount > 0 && (
                  <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-md text-[10px] font-mono font-bold">
                    {offlineQueueCount}
                  </span>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-700">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-[11px] font-semibold text-slate-600">متصل بالسحابة</span>
                <span className="px-1.5 py-0.2 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/70 hidden xl:inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  الباقة المجانية: آمن 100%
                </span>
              </div>
            )}
          </button>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs border border-slate-700">
                {currentUser?.displayName ? currentUser.displayName[0] : (currentUser?.email ? currentUser.email[0].toUpperCase() : 'أ')}
              </div>

              <div className="hidden xl:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'Admin')}
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  {currentUser?.role || 'أمين الأرشيف الرئيسي'}
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div
                className="absolute left-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 font-cairo"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">المستخدم الإداري النشط</p>
                  <p className="text-xs font-bold text-slate-900">
                    {currentUser?.displayName || 'Admin'}
                  </p>
                  <p className="text-[10px] text-blue-600 font-semibold font-mono truncate">
                    {currentUser?.email || 'archive@organization.gov'}
                  </p>
                </div>
                <div className="py-1 text-xs text-slate-600">
                  <div className="px-3.5 py-1.5 flex items-center justify-between">
                    <span>صلاحية النظام:</span>
                    <span className="font-semibold text-slate-900">مدير كامل (Admin)</span>
                  </div>
                  <div className="px-3.5 py-1.5 flex items-center justify-between">
                    <span>قاعدة البيانات:</span>
                    <span className="font-bold text-emerald-700">Firebase Firestore</span>
                  </div>
                  <div className="px-3.5 py-1.5 flex items-center justify-between">
                    <span>إجمالي الفواصل:</span>
                    <span className="font-bold text-slate-900">{docsCount} فاصل</span>
                  </div>
                  <div className="p-2 border-t border-slate-100 mt-1 space-y-1">
                    {onOpenExcel && (
                      <button
                        type="button"
                        id="user-menu-excel-import"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenExcel();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold flex items-center justify-between hover:bg-emerald-100 transition-colors cursor-pointer"
                      >
                        <span className="flex items-center gap-1.5">
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                          <span>إيداع فواصل (Excel)</span>
                        </span>
                        <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-mono">مجمع</span>
                      </button>
                    )}
                    {onOpenExportExcel && (
                      <button
                        type="button"
                        id="user-menu-excel-export"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenExportExcel();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
                      >
                        <span className="flex items-center gap-1.5">
                          <Download className="w-3.5 h-3.5 text-slate-600" />
                          <span>تصدير الأرشيف بالكامل</span>
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">.xlsx</span>
                      </button>
                    )}
                    {onOpenOfflineModal && (
                      <button
                        type="button"
                        id="user-menu-offline-sync"
                        onClick={() => {
                          setShowUserMenu(false);
                          onOpenOfflineModal();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-lg bg-slate-50 text-slate-800 text-xs font-bold flex items-center justify-between hover:bg-slate-100 transition-colors cursor-pointer border border-slate-200/60"
                      >
                        <span className="flex items-center gap-1.5">
                          <Wifi className="w-3.5 h-3.5 text-blue-600" />
                          <span>مركز المزامنة والأوفلاين</span>
                        </span>
                        <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
                          {offlineQueueCount > 0 ? `${offlineQueueCount} معلق` : 'نشط'}
                        </span>
                      </button>
                    )}
                  </div>
                  {!isStandalone && (
                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowUserMenu(false);
                          if (onTriggerInstall) onTriggerInstall();
                        }}
                        className="w-full py-2 px-2.5 rounded-lg bg-blue-50 text-blue-800 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>تثبيت التطبيق على الجهاز</span>
                      </button>
                    </div>
                  )}

                  {onLogout && (
                    <div className="p-2 border-t border-slate-100 mt-1">
                      <button
                        type="button"
                        id="user-menu-logout-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowUserMenu(false);
                          onLogout();
                        }}
                        className="w-full py-2 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer border border-rose-200/70"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>تسجيل الخروج وإنهاء الجلسة</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Mobile Expandable Search Bar */}
      {isMobileSearchOpen && (
        <div className="sm:hidden px-4 pb-3 pt-1 border-t border-slate-100 bg-slate-50/80 animate-in slide-in-from-top-1">
          <div className="relative">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكود الفاصل، اسم المجلد، الموضوع..."
              autoFocus
              className="w-full pl-9 pr-9 py-2 bg-white text-xs text-slate-800 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 left-0 pl-2.5 flex items-center text-slate-400 hover:text-slate-600 text-xs"
              >
                مسح
              </button>
            )}

            {/* Mobile OmniSearch Live Dropdown */}
            <OmniSearchDropdown
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              chapters={chapters}
              binders={binders}
              separators={separators}
              onSelectItem={(item) => {
                setIsMobileSearchOpen(false);
                if (onNavigateToItem) onNavigateToItem(item);
              }}
              onInspectItem={(item) => {
                if (onInspectItem) onInspectItem(item);
              }}
              onClose={() => setIsMobileSearchOpen(false)}
            />
          </div>
        </div>
      )}
    </header>
  );
}
