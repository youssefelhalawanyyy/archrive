import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  CheckCircle2, 
  UserCheck, 
  Building2, 
  Calendar, 
  MapPin, 
  AlertTriangle,
  FolderKanban,
  FileText
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, document, onConfirmToggle }) {
  if (!isOpen || !document) return null;

  const isCheckingOut = document.status === 'available';

  const [borrower, setBorrower] = useState(document.borrower || 'أحمد الراجحي (قسم المحاسبة)');
  const [department, setDepartment] = useState('الإدارة المالية والمحاسبة');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/')
  );
  const [reason, setReason] = useState(
    isCheckingOut ? 'مطابقة بيانات مالية وتدقيق ضريبي' : 'تم استرجاع الوثيقة وتدقيقها في مكانها'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isCheckingOut && !borrower.trim()) {
      alert("يرجى إدخال اسم المستعير.");
      return;
    }

    onConfirmToggle(document.id, {
      borrower: isCheckingOut ? `${borrower} (${department})` : null,
      borrowDate: isCheckingOut ? new Date().toISOString().split('T')[0].replace(/-/g, '/') : null,
      dueDate: isCheckingOut ? dueDate : null,
      reason: reason
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-5 border-b border-slate-100 flex items-center justify-between ${
          isCheckingOut ? 'bg-amber-50/70' : 'bg-emerald-50/70'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl text-white shadow-md ${
              isCheckingOut ? 'bg-amber-600 shadow-amber-500/20' : 'bg-emerald-600 shadow-emerald-500/20'
            }`}>
              {isCheckingOut ? <Clock className="w-6 h-6 stroke-[2.2]" /> : <CheckCircle2 className="w-6 h-6 stroke-[2.2]" />}
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">شركة المستقبل • تتبع الإعارة</div>
              <h3 className="text-lg font-black text-slate-900">
                {isCheckingOut ? 'إعارة وثيقة ورقية' : 'إعادة الوثيقة للأرشيف'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Target Document Info */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="text-xs text-slate-600 font-semibold">الوثيقة المستهدفة:</div>
            <div className="text-sm font-bold text-slate-900 mt-0.5 truncate">{document.title}</div>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {document.location || `${document.cabinet} - ${document.shelf}`}
              </span>
              <span className="flex items-center gap-1">
                <FolderKanban className="w-3.5 h-3.5 text-brand-600" />
                {document.binderName}
              </span>
            </div>
          </div>

          {isCheckingOut ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم المستعير <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={borrower}
                    onChange={(e) => setBorrower(e.target.value)}
                    placeholder="مثال: أحمد الراجحي"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-hidden text-sm font-semibold transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    القسم / الإدارة
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="المالية / الموارد البشرية..."
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-hidden text-sm font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الإرجاع المتوقع
                  </label>
                  <input
                    type="text"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    placeholder="YYYY/MM/DD"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-hidden text-sm font-mono text-left transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الغرض من الاستعارة
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="سبب الاستعارة والمراجعة..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15 outline-hidden text-sm font-medium transition-all"
                />
              </div>
            </>
          ) : (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>تأكيد استرجاع الوثيقة إلى الخزانة</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                سيتم تحديث حالة الوثيقة إلى <strong>"🟢 متاح"</strong> وإعادة تسجيلها في: 
                <strong> {document.location} ({document.binderName})</strong>، وإلغاء الاستعارة الميدانية.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-sm font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-sm font-bold shadow-md transition-all cursor-pointer ${
                isCheckingOut
                  ? 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/20'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
              }`}
            >
              {isCheckingOut ? <Clock className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{isCheckingOut ? 'تسجيل إعارة الوثيقة' : 'تأكيد الإرجاع للأرشيف'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
