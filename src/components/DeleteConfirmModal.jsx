import React from 'react';
import { 
  AlertTriangle, 
  Trash2, 
  X, 
  Layers, 
  FolderArchive, 
  BookOpen 
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

  const typeConfig = {
    chapter: {
      title: 'حذف الموضوع (الباب التصنيفي)',
      icon: BookOpen,
      iconColor: 'bg-red-100 text-red-600',
      warning: `تحذير: سيؤدي حذف هذا الموضوع إلى حذف جميع المجلدات (${childCount} مجلدات) والفواصل الكرتونية المودعة بداخلها من قاعدة بيانات الأرشيف نهائياً!`
    },
    binder: {
      title: 'حذف المجلد الفيزيائي',
      icon: FolderArchive,
      iconColor: 'bg-red-100 text-red-600',
      warning: `تحذير: سيتم حذف هذا المجلد وجميع الفواصل الكرتونية (${childCount} فواصل) المودعة بداخله من الخزانة وسجل الأرشيف نهائياً!`
    },
    separator: {
      title: 'حذف الفاصل الكرتوني',
      icon: Layers,
      iconColor: 'bg-red-100 text-red-600',
      warning: 'هل أنت متأكد من رغبتك في حذف هذا الفاصل من سجل المجلد وقاعدة البيانات نهائياً؟'
    }
  };

  const current = typeConfig[type] || typeConfig.separator;
  const Icon = current.icon;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo"
      onClick={onClose}
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

          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Info Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
          <div className="text-xs font-bold text-slate-900 leading-snug">
            {item.name}
          </div>
          {item.location && (
            <div className="text-[11px] text-slate-500 mt-1">
              الموقع: {item.location}
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

        {/* Actions */}
        <div className="pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer"
          >
            إلغاء
          </button>
          
          <button
            type="button"
            onClick={() => {
              onConfirm(item.id);
              onClose();
            }}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xs font-black shadow-md transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            <span>تأكيد الحذف النهائي</span>
          </button>
        </div>
      </div>
    </div>
  );
}
