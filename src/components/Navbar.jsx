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
  FileSpreadsheet
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  docsCount = 0,
  syncStatus = 'synced',
  onToggleMobileMenu,
  onTriggerInstall,
  onOpenQRModal,
  onOpenExcel,
  onOpenExportExcel
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
              className="w-full pl-10 pr-9 py-2 bg-slate-50 hover:bg-slate-100/70 focus:bg-white text-xs sm:text-sm text-slate-800 placeholder-slate-400 rounded-lg border border-slate-200 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 transition-all outline-hidden"
            />

            {/* Mic Search */}
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center">
              <button
                type="button"
                id="voice-search-trigger"
                onClick={handleToggleVoiceSearch}
                title={isListening ? "جاري الاستماع... اضغط للإيقاف" : "بحث صوتي باللغة العربية"}
                className={`p-1.5 rounded-md transition-all cursor-pointer ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse"
                    : "text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Left side: Install CTA + QR + Sync Status + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 pwa-no-drag">
          
          {/* Mobile Search Toggle Icon */}
          <button
            type="button"
            onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
            className="sm:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="البحث في الأرشيف"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Quick QR Scan Button (Mobile & Desktop) */}
          {onOpenQRModal && (
            <button
              type="button"
              onClick={onOpenQRModal}
              title="مسح كود QR ميدانياً"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-blue-600" />
              <span className="hidden md:inline">مسح كود</span>
            </button>
          )}

          {/* Excel Import / Export & Backup Button */}
          {onOpenExcel && (
            <button
              type="button"
              id="navbar-excel-btn"
              onClick={onOpenExcel}
              title="استيراد وتصدير إكسل ونسخ احتياطي كامل للأرشيف"
              className="p-2 sm:px-3 sm:py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span className="hidden xl:inline">إكسل ونسخ احتياطي</span>
              <span className="hidden sm:inline xl:hidden">إكسل</span>
            </button>
          )}

          {/* PWA Install Button (If not already installed in standalone mode) */}
          {!isStandalone && onTriggerInstall && (
            <button
              type="button"
              id="navbar-install-app-btn"
              onClick={onTriggerInstall}
              title="تثبيت التطبيق على جهازك (كمبيوتر أو هاتف)"
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-black shadow-2xs transition-all cursor-pointer active:scale-95"
            >
              <Download className="w-3.5 h-3.5 animate-bounce" />
              <span className="hidden sm:inline">تثبيت التطبيق</span>
              <span className="sm:hidden text-[11px]">تثبيت</span>
            </button>
          )}

          {/* Cloud sync status tag */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all">
            {syncStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-bold">جاري الحفظ...</span>
              </div>
            ) : syncStatus === 'offline' ? (
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>أوفلاين</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                <span className="font-bold">Firebase متصل</span>
              </div>
            )}
          </div>

          <div className="h-5 w-px bg-slate-200 hidden sm:block"></div>

          {/* User Profile */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-slate-100 transition-colors text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                أ
              </div>

              <div className="hidden xl:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  أحمد الشريف
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  أمين الأرشيف
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 font-cairo"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-[11px] text-slate-400 font-medium">المستخدم الحالي</p>
                  <p className="text-xs font-bold text-slate-900">أحمد الشريف</p>
                  <p className="text-[10px] text-blue-600 font-semibold">شركة المستقبل • قسم التوثيق</p>
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
          </div>
        </div>
      )}
    </header>
  );
}
