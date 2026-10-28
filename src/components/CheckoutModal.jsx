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
  Layers,
  FolderArchive
} from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, document, onConfirmToggle }) {
  if (!isOpen || !document) return null;

  const isCheckingOut = document.status === 'available';
  const itemName = document.name || document.title || 'فاصل كرتوني';
  const itemCode = document.code || document.docNumber || 'SEP-01';

  const [borrower, setBorrower] = useState(document.borrower || 'أحمد الراجحي (قسم المحاسبة)');
  const [department, setDepartment] = useState('الإدارة المالية والمحاسبة');
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0].replace(/-/g, '/')
  );
  const [reason, setReason] = useState(
    isCheckingOut ? 'مطابقة بيانات مالية وتدقيق حسابات' : 'تم استرجاع الفاصل وتدقيقه في المجلد'
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
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className={`p-4 border-b border-slate-200 flex items-center justify-between ${
          isCheckingOut ? 'bg-amber-50/70' : 'bg-emerald-50/70'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-lg text-white ${
              isCheckingOut ? 'bg-amber-600' : 'bg-emerald-600'
            }`}>
              {isCheckingOut ? <Clock className="w-5 h-5 stroke-[2.2]" /> : <CheckCircle2 className="w-5 h-5 stroke-[2.2]" />}
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-500">شركة المستقبل • إدارة حركة الإعارة</div>
              <h3 className="text-base font-black text-slate-900">
                {isCheckingOut ? 'إعارة فاصل كرتوني ميدانياً' : 'إعادة الفاصل إلى المجلد'}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Target Separator Info */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-[11px] font-bold text-slate-500">الفاصل المستهدف:</span>
              <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                {itemCode}
              </span>
            </div>
            <div className="text-sm font-black text-slate-900 mt-0.5">
              {itemName}
            </div>
            <div className="mt-2 pt-2 border-t border-slate-200 flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>{document.location || `${document.cabinet} - ${document.shelf}`}</span>
              </span>
              <span className="flex items-center gap-1">
                <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
                <span>المجلد: {document.binderName || document.binderCode}</span>
              </span>
            </div>
          </div>

          {isCheckingOut ? (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم الموظف المستعير <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={borrower}
                  onChange={(e) => setBorrower(e.target.value)}
                  placeholder="مثال: أحمد الراجحي"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 outline-hidden text-xs font-bold text-slate-900 transition-all"
                />
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
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
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-mono font-bold text-left"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الغرض من استعارة الفاصل
                </label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="سبب الاستعارة والمراجعة..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs font-medium"
                />
              </div>
            </>
          ) : (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>تأكيد استرجاع الفاصل الكرتوني إلى المجلد</span>
              </div>
              <p className="text-xs text-emerald-700 leading-relaxed">
                سيتم تحديث حالة الفاصل إلى <strong>"🟢 متاح"</strong> وإعادة تسجيله في مكانه الطبيعي داخل: 
                <strong> {document.binderName || document.binderCode}</strong> ({document.location}).
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg text-slate-600 hover:text-slate-800 hover:bg-slate-100 text-xs font-bold transition-all"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-white text-xs font-bold shadow-xs transition-all cursor-pointer ${
                isCheckingOut
                  ? 'bg-amber-600 hover:bg-amber-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {isCheckingOut ? <Clock className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
              <span>{isCheckingOut ? 'تسجيل إعارة الفاصل' : 'تأكيد الإرجاع للمجلد'}</span>
            </button>
          </div>

        </form>

      </div>

    </div>
  );
}
