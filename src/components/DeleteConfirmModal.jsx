import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Layers, 
  FolderArchive, 
  BookOpen,
  Loader2
} from 'lucide-react';

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  type = 'separator', // 'chapter' | 'binder' | 'separator'
  item = null,
  childCount = 0
}) {
  if (!isOpen || !item) return null;

  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const typeConfig = {
    chapter: {
      title: 'تأكيد حذف الموضوع (الباب التصنيفي)',
      icon: BookOpen,
      iconColor: 'bg-red-100 text-red-600',
      warning: `تحذير نهائي: سيؤدي هذا الإجراء إلى حذف هذا الموضوع وجميع مجلداته (${childCount} مجلدات) وفواصله الكرتونية نهائياً من قاعدة بيانات Firebase وسجل الأرشيف!`
    },
    binder: {
      title: 'تأكيد حذف المجلد الفيزيائي',
      icon: FolderArchive,
      iconColor: 'bg-red-100 text-red-600',
      warning: `تحذير نهائي: سيتم حذف هذا المجلد وجميع الفواصل الكرتونية (${childCount} فواصل) المودعة بداخله نهائياً من قاعدة بيانات Firebase والخزانة الفيزيائية!`
    },
    separator: {
      title: 'تأكيد حذف الفاصل الكرتوني',
      icon: Layers,
      iconColor: 'bg-red-100 text-red-600',
      warning: 'تحذير نهائي: هل أنت متأكد من رغبتك في حذف هذا الفاصل نهائياً من قاعدة بيانات Firebase وسجل المجلد؟ لا يمكن التراجع عن هذا الإجراء.'
    }
  };

  const current = typeConfig[type] || typeConfig.separator;
  const Icon = current.icon;

  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    setErrorMsg('');
    try {
      await onConfirm(item.id);
      onClose();
    } catch (err) {
      console.error("Delete failed:", err);
      setErrorMsg(err.message || 'تعذر إتمام عملية الحذف من Firebase');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo"
      onClick={!isDeleting ? onClose : undefined}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-5 sm:p-6 animate-in zoom-in-95 duration-200 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${current.iconColor}`}>
              <Icon className="w-5 h-5 stroke-[2.2]" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">
                {current.title}
              </h3>
              <p className="text-xs text-slate-500 font-mono mt-0.5">
                الكود: {item.code || item.id}
              </p>
            </div>
          </div>

          {!isDeleting && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Item Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-900 leading-snug">
            {item.name}
          </div>
          {item.location && (
            <div className="text-[11px] text-slate-500 mt-1">
              الموقع الفيزيائي: {item.location}
            </div>
          )}
        </div>

        {/* Warning Alert */}
        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
          <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed font-semibold">
            {current.warning}
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-bold">
            {errorMsg}
          </div>
        )}

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
          >
            إلغاء
          </button>
          
          <button
            type="button"
            disabled={isDeleting}
            onClick={handleExecuteDelete}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحذف من Firebase...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>تأكيد الحذف النهائي</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
