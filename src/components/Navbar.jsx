import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  Archive, 
  Building2, 
  ChevronDown, 
  ShieldCheck,
  CheckCircle2,
  Command
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  docsCount = 0,
  syncStatus = 'synced'
}) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
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
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 px-6 py-2.5 shadow-2xs font-cairo">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
        
        {/* Right side (RTL): Corporate Branding */}
        <div className="flex items-center gap-3.5 shrink-0">
          <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
            <Archive className="w-5 h-5 text-blue-400 stroke-[2.2]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Building2 className="w-3 h-3 text-slate-400 inline" />
                شركة المستقبل
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-semibold text-slate-500">نظام الأرشفة الميداني</span>
            </div>
            <h1 className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight">
              نظام أرشفة الملفات والوثائق الورقية
            </h1>
          </div>
        </div>

        {/* Center: Sleek Global Search Bar */}
        <div className="flex-1 max-w-xl">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-600 transition-colors">
              <Search className="w-4 h-4" />
            </div>

            <input
              type="text"
              id="global-archive-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بكود الفاصل، اسم المجلد، عنوان الموضوع، أو اسم العميل..."
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

        {/* Left side: System status & User Profile */}
        <div className="flex items-center gap-3 shrink-0">
          
          {/* Cloud sync status tag */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all">
            {syncStatus === 'saving' ? (
              <div className="flex items-center gap-1.5 text-amber-800 bg-amber-50">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
                <span className="font-bold">جاري الحفظ في Firebase...</span>
              </div>
            ) : syncStatus === 'offline' ? (
              <div className="flex items-center gap-1.5 text-slate-600 bg-slate-100">
                <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                <span>وضع محلي (أوفلاين)</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-emerald-800 bg-emerald-50/80">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_6px_#10b981]"></span>
                <span className="font-bold">Firebase متصل • حفظ تلقائي</span>
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
              className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 transition-colors text-right cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                أ
              </div>

              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-900 leading-tight">
                  أحمد الشريف
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  أمين الأرشيف العام
                </div>
              </div>

              <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
            </button>

            {showUserMenu && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-50 animate-in fade-in slide-in-from-top-1 font-cairo"
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
                    <span>حالة المزامنة:</span>
                    <span className="font-bold text-slate-900 font-mono text-[11px]">حفظ سحابي فوري</span>
                  </div>
                  <div className="px-3.5 py-1.5 flex items-center justify-between border-t border-slate-100 mt-1 pt-1.5">
                    <span>إجمالي الفواصل:</span>
                    <span className="font-bold text-slate-900">{docsCount} فاصل</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>
    </header>
  );
}
