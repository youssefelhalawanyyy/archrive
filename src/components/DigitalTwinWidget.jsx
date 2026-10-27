import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  MapPin, 
  Layers, 
  QrCode, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  FileText, 
  Barcode, 
  Sparkles,
  BookOpen,
  Maximize2
} from 'lucide-react';

export default function DigitalTwinWidget({ 
  selectedItem, 
  selectedBinder, 
  onOpenQRModal, 
  onOpenPrintModal,
  onToggleStatus 
}) {
  const chapterName = selectedItem?.chapterName || selectedBinder?.chapterName || "الشؤون المالية والحسابات";
  const chapterCode = selectedItem?.chapterCode || selectedBinder?.chapterCode || "FIN";
  const binderName = selectedItem?.binderName || selectedBinder?.name || "فواتير الموردين - 2023";
  const binderCode = selectedItem?.binderCode || selectedBinder?.code || "FIN-01";
  
  const cabinetName = selectedItem?.cabinet || selectedBinder?.cabinet || "خزانة أ";
  const shelfName = selectedItem?.shelf || selectedBinder?.shelf || "رف 3";
  const docTitle = selectedItem?.title || "فاتورة ضريبية رقم 105 - مستلزمات مكتبية";
  const folderTab = selectedItem?.separationName || selectedItem?.folderTab || "فاصل 4: فواتير الربع الرابع (FIN-01-S04)";
  const status = selectedItem?.status || "available";
  const qrCodeValue = selectedItem?.qrCode || selectedBinder?.qrCode || `ARC-${binderCode}`;
  const barcodeValue = selectedItem?.barcode || selectedBinder?.barcode || "628100101031";
  const clientName = selectedItem?.client || "شركة الأفق للحلول الرقمية";
  const borrowerName = selectedItem?.borrower;

  const isAvailable = status === "available";

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 lg:p-6 transition-all hover:shadow-lg relative overflow-hidden font-cairo">
      {/* Background soft ambient glow */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-brand-100/40 via-blue-50/20 to-transparent rounded-full -translate-x-24 -translate-y-24 pointer-events-none" />

      {/* Header of Digital Twin */}
      <div className="flex items-start justify-between gap-4 mb-5 border-b border-slate-100 pb-4 relative">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200/60 shadow-xs">
            <Layers className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-200/50">
                التوأم الرقمي (Digital Twin)
              </span>
              <span className="text-xs text-slate-600 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                تتبع موقع فيزيائي حي
              </span>
            </div>
            <h2 className="text-lg font-black text-slate-900 mt-0.5">
              تحديد الموقع الميداني للوثيقة والمجلد
            </h2>
          </div>
        </div>

        {/* Live Status Badge */}
        <button
          type="button"
          onClick={() => selectedItem && onToggleStatus(selectedItem)}
          title="اضغط لتبديل حالة الوثيقة (متاح / مستعار)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs cursor-pointer ${
            isAvailable
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
          }`}
        >
          <span className={`w-2.5 h-2.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
          <span>{isAvailable ? '🟢 متاح بالخزانة' : '🟡 مستعار حالياً'}</span>
        </button>
      </div>

      {/* Grid: Visual Graphic of Blue Binder + Location Details + QR Code */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5 lg:gap-6 items-center">
        
        {/* Visual Graphic: Realistic Archival Blue Binder with Auto Code Spine */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-2xl border border-slate-200/70 relative group">
          
          {/* Binder Spine 3D representation */}
          <div className="w-40 sm:w-44 h-56 bg-gradient-to-r from-brand-800 via-brand-600 to-brand-700 rounded-r-2xl rounded-l-md shadow-xl border-y border-l border-brand-900/40 relative flex flex-col justify-between p-3.5 text-white transform transition-transform group-hover:scale-102">
            
            {/* Binder Rings Simulation */}
            <div className="absolute right-1.5 top-10 w-2.5 h-6 rounded-full bg-slate-300 shadow-inner border border-slate-400"></div>
            <div className="absolute right-1.5 bottom-10 w-2.5 h-6 rounded-full bg-slate-300 shadow-inner border border-slate-400"></div>

            {/* Spine Header with Future Company Logo stamp & Auto Code */}
            <div className="flex items-center justify-between border-b border-brand-400/40 pb-2">
              <span className="text-[10px] font-extrabold tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-white backdrop-blur-xs">
                شركة المستقبل
              </span>
              <span className="font-mono text-xs font-black bg-white text-slate-900 px-1.5 py-0.5 rounded shadow-2xs">
                {binderCode}
              </span>
            </div>

            {/* White Paper Spine Label on Binder */}
            <div className="my-auto bg-amber-50/95 text-slate-800 rounded-lg p-2.5 shadow-md border-2 border-dashed border-amber-200 text-center">
              <div className="text-[9px] font-bold text-brand-700 uppercase tracking-wider mb-0.5">
                {chapterName}
              </div>
              <div className="text-xs font-black text-slate-900 leading-tight">
                {binderName}
              </div>
              <div className="text-[10px] text-slate-600 font-bold mt-1">
                {cabinetName} • {shelfName}
              </div>
              <div className="mt-1 pt-1 border-t border-slate-300/60 flex items-center justify-center gap-1 text-[9px] font-mono text-slate-600">
                <Barcode className="w-4 h-3 inline" />
                <span>{barcodeValue.slice(0, 8)}</span>
              </div>
            </div>

            {/* Spine Finger Pull Hole & Separation tab indicator */}
            <div className="flex items-center justify-between pt-1">
              <div className="w-5 h-5 rounded-full bg-slate-900/50 shadow-inner border border-white/20 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-slate-950"></div>
              </div>
              <span className="text-[10px] font-mono font-bold text-brand-100 bg-white/10 px-1.5 py-0.5 rounded">
                كود: {binderCode}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1 justify-center">
              <FolderKanban className="w-3.5 h-3.5 text-brand-600" />
              مجلد فيزيائي مقوّى بكود سهل: <strong className="font-mono text-brand-700">{binderCode}</strong>
            </span>
          </div>
        </div>

        {/* Location Details: Chapter -> Binder -> Separation -> Cabinet & Shelf */}
        <div className="md:col-span-5 space-y-3.5">
          <div className="space-y-2">
            
            {/* Hierarchical Breadcrumb */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs font-bold">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200">
                <BookOpen className="w-3 h-3 text-brand-600" />
                <span>الموضوع:</span>
                <strong className="text-slate-900">{chapterName}</strong>
              </div>

              <span className="text-slate-300 font-bold">←</span>

              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>الموقع:</span>
                <strong className="text-blue-900">{cabinetName} • {shelfName}</strong>
              </div>
            </div>

            {/* Binder Highlight with Auto Code */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-0.5">
                <span>المجلد الفيزيائي النشط:</span>
                <span className="font-mono text-xs font-black bg-brand-600 text-white px-2 py-0.5 rounded shadow-2xs">
                  {binderCode}
                </span>
              </div>
              <div className="text-base font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
                <span>{binderName}</span>
              </div>
              
              {/* Internal Separation Divider info */}
              <div className="text-xs text-slate-700 mt-2 p-2 rounded-xl bg-white border border-slate-200 flex items-center justify-between">
                <span className="font-semibold text-slate-600">الفاصل الكرتوني الداخلي:</span>
                <span className="font-bold text-brand-700">{folderTab}</span>
              </div>
            </div>

            {/* Selected Document Info */}
            <div className="p-3.5 rounded-2xl bg-brand-50/50 border border-brand-100">
              <div className="text-[11px] font-semibold text-slate-600 mb-0.5 flex items-center justify-between">
                <span>الوثيقة المحددة حالياً:</span>
                {selectedItem?.docNumber && (
                  <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-brand-200 text-brand-800 font-bold">
                    {selectedItem.docNumber}
                  </span>
                )}
              </div>
              <div className="text-sm font-black text-slate-900 truncate">
                {docTitle}
              </div>
              <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                <span>الجهة / العميل: <strong className="text-slate-700">{clientName}</strong></span>
                <span>{selectedItem?.date ? `التاريخ: ${selectedItem.date}` : ''}</span>
              </div>
              
              {!isAvailable && borrowerName && (
                <div className="mt-2 pt-2 border-t border-amber-200/60 text-xs text-amber-800 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>مستعارة حالياً بواسطة: <strong>{borrowerName}</strong></span>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              id="print-spine-label-btn"
              onClick={onOpenPrintModal}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة ملصق الكعب</span>
            </button>

            <button
              type="button"
              id="open-qr-scanner-btn"
              onClick={onOpenQRModal}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>مسح عبر الهاتف (QR)</span>
            </button>
          </div>
        </div>

        {/* Interactive QR Code Widget with scan trigger */}
        <div className="md:col-span-3 flex flex-col items-center justify-center p-4 rounded-2xl bg-gradient-to-b from-white to-slate-50 border border-slate-200 shadow-xs text-center relative group">
          <div className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-brand-600" />
            <span>رمز الاستجابة السريعة</span>
          </div>

          <div 
            onClick={onOpenQRModal}
            title="انقر لفتح محاكي المسح الضوئي بالجوال"
            className="p-3 bg-white rounded-xl shadow-md border-2 border-slate-200 group-hover:border-brand-500 group-hover:scale-105 transition-all cursor-pointer relative"
          >
            <QRCodeSVG
              value={qrCodeValue}
              size={112}
              level="H"
              includeMargin={false}
              fgColor="#0f172a"
            />
            <div className="absolute inset-0 bg-brand-900/75 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-2">
              <Maximize2 className="w-5 h-5 mb-1" />
              <span className="text-[10px] font-bold">مسح بالجوال</span>
            </div>
          </div>

          <div className="mt-2.5 font-mono text-[11px] font-bold text-slate-700 tracking-wider bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {qrCodeValue}
          </div>
          <p className="text-[10px] text-slate-600 mt-1 max-w-[140px] leading-tight">
            مسح كود المجلد للوصول السريع إلى فواصله ووثائقه
          </p>
        </div>

      </div>
    </div>
  );
}
