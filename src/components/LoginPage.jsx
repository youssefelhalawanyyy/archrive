import React, { useState, useEffect } from 'react';
import { 
  Archive, 
  Building2, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  WifiOff, 
  ArrowLeft,
  Server
} from 'lucide-react';
import { loginWithEmail, sendResetPassword, getIsOnline } from '../services/firebase';

export default function LoginPage({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [isOnlineState, setIsOnlineState] = useState(getIsOnline());
  
  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSubmitting, setResetSubmitting] = useState(false);
  const [resetStatus, setResetStatus] = useState(null);

  useEffect(() => {
    const handleOnline = () => setIsOnlineState(true);
    const handleOffline = () => setIsOnlineState(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.getModifierState && e.getModifierState('CapsLock')) {
      setCapsLockActive(true);
    } else {
      setCapsLockActive(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password.trim()) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني وكلمة المرور للمتابعة.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await loginWithEmail(email, password);
      setSuccessMessage('تم التحقق بنجاح! جاري تفويض الصلاحيات وفتح الأرشيف...');
      setTimeout(() => {
        if (onLoginSuccess) {
          onLoginSuccess(user);
        }
      }, 700);
    } catch (err) {
      setErrorMessage(err.message || 'فشل التحقق من بيانات الدخول.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) {
      setResetStatus({ type: 'error', message: 'يرجى إدخال البريد الإلكتروني أولاً.' });
      return;
    }
    setResetSubmitting(true);
    setResetStatus(null);
    try {
      await sendResetPassword(resetEmail);
      setResetStatus({ 
        type: 'success', 
        message: 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.' 
      });
    } catch (err) {
      setResetStatus({ 
        type: 'error', 
        message: err.message || 'تعذر إرسال الرابط. تأكد من اتصال الإنترنت.' 
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-cairo flex flex-col justify-between selection:bg-blue-600 selection:text-white relative overflow-hidden">
      {/* Radiant Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-gradient-to-b from-blue-600/15 via-blue-900/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-600/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/3 left-0 w-[400px] h-[400px] bg-indigo-600/10 blur-3xl pointer-events-none" />

      {/* Decorative Top Bar */}
      <div className="relative z-10 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-700 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white">
              <Archive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-blue-400" />
                  شركة المستقبل • الأرشيف الميداني
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  بوابة مشفرة معتمدة
                </span>
              </div>
              <h1 className="text-sm font-extrabold text-white">
                نظام أرشفة الملفات والوثائق المؤسسي
              </h1>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800">
              <Server className="w-3.5 h-3.5 text-blue-400" />
              Firebase Cloud Auth
            </span>
            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${isOnlineState ? 'bg-emerald-950/50 border-emerald-800 text-emerald-400' : 'bg-amber-950/50 border-amber-800 text-amber-400'}`}>
              <span className={`w-2 h-2 rounded-full ${isOnlineState ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              {isOnlineState ? 'الشبكة متصلة' : 'وضع الأوفلاين'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Login Center Card */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">
          
          {/* Card Wrapper */}
          <div className="bg-slate-900/90 border border-slate-800/90 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/80 relative">
            
            {/* Header / Security Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 border border-slate-700/80 shadow-inner mb-4 relative group">
                <div className="absolute inset-0 rounded-2xl bg-blue-500/10 blur-sm group-hover:bg-blue-500/20 transition-all" />
                <KeyRound className="w-7 h-7 text-blue-400 relative z-10" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                تسجيل الدخول الإداري
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1.5">
                المنظومة المركزية لإدارة الأرشيف والفواصل الورقية
              </p>
            </div>

            {/* Offline Alert if disconnected */}
            {!isOnlineState && (
              <div className="mb-5 p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-300 text-xs flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 shrink-0 text-amber-400" />
                <span>
                  أنت في وضع عدم الاتصال (باطن الأرض). يمكنك استخدام الحساب الإداري المحفوظ محلياً.
                </span>
              </div>
            )}

            {/* Error Notification */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-rose-950/50 border border-rose-800 text-rose-200 text-xs flex items-start gap-2.5 animate-in fade-in slide-in-from-top-1">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Success Notification */}
            {successMessage && (
              <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-800 text-emerald-200 text-xs flex items-center gap-2.5 animate-in fade-in slide-in-from-top-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 text-right">
                  البريد الإلكتروني الإداري
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    id="login-email-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="username"
                    dir="ltr"
                    placeholder="name@organization.com"
                    className="w-full pr-10 pl-3.5 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-300 text-right">
                    كلمة المرور
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email);
                      setShowForgotModal(true);
                    }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="login-password-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onKeyUp={handleKeyDown}
                    required
                    autoComplete="current-password"
                    dir="ltr"
                    placeholder="••••••••••••"
                    className="w-full pr-10 pl-10 py-2.5 bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 text-xs sm:text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    tabIndex="-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                
                {capsLockActive && (
                  <p className="text-[10px] text-amber-400 mt-1 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    تنبيه: زر تثبيت الحروف الكبيرة (Caps Lock) مفعل
                  </p>
                )}
              </div>

              {/* Remember Me Option */}
              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-700 bg-slate-950 text-blue-600 focus:ring-blue-500 focus:ring-offset-slate-900"
                  />
                  <span>تذكر بيانات الدخول على هذا الجهاز</span>
                </label>
                <span className="text-[10px] text-slate-500">جلسة آمنة ومحمية</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="login-submit-btn"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-sm shadow-lg shadow-blue-600/30 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق من الهوية والأذونات...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>تسجيل الدخول إلى الأرشيف</span>
                  </>
                )}
              </button>
            </form>

            {/* Security Notice */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                تشفير مصرفي TLS 1.3 • معتمد لمعايير حفظ الوثائق السيادية
              </p>
            </div>

          </div>

          {/* Sub-Footer note */}
          <div className="text-center mt-6 text-xs text-slate-500">
            <span>تحتاج لمساعدة في الصلاحيات؟ تواصل مع </span>
            <span className="text-slate-400 font-semibold">إدارة التوثيق ونظم المعلومات</span>
          </div>

        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in font-cairo">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Mail className="w-5 h-5 text-blue-400" />
              إعادة تعيين كلمة المرور
            </h3>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              أدخل البريد الإلكتروني المسجل وسيقوم خادم Firebase بإرسال رابط رسمي آمن لإعادة تعيين كلمة المرور.
            </p>

            {resetStatus && (
              <div className={`p-3 rounded-xl text-xs mb-4 flex items-center gap-2 ${
                resetStatus.type === 'success' 
                  ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-200' 
                  : 'bg-rose-950/60 border border-rose-800 text-rose-200'
              }`}>
                {resetStatus.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                )}
                <span>{resetStatus.message}</span>
              </div>
            )}

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  dir="ltr"
                  placeholder="name@organization.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs font-mono focus:border-blue-500 outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  disabled={resetSubmitting}
                  className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {resetSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  إرسال الرابط
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotModal(false);
                    setResetStatus(null);
                  }}
                  className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sovereign Bottom Footer */}
      <footer className="relative z-10 border-t border-slate-900 bg-slate-950/80 px-6 py-3 text-center text-[11px] text-slate-600">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>نظام الأرشفة الميداني • الإصدار المؤسسي Enterprise v6.0</span>
          <span>جميع الحقوق محفوظة © {new Date().getFullYear()} شركة المستقبل</span>
        </div>
      </footer>

    </div>
  );
}
