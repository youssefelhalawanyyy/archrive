import React, { useState } from 'react';
import { 
  Server, 
  MapPin, 
  FolderArchive, 
  FileText, 
  ChevronRight, 
  Layers, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cabinetsData } from '../data/initialData';

export default function CabinetMapView({ 
  binders = [], 
  documents = [], 
  onSelectDoc, 
  onSelectBinder 
}) {
  const [selectedCabinetId, setSelectedCabinetId] = useState('CAB-A');
  const [selectedShelfNum, setSelectedShelfNum] = useState(3); // Shelf 3 by default

  const currentCabinet = cabinetsData.find(c => c.id === selectedCabinetId) || cabinetsData[0];

  // Binders on this shelf
  const shelfBinders = binders.filter(
    b => b.cabinet === currentCabinet.name && b.shelf.includes(selectedShelfNum.toString())
  );

  // Documents on this shelf
  const shelfDocuments = documents.filter(
    d => d.cabinet === currentCabinet.name && d.shelf.includes(selectedShelfNum.toString())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600 border border-purple-200">
              <Server className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-cairo">
              الخزانة الرقمية وخريطة الأرفف (Digital Cabinet Map)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            خريطة تخطيطية تفاعلية ثنائية الأبعاد لتوزيع الخزائن المعدنية والأرفف في غرفة الأرشيف
          </p>
        </div>

        {/* Cabinet Selector Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          {cabinetsData.map((cab) => (
            <button
              key={cab.id}
              type="button"
              onClick={() => {
                setSelectedCabinetId(cab.id);
                setSelectedShelfNum(cab.id === 'CAB-A' ? 3 : 1);
              }}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedCabinetId === cab.id
                  ? 'bg-white text-brand-700 shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cab.name} ({cab.code})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Physical Cabinet Visualization + Selected Shelf Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Physical Cabinet 2D Simulation */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-card p-5">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
            <div>
              <div className="text-xs font-bold text-slate-500">المبنى الرئيسي • غرفة الأرشيف 102</div>
              <h3 className="text-base font-black text-slate-900">{currentCabinet.name}</h3>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
              {currentCabinet.category}
            </span>
          </div>

          {/* Realistic Cabinet Metal Frame Simulation */}
          <div className="bg-slate-800 p-3 rounded-2xl border-4 border-slate-700 shadow-xl space-y-2.5">
            {/* Top Cabinet Plate */}
            <div className="text-center py-1 text-[11px] font-bold text-slate-300 font-mono tracking-widest border-b border-slate-700">
              CABINET {currentCabinet.code} - SHELVES ARCHIVE
            </div>

            {/* Shelves from 4 down to 1 */}
            {[4, 3, 2, 1].map((shelfNum) => {
              const isSelected = selectedShelfNum === shelfNum;
              const bindersOnThisShelf = binders.filter(
                b => b.cabinet === currentCabinet.name && b.shelf.includes(shelfNum.toString())
              );
              const docsOnThisShelf = documents.filter(
                d => d.cabinet === currentCabinet.name && d.shelf.includes(shelfNum.toString())
              );

              return (
                <div
                  key={shelfNum}
                  onClick={() => setSelectedShelfNum(shelfNum)}
                  className={`p-3 rounded-xl border-2 transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-brand-950/80 border-brand-400 shadow-lg ring-2 ring-brand-500/40 text-white'
                      : 'bg-slate-900/90 border-slate-700/80 hover:border-slate-500 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-brand-500 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {shelfNum}
                      </div>
                      <div>
                        <div className="text-xs font-black">رف {shelfNum}</div>
                        <div className="text-[10px] opacity-70">
                          {bindersOnThisShelf.length > 0 ? bindersOnThisShelf.map(b => b.name).join(' • ') : 'رف متاح للحفظ'}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isSelected ? 'bg-brand-800 text-brand-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {docsOnThisShelf.length} وثائق
                      </span>
                    </div>
                  </div>

                  {/* Visual Shelf Line */}
                  <div className="mt-2 h-1.5 rounded-full bg-slate-700/80 overflow-hidden">
                    <div 
                      className={`h-full ${isSelected ? 'bg-brand-400' : 'bg-slate-500'}`}
                      style={{ width: `${Math.min(100, Math.max(20, bindersOnThisShelf.length * 30))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-center gap-2">
            <Info className="w-4 h-4 text-brand-600 shrink-0" />
            <span>اضغط على أي رف في الخزانة لعرض المجلدات والوثائق الموجودة عليه في الحال.</span>
          </div>
        </div>

        {/* Selected Shelf Details & Contents */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-5">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {currentCabinet.name}
                </span>
                <span className="text-sm font-black text-slate-900">محتويات رف {selectedShelfNum}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                قائمة المجلدات والوثائق الورقية المودعة فعلياً في هذا الرف
              </p>
            </div>

            <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-xl">
              إجمالي: {shelfDocuments.length} وثيقة
            </div>
          </div>

          {/* Binders on this shelf */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FolderArchive className="w-4 h-4 text-brand-600" />
              المجلدات الموجودة في الرف:
            </div>

            {shelfBinders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {shelfBinders.map((b) => (
                  <div
                    key={b.id}
                    onClick={() => onSelectBinder(b)}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-500 bg-slate-50/60 hover:bg-white transition-all cursor-pointer group shadow-2xs"
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-mono text-[10px] text-slate-500 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                        {b.code}
                      </span>
                      <span className="text-[10px] text-brand-600 font-bold group-hover:underline">
                        تحديد كنشط ←
                      </span>
                    </div>
                    <div className="text-sm font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                      {b.name}
                    </div>
                    <div className="text-xs text-slate-600 mt-1">
                      السعة: {b.currentDocsCount} / {b.totalCapacity} وثيقة
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                لا توجد مجلدات مسجلة في هذا الرف حالياً (الرف فارغ أو متاح للتوسع).
              </div>
            )}
          </div>

          {/* Documents on this shelf */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-brand-600" />
              الوثائق المادية داخل هذا الرف:
            </div>

            {shelfDocuments.length > 0 ? (
              <div className="space-y-2">
                {shelfDocuments.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className="p-3 rounded-xl border border-slate-200 hover:border-brand-400 bg-white hover:bg-brand-50/40 transition-all cursor-pointer flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{doc.title}</div>
                        <div className="text-[11px] text-slate-600">{doc.folderTab} • {doc.date}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        doc.status === 'available'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border border-amber-200'
                      }`}>
                        {doc.status === 'available' ? '🟢 متاح' : '🟡 مستعار'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                لا توجد وثائق في هذا الرف حالياً.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
