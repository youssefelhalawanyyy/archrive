import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Mic, 
  MicOff, 
  Archive, 
  Bell, 
  Sparkles, 
  Wifi, 
  User, 
  ChevronDown, 
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  onOpenAddModal, 
  docsCount = 0,
  isFirestoreSyncing = false 
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
      alert("خاصية البحث الصوتي غير مدعومة في هذا المتصفح حالياً. يرجى استخدام متصفح Chrome أو كتابة نص البحث.");
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

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSearchQuery(transcript);
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 py-3.5 shadow-xs transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        
        {/* Right side (RTL): Branding & Title */}
        <div className="flex items-center gap-3.5 min-w-fit">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-md shadow-brand-500/20 ring-2 ring-brand-500/30">
            <Archive className="w-6 h-6 stroke-[2.2]" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
                <Building2 className="w-3 h-3" />
                شركة المستقبل
              </span>
              <span className="text-xs text-slate-600 hidden sm:inline-block">| الأرشيف الورقي</span>
            </div>
            <h1 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-cairo">
              نظام أرشفة الملفات الذكي
            </h1>
          </div>
        </div>

        {/* Center: Global Search Bar with Microphone */}
        <div className="flex-1 max-w-2xl mx-2">
          <div className="relative group">
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-600 group-focus-within:text-brand-600 transition-colors">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              id="global-archive-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث عن وثيقة، ملف، أو عميل..."
              className="w-full pl-12 pr-11 py-2.5 bg-slate-100/80 hover:bg-slate-100 focus:bg-white text-sm text-slate-800 placeholder-slate-600 rounded-xl border border-slate-200 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15 transition-all outline-hidden font-cairo"
            />

            {/* Microphone Button for Voice Search */}
            <div className="absolute inset-y-0 left-0 pl-1.5 flex items-center">
              <button
                type="button"
                id="voice-search-trigger"
                onClick={handleToggleVoiceSearch}
                title={isListening ? "جاري الاستماع... اضغط للإيقاف" : "بحث صوتي سريع (اضغط وتحدث)"}
                className={`p-2 rounded-lg transition-all ${
                  isListening
                    ? "bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30"
                    : "text-slate-600 hover:text-brand-600 hover:bg-slate-200/70"
                }`}
              >
                {isListening ? (
                  <Mic className="w-4 h-4 animate-bounce" />
                ) : (
                  <Mic className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          {isListening && (
            <div className="absolute mt-1 text-xs text-red-600 font-medium animate-pulse flex items-center gap-1.5 bg-red-50 px-3 py-1 rounded-md border border-red-200">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
              جاري الاستماع لصوتك باللغة العربية... تحدث الآن للبحث عن أي وثيقة
            </div>
          )}
        </div>

        {/* Left side: Sync Badge & User Profile */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-fit">
          {/* Cloud sync indicator */}
          <div 
            title="حالة المزامنة السحابية مع Firebase"
            className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/80"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Firebase متصل</span>
          </div>

          {/* User Profile on the left (as requested: Logged-in user name on left: "أحمد") */}
          <div className="relative">
            <button
              type="button"
              id="user-profile-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2.5 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200"
            >
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-700 to-brand-500 text-white flex items-center justify-center font-bold text-sm shadow-xs ring-2 ring-white">
                  أ
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white"></span>
              </div>

              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold text-slate-800 leading-none">
                  أحمد
                </div>
                <div className="text-[11px] text-slate-600 font-medium mt-0.5">
                  مسؤول الأرشيف
                </div>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-600 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {showUserMenu && (
              <div 
                className="absolute left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowUserMenu(false)}
              >
                <div className="px-3.5 py-2 border-b border-slate-100">
                  <p className="text-xs text-slate-600">المستخدم المسجل</p>
                  <p className="text-sm font-bold text-slate-800">أحمد الشريف</p>
                  <p className="text-xs text-brand-600 font-medium">شركة المستقبل - قسم التوثيق</p>
                </div>
                <div className="py-1">
                  <div className="px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>صلاحية النظام:</span>
                    <span className="font-semibold text-emerald-600">مدير كامل (Admin)</span>
                  </div>
                  <div className="px-3.5 py-2 text-xs text-slate-600 flex items-center justify-between">
                    <span>إجمالي الوثائق:</span>
                    <span className="font-bold text-slate-800">{docsCount} وثيقة</span>
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
