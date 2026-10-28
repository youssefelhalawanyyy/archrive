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
  CloudUpload
} from 'lucide-react';
import { 
  flushOfflineQueue, 
  getOfflineQueue, 
  getIsOnline, 
  subscribeToNetworkStatus, 
  subscribeToOfflineQueue 
} from '../services/firebase';

export default function OfflineSyncModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const [isOnline, setIsOnline] = useState(getIsOnline());
  const [queue, setQueue] = useState(getOfflineQueue());
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  useEffect(() => {
    const unsubNet = subscribeToNetworkStatus((online) => setIsOnline(online));
    const unsubQueue = subscribeToOfflineQueue((q) => setQueue(q));
    return () => {
      unsubNet();
      unsubQueue();
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
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Header */}
        <div className={`p-5 text-white flex items-center justify-between ${
          !isOnline 
            ? 'bg-gradient-to-r from-amber-900 via-slate-900 to-slate-900' 
            : queue.length > 0
            ? 'bg-gradient-to-r from-blue-900 via-slate-900 to-slate-900'
            : 'bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
              !isOnline ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              {!isOnline ? <WifiOff className="w-6 h-6 stroke-[2.2]" /> : <Wifi className="w-6 h-6 stroke-[2.2]" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black leading-tight">
                مركز المزامنة والعمل بدون إنترنت
              </h3>
              <p className="text-xs text-slate-300 mt-0.5">
                True Offline-First Engine • غرف الأرشيف والمستودعات
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

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
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
