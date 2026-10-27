import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  X, 
  Smartphone, 
  Scan, 
  Barcode, 
  CheckCircle2, 
  MapPin, 
  FolderArchive, 
  Layers, 
  Flashlight
} from 'lucide-react';

export default function QRModal({ isOpen, onClose, targetItem, targetBinder, onToggleStatus }) {
  if (!isOpen) return null;

  const [scanSuccess, setScanSuccess] = useState(false);
  const [flashlightOn, setFlashlightOn] = useState(false);

  const qrCode = targetItem?.qrCode || targetBinder?.qrCode || "ARC-CAB-A-SH3-B101";
  const barcode = targetItem?.barcode || targetBinder?.barcode || "628100101031";
  const title = targetItem?.name || targetItem?.title || targetBinder?.name || "فاصل كرتوني";
  const code = targetItem?.code || targetItem?.docNumber || targetBinder?.code || "FIN-01";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      <div 
        className="bg-white rounded-xl border border-slate-200 shadow-xl w-full max-w-md overflow-hidden flex flex-col font-cairo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <Smartphone className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wider">
                تطبيق المرافق الميداني (Companion App)
              </div>
              <h3 className="text-sm font-black text-white">
                قارئ كود الفواصل وكعب المجلدات
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewport Simulation */}
        <div className="p-4 space-y-3 bg-slate-950 text-white relative">
          
          {/* Camera Viewfinder Area */}
          <div className="relative w-full h-56 bg-slate-900 rounded-lg overflow-hidden border border-slate-800 flex flex-col items-center justify-center">
            
            {/* Camera background grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

            {/* Flashlight toggle */}
            <button
              type="button"
              onClick={() => setFlashlightOn(!flashlightOn)}
              className={`absolute top-2.5 left-2.5 p-1.5 rounded-lg transition-colors z-20 ${
                flashlightOn ? 'bg-amber-400 text-slate-950 shadow-xs' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title="تشغيل إضاءة الفلاش"
            >
              <Flashlight className="w-3.5 h-3.5" />
            </button>

            {/* Alignment Corner Brackets */}
            <div className="relative w-40 h-40 border-2 border-blue-500/40 rounded-xl flex flex-col items-center justify-center p-2.5">
              <div className="absolute top-0 right-0 w-5 h-5 border-t-3 border-r-3 border-blue-400 rounded-tr-md"></div>
              <div className="absolute top-0 left-0 w-5 h-5 border-t-3 border-l-3 border-blue-400 rounded-tl-md"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-3 border-r-3 border-blue-400 rounded-br-md"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-3 border-l-3 border-blue-400 rounded-bl-md"></div>

              {/* Animated Laser Scanline */}
              <div className="absolute left-2 right-2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-scanline z-10 pointer-events-none"></div>

              {/* QR Code in center */}
              <div className="p-2 bg-white rounded-lg shadow-sm">
                <QRCodeSVG
                  value={qrCode}
                  size={100}
                  level="H"
                  includeMargin={false}
                  fgColor="#0f172a"
                />
              </div>
            </div>

            {/* Success notification overlay */}
            {scanSuccess && (
              <div className="absolute inset-0 bg-emerald-950/95 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-30 animate-in fade-in zoom-in-95">
                <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mb-1.5 shadow-md shadow-emerald-500/30">
                  <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div className="text-sm font-black text-white">تم التعرف على الفاصل بنجاح!</div>
                <div className="text-[11px] text-emerald-300 font-mono mt-0.5">{qrCode}</div>
                <div className="text-[11px] text-white/90 mt-1.5 bg-emerald-900/60 px-2.5 py-0.5 rounded border border-emerald-500/30">
                  الموقع الفيزيائي مطابق: {location}
                </div>
              </div>
            )}

            <div className="absolute bottom-1.5 text-[9px] text-slate-400 font-mono tracking-widest uppercase">
              وجّه الكاميرا نحو كعب المجلد أو تبويب الفاصل
            </div>
          </div>

          {/* Trigger Scan Button */}
          <button
            type="button"
            onClick={handleSimulateScan}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-all active:scale-98 cursor-pointer"
          >
            <Scan className="w-4 h-4" />
            <span>محاكاة مسح الكود بالكاميرا (Scan Now)</span>
          </button>
        </div>

        {/* Scanned Details Card */}
        <div className="p-4 bg-white space-y-3">
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span>البيانات التعريفية للمسح:</span>
            </span>
            <span className="font-mono text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {code}
            </span>
          </div>

          <div>
            <div className="text-[10px] text-slate-500 font-semibold">اسم الفاصل / المجلد:</div>
            <div className="text-xs font-black text-slate-900 mt-0.5">{title}</div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500">الموقع الفيزيائي:</div>
              <div className="font-bold text-slate-900 mt-0.5 flex items-center gap-1 text-[11px]">
                <MapPin className="w-3 h-3 text-blue-600" />
                <span>{location}</span>
              </div>
            </div>

            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-[10px] text-slate-500">الحالة الميدانية:</div>
              <div className="font-bold mt-0.5 flex items-center gap-1 text-[11px]">
                <span className={`w-1.5 h-1.5 rounded-full ${status === 'available' ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                <span className={status === 'available' ? 'text-emerald-700' : 'text-amber-700'}>
                  {status === 'available' ? 'متاح بالخزانة' : 'مستعار حالياً'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span>شركة المستقبل • نظام الأرشفة الذكي</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors cursor-pointer text-xs"
            >
              إغلاق
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
