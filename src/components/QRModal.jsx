import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Smartphone, 
  Scan, 
  Barcode, 
  CheckCircle2, 
  Volume2, 
  RefreshCw, 
  MapPin, 
  FolderKanban, 
  Layers, 
  Share2, 
  Download,
  Flashlight,
  Sparkles
} from 'lucide-react';

export default function QRModal({ isOpen, onClose, targetItem, targetBinder, onToggleStatus }) {
  if (!isOpen) return null;

  const [scanSuccess, setScanSuccess] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);

  const qrCode = targetItem?.qrCode || targetBinder?.qrCode || "ARC-CAB-A-SH3-B101";
  const barcode = targetItem?.barcode || targetBinder?.barcode || "628100101031";
  const title = targetItem?.title || targetBinder?.name || "فواتير الموردين - 2023";
  const location = targetItem?.location || `${targetBinder?.cabinet || 'خزانة أ'} - ${targetBinder?.shelf || 'رف 3'}`;
  const status = targetItem?.status || 'available';

  // Play a realistic scanner beep via Web Audio API
  const playBeep = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1400, audioCtx.currentTime); // 1.4kHz beep
      gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context not allowed or supported:", e);
    }
  };

  const handleSimulateScan = () => {
    playBeep();
    setScanSuccess(true);
    setTimeout(() => {
      setScanSuccess(false);
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-md overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-slate-900 to-brand-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-brand-500 text-white shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-brand-300 uppercase tracking-wider">
                تطبيق المرافق الميداني (Companion App)
              </div>
              <h3 className="text-base font-black text-white">
                قارئ كعب المجلدات والباركود
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile Viewport Simulation */}
        <div className="p-5 space-y-4 bg-slate-900 text-white relative">
          
          {/* Camera Viewfinder Area */}
          <div className="relative w-full h-64 bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-inner flex flex-col items-center justify-center">
            
            {/* Camera background grid & noise */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>

            {/* Flashlight toggle */}
            <button
              type="button"
              onClick={() => setFlashlightOn(!flashlightOn)}
              className={`absolute top-3 left-3 p-2 rounded-full transition-colors z-20 ${
                flashlightOn ? 'bg-amber-400 text-slate-950 shadow-md' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="تشغيل إضاءة الفلاش الميدانية"
            >
              <Flashlight className="w-4 h-4" />
            </button>

            {/* Alignment Corner Brackets */}
            <div className="relative w-48 h-48 border-2 border-brand-500/40 rounded-2xl flex flex-col items-center justify-center p-3">
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-brand-400 rounded-tr-lg"></div>
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-brand-400 rounded-tl-lg"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-brand-400 rounded-br-lg"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-brand-400 rounded-bl-lg"></div>

              {/* Animated Laser Scanline */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_12px_#ef4444] animate-scanline z-10 pointer-events-none"></div>

              {/* QR Code in center */}
              <div className="p-2.5 bg-white rounded-xl shadow-lg ring-4 ring-white/10">
                <QRCodeSVG
                  value={qrCode}
                  size={120}
                  level="H"
                  includeMargin={false}
                  fgColor="#021c35"
                />
              </div>
            </div>

            {/* Success notification overlay */}
            {scanSuccess && (
              <div className="absolute inset-0 bg-emerald-950/90 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-30 animate-in fade-in zoom-in-95">
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-2 shadow-lg shadow-emerald-500/30">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
                </div>
                <div className="text-base font-black text-white">تم التعرف على الوثيقة بنجاح!</div>
                <div className="text-xs text-emerald-300 font-mono mt-1">{qrCode}</div>
                <div className="text-xs text-white/90 mt-2 bg-emerald-900/60 px-3 py-1 rounded-full border border-emerald-500/30">
                  الموقع الفيزيائي مطابق: {location}
                </div>
              </div>
            )}

            <div className="absolute bottom-2 text-[10px] text-slate-400 font-mono tracking-widest uppercase">
              وجّه الكاميرا نحو كعب المجلد
            </div>
          </div>

          {/* Trigger Scan Button */}
          <button
            type="button"
            onClick={handleSimulateScan}
            className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white rounded-xl font-bold shadow-lg shadow-brand-500/25 transition-all active:scale-98 cursor-pointer"
          >
            <Scan className="w-5 h-5" />
            <span>محاكاة مسح الكود بالكاميرا (Scan Now)</span>
          </button>
        </div>

        {/* Scanned Details Card */}
        <div className="p-5 bg-white space-y-3.5">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <FolderKanban className="w-4 h-4 text-brand-600" />
              البيانات التعريفية للمجلد
            </span>
            <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              {barcode}
            </span>
          </div>

          <div>
            <div className="text-xs text-slate-600 font-medium">اسم المجلد / الوثيقة:</div>
            <div className="text-sm font-black text-slate-900 mt-0.5">{title}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-600">الموقع الفيزيائي:</div>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-600" />
                {location}
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
              <div className="text-slate-600">الحالة الحالية:</div>
              <div className="font-bold mt-0.5 flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className={status === 'available' ? 'text-emerald-700' : 'text-amber-700'}>
                  {status === 'available' ? 'متاح بالخزانة' : 'مستعار حالياً'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between text-[11px] text-slate-600">
            <span>شركة المستقبل • نظام الأرشفة الذكي</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold transition-colors cursor-pointer"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
