import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Printer, Barcode, Building2, Layers, FolderArchive } from 'lucide-react';

export default function SpineLabelModal({ isOpen, onClose, binder, document }) {
  if (!isOpen) return null;

  // Mode: 'binder' or 'separator'
  const isSeparatorInitial = !!document && !binder;
  const [labelType, setLabelType] = useState(isSeparatorInitial ? 'separator' : 'binder');

  const binderName = binder?.name || document?.binderName || "الشؤون المالية والحسابات - 2023";
  const cabinet = binder?.cabinet || document?.cabinet || "خزانة أ";
  const shelf = binder?.shelf || document?.shelf || "رف 3";
  const binderCode = binder?.code || document?.binderCode || "FIN-01";

  const separatorName = document?.name || document?.title || "فواتير الموردين - الربع الأول";
  const separatorCode = document?.code || document?.docNumber || `${binderCode}-S01`;
  const separatorColor = document?.color || "#38bdf8";
  const separatorPapers = document?.papersCount || 25;

  const currentCode = labelType === 'binder' ? binderCode : separatorCode;
  const qrCode = labelType === 'binder' ? (binder?.qrCode || `ARC-${binderCode}`) : (document?.qrCode || `ARC-${separatorCode}`);
  const barcode = labelType === 'binder' ? (binder?.barcode || "628100101031") : (document?.barcode || "628100101099");

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-lg overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Printer className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-slate-400">معاينة الطباعة الميدانية</div>
              <h3 className="text-base font-black text-slate-900">
                طباعة الملصقات والتبويبات
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

        {/* Label Type Selector */}
        <div className="px-5 pt-3 bg-slate-50 flex items-center gap-2 border-b border-slate-200">
          <button
            type="button"
            onClick={() => setLabelType('binder')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              labelType === 'binder'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>ملصق كعب المجلد (Spine Label)</span>
          </button>

          <button
            type="button"
            onClick={() => setLabelType('separator')}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold border-b-2 cursor-pointer transition-all ${
              labelType === 'separator'
                ? 'border-blue-600 text-blue-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>ملصق تبويب الفاصل (Separator Tab)</span>
          </button>
        </div>

        {/* Printable Label View */}
        <div className="p-6 bg-slate-100 flex flex-col items-center justify-center">
          
          {labelType === 'binder' ? (
            /* Binder Spine Label (Vertical 5x15cm) */
            <div 
              id="printable-binder-label"
              className="w-56 bg-white border-2 border-dashed border-slate-300 p-4 rounded-lg shadow-sm text-slate-900 flex flex-col items-center text-center space-y-2.5"
            >
              {/* Header / Logo */}
              <div className="w-full border-b border-slate-200 pb-2">
                <div className="text-[11px] font-black tracking-wider text-blue-800 uppercase flex items-center justify-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  <span>شركة المستقبل</span>
                </div>
                <div className="text-[9px] text-slate-500">نظام الأرشفة والتوثيق الذكي</div>
              </div>

              {/* Location Coordinates */}
              <div className="w-full bg-slate-50 p-1.5 rounded border border-slate-200">
                <div className="text-[9px] text-slate-500 font-bold">إحداثيات الرف:</div>
                <div className="text-xs font-black text-slate-900">
                  {cabinet} • {shelf}
                </div>
              </div>

              {/* Code */}
              <div className="font-mono text-sm font-black bg-slate-900 text-white px-3 py-0.5 rounded">
                {binderCode}
              </div>

              {/* Binder Title */}
              <div className="py-0.5">
                <div className="text-[9px] text-slate-500">اسم المجلد:</div>
                <div className="text-xs font-black text-slate-900 leading-snug">
                  {binderName}
                </div>
              </div>

              {/* QR Code */}
              <div className="p-1.5 bg-white rounded border border-slate-200 shadow-2xs">
                <QRCodeSVG
                  value={qrCode}
                  size={80}
                  level="M"
                />
              </div>
              <div className="text-[8px] font-mono font-bold text-slate-500 -mt-1">
                {qrCode}
              </div>

              {/* Barcode representation */}
              <div className="w-full pt-1 border-t border-slate-200">
                <div className="flex items-center justify-center text-[9px] font-mono text-slate-600 gap-1">
                  <Barcode className="w-5 h-3 inline" />
                  <span>{barcode}</span>
                </div>
              </div>
            </div>
          ) : (
            /* Separator Tab Label (Horizontal 3x7cm) */
            <div 
              id="printable-separator-label"
              className="w-72 bg-white border-2 border-dashed border-slate-300 p-3 rounded-lg shadow-sm text-slate-900 flex items-center justify-between gap-3 relative overflow-hidden"
            >
              {/* Color strip on tab edge */}
              <div 
                className="absolute top-0 right-0 bottom-0 w-2.5" 
                style={{ backgroundColor: separatorColor }}
              />

              <div className="flex-1 pr-2 text-right">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded">
                    {separatorCode}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {binderCode}
                  </span>
                </div>
                <div className="text-xs font-black text-slate-900 leading-tight">
                  {separatorName}
                </div>
                <div className="text-[9px] text-slate-500 mt-1">
                  {cabinet} • {shelf} • {separatorPapers} ورقة
                </div>
              </div>

              {/* Small QR */}
              <div className="p-1 bg-white rounded border border-slate-200 shrink-0">
                <QRCodeSVG
                  value={qrCode}
                  size={58}
                  level="M"
                />
              </div>
            </div>
          )}

          <p className="text-[11px] text-slate-500 mt-3 text-center">
            {labelType === 'binder' 
              ? 'مقاس ملصق كعب المجلد: 5 سم × 15 سم مخصص لطابعات الملصقات الحرارية'
              : 'مقاس ملصق تبويب الفاصل الكرتوني: 3 سم × 7 سم لتثبيته على لسان الفاصل'
            }
          </p>
        </div>

        {/* Modal Actions */}
        <div className="p-4 border-t border-slate-200 flex items-center justify-end gap-2.5 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-bold transition-all"
          >
            إغلاق
          </button>
          
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>طباعة الملصق الآن</span>
          </button>
        </div>

      </div>

    </div>
  );
}
