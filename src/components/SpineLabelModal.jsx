import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Barcode, Download, Building2 } from 'lucide-react';

export default function SpineLabelModal({ isOpen, onClose, binder, document }) {
  if (!isOpen) return null;

  const target = document || binder;
  const binderName = binder?.name || document?.binderName || "فواتير الموردين - 2023";
  const cabinet = binder?.cabinet || document?.cabinet || "خزانة أ";
  const shelf = binder?.shelf || document?.shelf || "رف 3";
  const code = binder?.code || document?.docNumber || "CAB-A-SH3-B101";
  const qrCode = binder?.qrCode || document?.qrCode || "ARC-CAB-A-SH3-B101";
  const barcode = binder?.barcode || document?.barcode || "628100101031";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-slate-900 text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">معاينة الطباعة الميدانية</div>
              <h3 className="text-base font-black text-slate-900">
                ملصق كعب المجلد الورقي (Spine Label)
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable Label View */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          
          <div 
            id="printable-spine-label"
            className="w-56 bg-white border-2 border-dashed border-slate-400 p-4 rounded-xl shadow-lg text-slate-900 flex flex-col items-center text-center space-y-3"
          >
            {/* Header / Logo */}
            <div className="w-full border-b border-slate-200 pb-2">
              <div className="text-[11px] font-black tracking-wider text-brand-700 uppercase flex items-center justify-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                شركة المستقبل
              </div>
              <div className="text-[9px] text-slate-600">نظام الأرشفة والتوثيق الذكي</div>
            </div>

            {/* Location Coordinates */}
            <div className="w-full bg-slate-100 p-2 rounded-lg border border-slate-200">
              <div className="text-[10px] text-slate-600 font-bold uppercase">إحداثيات الرف:</div>
              <div className="text-sm font-black text-slate-900">
                {cabinet} • {shelf}
              </div>
            </div>

            {/* Binder Title */}
            <div className="py-1">
              <div className="text-[10px] text-slate-600 font-semibold">اسم المجلد:</div>
              <div className="text-xs font-black text-slate-900 leading-tight">
                {binderName}
              </div>
            </div>

            {/* QR Code */}
            <div className="p-2 bg-white rounded-lg border border-slate-200 shadow-xs">
              <QRCodeSVG
                value={qrCode}
                size={88}
                level="M"
              />
            </div>
            <div className="text-[9px] font-mono font-bold text-slate-600 -mt-1">
              {qrCode}
            </div>

            {/* Barcode representation */}
            <div className="w-full pt-1 border-t border-slate-200">
              <div className="flex items-center justify-center text-[10px] font-mono text-slate-600 gap-1">
                <Barcode className="w-6 h-4 inline" />
                <span>{barcode}</span>
              </div>
            </div>

          </div>

          <p className="text-xs text-slate-600 mt-4 text-center">
            مقاس الملصق القياسي: 5 سم × 15 سم مخصص للطباعة على طابعات الملصقات الحرارية
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-3 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-sm font-bold transition-all"
          >
            إغلاق
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملصق الآن</span>
          </button>
        </div>

      </div>

    </div>
  );
}
