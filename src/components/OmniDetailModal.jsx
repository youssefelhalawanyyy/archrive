import React from 'react';
import { 
  X, 
  BookOpen, 
  FolderArchive, 
  Layers, 
  MapPin, 
  Calendar, 
  UserCheck, 
  Clock, 
  ShieldCheck, 
  QrCode, 
  Printer, 
  ExternalLink, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Building2,
  Boxes,
  ArrowRight
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export default function OmniDetailModal({ 
  isOpen, 
  onClose, 
  item, 
  onNavigateToItem,
  onOpenQRModal,
  onOpenPrintModal,
  onToggleStatus 
}) {
  if (!isOpen || !item) return null;

  const isSeparator = item.entityType === 'separator';
  const isBinder = item.entityType === 'binder';
  const isChapter = item.entityType === 'chapter';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in font-cairo" dir="rtl">
      <div 
        className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-900 text-white flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-inner ${
              isChapter ? 'bg-indigo-600 text-white' :
              isBinder ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isChapter ? <BookOpen className="w-5 h-5" /> :
               isBinder ? <FolderArchive className="w-5 h-5" /> : <Layers className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isChapter ? 'bg-indigo-400/20 text-indigo-200 border border-indigo-400/30' :
                  isBinder ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30' :
                  'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30'
                }`}>
                  {isChapter ? 'ملف الموضوع (الباب)' : isBinder ? 'ملف المجلد الفيزيائي' : 'ملف الفاصل الكرتوني'}
                </span>
                <span className="text-slate-400 text-xs font-mono">{item.code}</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white mt-1 leading-snug">
                {item.name}
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs sm:text-sm text-slate-700">
          
          {/* Complete Hierarchical Trail */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center flex-wrap gap-2 text-xs font-semibold">
            <span className="text-slate-400">التسلسل الأرشيفي:</span>
            {item.chapterName && (
              <span className="flex items-center gap-1 text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                <BookOpen className="w-3 h-3" />
                {item.chapterName}
              </span>
            )}
            {item.binderName && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
                <span className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <FolderArchive className="w-3 h-3" />
                  {item.binderName}
                </span>
              </>
            )}
            {isSeparator && (
              <>
                <ArrowRight className="w-3 h-3 text-slate-400 rotate-180" />
                <span className="flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  <Layers className="w-3 h-3" />
                  {item.code}
                </span>
              </>
            )}
          </div>

          {/* Grid of Key Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Location */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
                <span>موقع الحفظ الفيزيائي بالمستودع</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono">
                {item.physicalLocation || item.location || 'الخزانة الرئيسية • غرفة الأرشيف 102'}
              </p>
            </div>

            {/* Status (For Separators) or Count (For Binders/Chapters) */}
            {isSeparator && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>حالة التداول الميداني</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-extrabold ${
                    item.status === 'available' 
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}>
                    {item.status === 'available' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>متاح ومودع بالخزانة</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>مستعار حالياً</span>
                      </>
                    )}
                  </span>
                </div>
              </div>
            )}

            {(isBinder || isChapter) && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                  <Boxes className="w-3.5 h-3.5 text-indigo-600" />
                  <span>المحتويات والفواصل</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {isChapter ? `${item.bindersCount || 0} مجلدات • ${item.separatorsCount || 0} فواصل` : `${item.separatorsCount || 0} فواصل كرتونية`}
                </p>
              </div>
            )}

            {/* Client / Organization */}
            {item.client && (
              <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
                <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                  <Building2 className="w-3.5 h-3.5 text-purple-600" />
                  <span>الجهة / الإدارة التابع لها</span>
                </div>
                <p className="text-xs font-bold text-slate-900">
                  {item.client}
                </p>
              </div>
            )}

            {/* Date */}
            <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold mb-1">
                <Calendar className="w-3.5 h-3.5 text-slate-600" />
                <span>تاريخ التوثيق / الإيداع</span>
              </div>
              <p className="text-xs font-bold text-slate-900 font-mono">
                {item.date || item.createdAt?.substring(0, 10) || new Date().toISOString().substring(0, 10)}
              </p>
            </div>

          </div>

          {/* Checkout Details if checked out */}
          {isSeparator && item.status === 'checked_out' && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-xs">
                <UserCheck className="w-4 h-4 text-amber-700" />
                <span>بيانات الاستعارة الميدانية المسجلة:</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-950 font-medium">
                <div>
                  <span className="text-amber-700 ml-1">اسم المستلم:</span>
                  <span className="font-bold">{item.borrower || 'غير محدد'}</span>
                </div>
                <div>
                  <span className="text-amber-700 ml-1">تاريخ الاستعارة:</span>
                  <span className="font-mono">{item.checkoutDate || 'اليوم'}</span>
                </div>
                {item.expectedReturnDate && (
                  <div>
                    <span className="text-amber-700 ml-1">تاريخ الإرجاع المتوقع:</span>
                    <span className="font-mono">{item.expectedReturnDate}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Description & Notes */}
          {(item.description || item.notes) && (
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-500 font-bold text-xs mb-1">
                <FileText className="w-3.5 h-3.5 text-slate-600" />
                <span>الوصف والملاحظات الرسمية</span>
              </div>
              <p className="text-xs leading-relaxed text-slate-700 font-medium">
                {item.description || item.notes}
              </p>
            </div>
          )}

          {/* Quick QR & Barcode Section for physical scanning */}
          <div className="p-3.5 bg-slate-900 text-white rounded-xl flex items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold flex items-center gap-1.5 text-blue-300">
                <QrCode className="w-4 h-4" />
                <span>الرمز الشريطي للفاصل (Barcode / QR)</span>
              </p>
              <p className="text-[11px] text-slate-400">
                جاهز للمطابقة السريعة ومسح الهواتف وأجهزة الجرد
              </p>
              <p className="text-xs font-mono font-bold text-white pt-1">
                {item.code}
              </p>
            </div>
            <div className="p-1.5 bg-white rounded-lg shrink-0">
              <QRCodeSVG value={item.code || 'ARC'} size={56} />
            </div>
          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2">
            {onNavigateToItem && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToItem(item);
                }}
                className="px-3.5 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 active:scale-95 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>فتح في هيكل الأرشيف</span>
              </button>
            )}

            {isSeparator && onToggleStatus && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onToggleStatus(item);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  item.status === 'available'
                    ? 'bg-amber-100 text-amber-900 hover:bg-amber-200 border border-amber-300'
                    : 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border border-emerald-300'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>{item.status === 'available' ? 'إعارة الفاصل' : 'استرداد الفاصل'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isSeparator && onOpenPrintModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenPrintModal(item);
                }}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="طباعة الفاصل الكرتوني"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">طباعة</span>
              </button>
            )}

            {isSeparator && onOpenQRModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenQRModal(item);
                }}
                className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                title="عرض وتكبير QR"
              >
                <QrCode className="w-4 h-4" />
                <span className="hidden sm:inline">QR</span>
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
