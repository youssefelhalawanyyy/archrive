import React, { useState, useEffect } from 'react';
import { 
  Download, 
  X, 
  Share, 
  PlusSquare, 
  CheckCircle2, 
  Smartphone, 
  Laptop, 
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function InstallPWABanner({ isTriggeredManually = false, onCloseManual = null }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMacOrWindows, setIsMacOrWindows] = useState(false);
  const [showBanner, setShowBanner] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // 1. Check if running in standalone mode (already installed)
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      window.navigator.standalone === true;
    
    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // 2. Detect platform
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !window.MSStream;
    setIsIOS(isIOSDevice);

    const isDesktop = /macintosh|mac os x|windows nt|linux/.test(ua) && !/android/.test(ua);
    setIsMacOrWindows(isDesktop);

    // 3. Listen for standard PWA install prompt (Chrome, Edge, Android, Desktop)
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Check if user dismissed banner recently
      const dismissed = localStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        setShowBanner(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // 4. Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowBanner(false);
      setDeferredPrompt(null);
      localStorage.setItem('pwa_banner_dismissed', 'true');
    };

    window.addEventListener('appinstalled', handleAppInstalled);

    // If on iOS and not dismissed, show banner after brief delay
    if (isIOSDevice && !isStandalone) {
      const dismissed = localStorage.getItem('pwa_banner_dismissed');
      if (!dismissed) {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // When triggered manually from Navbar
  useEffect(() => {
    if (isTriggeredManually) {
      if (isIOS) {
        setShowIOSModal(true);
      } else if (deferredPrompt) {
        handleInstallClick();
      } else {
        // Show banner or prompt
        setShowBanner(true);
      }
    }
  }, [isTriggeredManually]);

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }

    if (!deferredPrompt) {
      // Fallback instruction for desktop Chrome/Edge or Safari Sonoma
      alert("لتثبيت التطبيق على جهازك:\n- على متصفح Chrome أو Edge: اضغط على أيقونة التثبيت ⊕ في شريط العنوان بالأعلى.\n- على Mac Safari: اختر 'ملف' ثم 'إضافة إلى Dock'.");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } catch (err) {
      console.warn('Install prompt error:', err);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_banner_dismissed', 'true');
    if (onCloseManual) onCloseManual();
  };

  // Don't render if already in standalone app
  if (isInstalled && !isTriggeredManually) {
    return null;
  }

  return (
    <>
      {/* 1. Floating Smart Install Banner (Mobile & Desktop) */}
      {showBanner && !isInstalled && (
        <div 
          role="region" 
          aria-label="تثبيت تطبيق الأرشيف الذكي" 
          className="fixed bottom-20 md:bottom-5 left-4 right-4 md:left-auto md:right-6 md:max-w-md z-50 bg-slate-900/95 backdrop-blur-md text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 font-cairo"
        >
          <div className="flex items-start gap-3.5">
            {/* App Icon */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shrink-0 shadow-md">
              <img 
                src="/icons/icon-192.png" 
                alt="أيقونة الأرشيف" 
                className="w-full h-full object-cover rounded-[10px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  تطبيق PWA مثبت
                </span>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
                  aria-label="إغلاق التنبيه"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-sm font-black text-white mt-1">
                تثبيت «الأرشيف الذكي» على جهازك
              </h3>
              <p className="text-xs text-slate-300 mt-0.5 leading-relaxed">
                {isIOS 
                  ? 'ثبّت التطبيق على الآيفون للوصول السريع بدون متجر تطبيقات وبتجربة كاملة الشاشة.'
                  : isMacOrWindows
                  ? 'ثبّت التطبيق كبرنامج مستقل على سطح المكتب للكمبيوتر (Mac / Windows).'
                  : 'تطبيق خفيف وسريع يعمل دون اتصال بالإنترنت مع حفظ تلقائي فوري.'
                }
              </p>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3">
                <button
                  type="button"
                  id="pwa-install-banner-confirm-btn"
                  onClick={handleInstallClick}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black shadow-md transition-all cursor-pointer active:scale-98"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isIOS ? 'طريقة التثبيت على آيفون' : 'تثبيت التطبيق الآن'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDismiss}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                >
                  لاحقاً
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. iOS Safari Visual Installation Modal */}
      {showIOSModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4 animate-in fade-in font-cairo"
          onClick={() => {
            setShowIOSModal(false);
            if (onCloseManual) onCloseManual();
          }}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md p-5 shadow-2xl border border-slate-200 animate-in slide-in-from-bottom-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900">
                    تثبيت التطبيق على آيفون وآيباد
                  </h3>
                  <p className="text-[11px] text-slate-500">متصفح Safari</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  if (onCloseManual) onCloseManual();
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3.5 text-xs text-slate-700">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold font-mono">
                  1
                </div>
                <div>
                  <p className="font-bold text-slate-900">اضغط على زر المشاركة (Share)</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    في شريط Safari بالأسفل اضغط أيقونة 
                    <span className="inline-flex items-center justify-center p-1 bg-white border border-slate-200 rounded text-blue-600 font-bold mx-0.5">
                      <Share className="w-3.5 h-3.5" />
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold font-mono">
                  2
                </div>
                <div>
                  <p className="font-bold text-slate-900">اختر "إضافة إلى الشاشة الرئيسية"</p>
                  <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                    مرر للأسفل واضغط على 
                    <span className="inline-flex items-center gap-1 p-1 bg-white border border-slate-200 rounded font-semibold text-slate-800 mx-0.5">
                      <PlusSquare className="w-3.5 h-3.5 text-slate-600" />
                      إضافة إلى الشاشة الرئيسية
                    </span>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 font-bold font-mono">
                  3
                </div>
                <div>
                  <p className="font-bold text-slate-900">اضغط "إضافة" (Add) في الزاوية العلوية</p>
                  <p className="text-slate-500 mt-0.5">
                    سيظهر تطبيق «الأرشيف الذكي» على شاشة هاتفك مباشرة كتطبيق مستقل بكامل المميزات.
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowIOSModal(false);
                  if (onCloseManual) onCloseManual();
                }}
                className="w-full py-2.5 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                فهمت ذلك، شكراً
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
