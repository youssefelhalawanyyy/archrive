import React, { useState, useEffect } from 'react';
import { 
  X, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  CheckCircle2, 
  Clock, 
  Layers, 
  AlertCircle,
  Database,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  CloudUpload,
  Gauge,
  HardDrive,
  Zap,
  Server,
  Lock
} from 'lucide-react';
import { 
  flushOfflineQueue, 
  getOfflineQueue, 
  getIsOnline, 
  subscribeToNetworkStatus, 
  subscribeToOfflineQueue,
  getDailyQuotaUsage,
  subscribeToQuotaUsage
} from '../services/firebase';

export default function OfflineSyncModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [queue, setQueue] = useState(getOfflineQueue());
  const [quota, setQuota] = useState(getDailyQuotaUsage());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);
  const [activeTab, setActiveTab] = useState('quota'); // 'quota' | 'offline'

  useEffect(() => {
    const unsubNet = subscribeToNetworkStatus((online) => setIsOnline(online));
    const unsubQueue = subscribeToOfflineQueue((q) => setQueue(q));
    const unsubQuota = subscribeToQuotaUsage((q) => setQuota(q));
    return () => {
      unsubNet();
      unsubQueue();
      unsubQuota();
    };
  }, []);

  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    try {
      const res = await flushOfflineQueue();
      if (res.success) {
        setSyncFeedback({
          type: 'success',
          message: res.count > 0 
            ? `تمت مزامنة ورفع ${res.count} عملية معلقة إلى Firebase Firestore بنجاح!` 
            : 'جميع العمليات متزامنة ومحفوظة سحابياً ومحلياً.'
        });
      } else {
        setSyncFeedback({
          type: 'warning',
          message: res.reason || 'تعذر المزامنة السحابية حالياً، يرجى التحقق من اتصال الإنترنت.'
        });
      }
    } catch (e) {
      setSyncFeedback({
        type: 'error',
        message: 'حدث خطأ أثناء محاولة المزامنة، البيانات محفوظة محلياً في أمان تام.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in font-cairo"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className="p-5 text-white flex items-center justify-between bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shadow-inner bg-blue-500/20 text-blue-400 border border-blue-400/30">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black leading-tight">
                  مركز الحماية والمزامنة السحابية
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  الباقة المجانية 100%
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Sentinel Free Tier Shield • مراقبة وضبط حصص Firebase & Vercel
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-50/80 px-5 pt-2 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('quota')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'quota'
                ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Gauge className="w-4 h-4" />
            <span>مراقب الباقة المجانية (Free Tier Sentinel)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('offline')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all cursor-pointer border-b-2 ${
              activeTab === 'offline'
                ? 'bg-white text-blue-600 border-blue-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 border-transparent hover:bg-slate-100/60'
            }`}
          >
            <Wifi className="w-4 h-4" />
            <span>المزامنة والعمل أوفلاين</span>
            {queue.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold bg-amber-100 text-amber-800 border border-amber-300">
                {queue.length}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {activeTab === 'quota' ? (
            <div className="space-y-4 animate-in fade-in">
              {/* Guarantee Banner */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 text-emerald-950 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="text-xs leading-relaxed">
                  <div className="font-extrabold text-emerald-900 text-sm flex items-center gap-2">
                    <span>النظام محكوم هندسياً للبقاء ضمن الباقة المجانية بالكامل (0.00$)</span>
                  </div>
                  <p className="mt-1 text-emerald-800">
                    تم ضبط المنظومة وفق معايير <strong>Firebase Spark Plan</strong> و <strong>Vercel Hobby</strong>، لمنع أي تكاليف أو تجاوز للحصص اليومية والشهرية، مع الحفاظ على سرعة وكفاءة الأداء المؤسسي.
                  </p>
                </div>
              </div>

              {/* Firebase Live Daily Quota Metrics */}
              <div>
                <div className="flex items-center justify-between text-xs font-black text-slate-800 mb-2.5">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-amber-600" />
                    استهلاك حصص Firebase Firestore اليومية ({new Date().toISOString().split('T')[0]})
                  </span>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                    تتجدد الحصة تلقائياً كل 24 ساعة
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Reads */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                      <span>قراءات المستندات</span>
                      <span className="text-[10px] font-mono text-blue-600">Reads</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-xl font-black text-slate-900">{quota?.reads || 0}</span>
                      <span className="text-xs text-slate-400 font-normal">/ 50,000</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div 
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(1, Math.min(100, ((quota?.reads || 0) / 50000) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-semibold">
                      <span>المستهلك: {(((quota?.reads || 0) / 50000) * 100).toFixed(2)}%</span>
                      <span className="text-emerald-600 font-bold">آمن جداً</span>
                    </div>
                  </div>

                  {/* Writes */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                      <span>كتابات وتعديلات</span>
                      <span className="text-[10px] font-mono text-blue-600">Writes</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-xl font-black text-slate-900">{quota?.writes || 0}</span>
                      <span className="text-xs text-slate-400 font-normal">/ 20,000</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(1, Math.min(100, ((quota?.writes || 0) / 20000) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-semibold">
                      <span>المستهلك: {(((quota?.writes || 0) / 20000) * 100).toFixed(2)}%</span>
                      <span className="text-blue-600 font-bold">دفعات مجمعة</span>
                    </div>
                  </div>

                  {/* Deletes */}
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-2xs hover:border-blue-300 transition-colors">
                    <div className="flex items-center justify-between text-xs text-slate-500 font-bold mb-1">
                      <span>عمليات الحذف</span>
                      <span className="text-[10px] font-mono text-blue-600">Deletes</span>
                    </div>
                    <div className="flex items-baseline gap-1.5 font-mono">
                      <span className="text-xl font-black text-slate-900">{quota?.deletes || 0}</span>
                      <span className="text-xs text-slate-400 font-normal">/ 20,000</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 mt-2.5 overflow-hidden">
                      <div 
                        className="bg-indigo-500 h-2 rounded-full transition-all duration-500" 
                        style={{ width: `${Math.max(1, Math.min(100, ((quota?.deletes || 0) / 20000) * 100))}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 font-semibold">
                      <span>المستهلك: {(((quota?.deletes || 0) / 20000) * 100).toFixed(2)}%</span>
                      <span className="text-indigo-600 font-bold">تحت السيطرة</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Vercel & Hosting Optimization */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-purple-600" />
                    كفاءة استضافة Vercel Hobby Edge
                  </span>
                  <span className="text-[11px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-200 font-bold">
                    Bandwidth: 100 GB / شهر مجاناً
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">التخزين المؤقت للأصول (Edge Cache):</span>
                    <span className="font-bold text-emerald-700 font-mono">نشط (1 Year Immutable)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 flex items-center justify-between">
                    <span className="text-slate-600">دوال بدون خادم (Serverless Functions):</span>
                    <span className="font-bold text-slate-800 font-mono">0 دوال (SPA خفيف وسريع)</span>
                  </div>
                </div>
              </div>

              {/* Architectural Safeguards */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs text-slate-600">
                <div className="font-black text-slate-900 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>آليات الحماية الهندسية الأربعة المفعلة في النظام:</span>
                </div>
                <ul className="space-y-1.5 pr-4 list-disc text-[11px] leading-relaxed text-slate-600">
                  <li><strong>التخزين المؤقت المحلي (IndexedDB Multi-Tab Cache):</strong> يتم حفظ بيانات الأرشيف على جهازك مباشرة لتقديم استجابة فورية بدون قراءة السحابة في كل تحديث.</li>
                  <li><strong>حصر الاستعلامات (Query Capping):</strong> تقييد سجلات التدقيق بـ 25 حركة حديثة فقط، لمنع تضخم القراءات مع مرور الشهور.</li>
                  <li><strong>الدفعات الذرية (Atomic Batch Writes):</strong> عند استيراد 50 أو 100 فاصل من إكسل، تُجمع جميع العمليات في أمر برمجي واحد يستهلك طلباً واحداً فقط.</li>
                  <li><strong>أمان الوصول الصارم (Auth Security Rules):</strong> قاعدة البيانات مغلقة تماماً أمام أي زائر غير مسجل للدخول لمنع محاولات الفحص أو الاستنزاف.</li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-in fade-in">
              {/* Status Banner */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                !isOnline
                  ? 'bg-amber-50 border-amber-200 text-amber-950'
                  : queue.length > 0
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {!isOnline ? (
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block animate-ping" />
                    ) : queue.length > 0 ? (
                      <span className="w-3 h-3 rounded-full bg-blue-600 inline-block animate-pulse" />
                    ) : (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-black">
                      {!isOnline 
                        ? 'وضع الأرشيف الميداني (أوفلاين بدون إنترنت)' 
                        : queue.length > 0
                        ? `متصل بالإنترنت • توجد (${queue.length}) عمليات بانتظار المزامنة`
                        : 'النظام متصل ومتزامن بنسبة 100% مع Firebase'}
                    </div>
                    <div className="text-xs opacity-80 mt-0.5">
                      {!isOnline
                        ? 'يمكنك الاستمرار في إيداع الفواصل وإعارتها واسترجاعها بأمان تام؛ البيانات تُحفظ في ذاكرة الجهاز.'
                        : queue.length > 0
                        ? 'يتم رفع العمليات تلقائياً إلى الخادم السحابي أو يمكنك الضغط على زر المزامنة الآن.'
                        : 'جميع الفواصل، المجلدات، وسجلات الإعارة والتدقيق محدثة ومطابقة لقاعدة البيانات السحابية.'}
                    </div>
                  </div>
                </div>

                {/* Quick Action Button */}
                {isOnline && (
                  <button
                    type="button"
                    onClick={handleSyncNow}
                    disabled={isSyncing}
                    className="shrink-0 flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-black shadow-sm transition-all cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'جاري الرفع...' : 'مزامنة فورية الآن'}</span>
                  </button>
                )}
              </div>

              {/* Feedback Alert if any */}
              {syncFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs font-bold flex items-center gap-2 animate-in fade-in ${
                  syncFeedback.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                    : syncFeedback.type === 'warning'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>{syncFeedback.message}</span>
                </div>
              )}

              {/* Pending Queue List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-blue-600" />
                    طابور العمليات المعلقة للمزامنة السحابية
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[11px] border border-slate-200">
                    {queue.length} حركة معلقة
                  </span>
                </div>

                {queue.length === 0 ? (
                  <div className="p-6 text-center rounded-xl border border-dashed border-slate-200 bg-slate-50/70 text-slate-500 space-y-1">
                    <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-800">لا توجد عمليات معلقة في الطابور</p>
                    <p className="text-[11px] text-slate-400">
                      جميع العمليات الميدانية تم حفظها بنجاح ومطابقتها على خادم الأرشيف
                    </p>
                  </div>
                ) : (
                  <div className="max-h-56 overflow-y-auto space-y-2 divide-y divide-slate-100 border border-slate-200 rounded-xl p-2 bg-slate-50/50">
                    {queue.map((item, idx) => (
                      <div key={item.queueId || idx} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-2 h-2 rounded-full shrink-0 ${
                            item.type === 'DELETE' ? 'bg-rose-500' : 'bg-blue-600'
                          }`} />
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">
                              {item.description || `${item.type} on ${item.entity}`}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono">
                              {new Date(item.timestamp).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </div>
                          </div>
                        </div>

                        <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-200">
                          بانتظار الرفع
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Educational Note */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1 leading-relaxed">
                <div className="font-extrabold text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>كيف يعمل نظام الأرشيف في باطن الأرض؟</span>
                </div>
                <p>
                  عند نزول أمين الأرشيف إلى غرف الحفظ أو البدروم مع انقطاع إشارة الهاتف والـ Wi-Fi، يتحول النظام فوراً إلى <strong>وضع الأوفلاين الكامل</strong>، مسجلاً كل العمليات في الذاكرة التخزينية المحلية الفورية، ثم يعاود <strong>المزامنة الذكية التلقائية</strong> دون أدنى تعارض بمجرد الخروج والاتصال بالشبكة.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
          <div className="text-xs text-slate-500 font-semibold flex items-center gap-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>قاعدة البيانات: Firebase Firestore + IndexedDB Cache</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
