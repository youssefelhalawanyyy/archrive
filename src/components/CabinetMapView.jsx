import React, { useState } from 'react';
import { 
  Server, 
  MapPin, 
  FolderArchive, 
  Layers, 
  ChevronRight, 
  Sparkles,
  Info,
  CheckCircle2
} from 'lucide-react';
import { cabinetsData } from '../data/initialData';

export default function CabinetMapView({ 
  binders = [], 
  separators = [], 
  onSelectBinder 
}) {
  const [selectedCabinetId, setSelectedCabinetId] = useState('CAB-A');
  const [selectedShelfNum, setSelectedShelfNum] = useState(3); // Shelf 3 by default

  const currentCabinet = cabinetsData.find(c => c.id === selectedCabinetId) || cabinetsData[0];

  // Binders on this shelf
  const shelfBinders = binders.filter(
    b => b.cabinet === currentCabinet.name && b.shelf.includes(selectedShelfNum.toString())
  );

  // Separators on this shelf
  const shelfSeparators = separators.filter(
    s => s.cabinet === currentCabinet.name && s.shelf.includes(selectedShelfNum.toString())
  );

  return (
    <div className="space-y-5 font-cairo">
      
      {/* Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <Server className="w-5 h-5 text-blue-400 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              الخزانة الرقمية وخريطة الأرفف (Cabinet Map)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            خريطة تخطيطية تفاعلية ثنائية الأبعاد لتوزيع الخزائن المعدنية والأرفف في غرفة الأرشيف
          </p>
        </div>

        {/* Cabinet Selector Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg border border-slate-200">
          {cabinetsData.map((cab) => (
            <button
              key={cab.id}
              type="button"
              onClick={() => {
                setSelectedCabinetId(cab.id);
                setSelectedShelfNum(cab.id === 'CAB-A' ? 3 : 1);
              }}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                selectedCabinetId === cab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cab.name} ({cab.code})
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Physical Cabinet Visualization + Selected Shelf Contents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Physical Cabinet 2D Simulation */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between mb-3 pb-2.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400">المبنى الرئيسي • غرفة الأرشيف 102</div>
              <h3 className="text-sm font-black text-slate-900">{currentCabinet.name}</h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {currentCabinet.category}
            </span>
          </div>

          {/* Cabinet Metal Frame Simulation */}
          <div className="bg-slate-900 p-3 rounded-lg border border-slate-800 shadow-sm space-y-2">
            {/* Top Cabinet Plate */}
            <div className="text-center py-1 text-[10px] font-bold text-slate-400 font-mono tracking-wider border-b border-slate-800">
              CABINET {currentCabinet.code} • PHYSICAL ARCHIVE
            </div>

            {/* Shelves from 4 down to 1 */}
            {[4, 3, 2, 1].map((shelfNum) => {
              const isSelected = selectedShelfNum === shelfNum;
              const bindersOnThisShelf = binders.filter(
                b => b.cabinet === currentCabinet.name && b.shelf.includes(shelfNum.toString())
              );
              const sepsOnThisShelf = separators.filter(
                s => s.cabinet === currentCabinet.name && s.shelf.includes(shelfNum.toString())
              );

              return (
                <div
                  key={shelfNum}
                  onClick={() => setSelectedShelfNum(shelfNum)}
                  className={`p-3 rounded-lg border transition-all cursor-pointer relative group ${
                    isSelected
                      ? 'bg-blue-950/80 border-blue-500 shadow-xs ring-1 ring-blue-500/40 text-white'
                      : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded flex items-center justify-center font-bold text-xs ${
                        isSelected ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400'
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
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        isSelected ? 'bg-blue-900 text-blue-200' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {bindersOnThisShelf.length} مجلدات • {sepsOnThisShelf.length} فواصل
                      </span>
                    </div>
                  </div>

                  {/* Visual Shelf Fill Line */}
                  <div className="mt-2 h-1 rounded-full bg-slate-800 overflow-hidden">
                    <div 
                      className={`h-full ${isSelected ? 'bg-blue-500' : 'bg-slate-600'}`}
                      style={{ width: `${Math.min(100, Math.max(15, bindersOnThisShelf.length * 35))}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-blue-600 shrink-0" />
            <span>اضغط على أي رف في الخزانة لعرض المجلدات والفواصل الكرتونية المودعة به.</span>
          </div>
        </div>

        {/* Selected Shelf Details & Contents */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  {currentCabinet.name}
                </span>
                <span className="text-sm font-black text-slate-900">محتويات رف {selectedShelfNum}</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                قائمة المجلدات والفواصل الكرتونية المودعة فعلياً في هذا الرف
              </p>
            </div>

            <div className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
              إجمالي: {shelfSeparators.length} فاصل كرتوني
            </div>
          </div>

          {/* Binders on this shelf */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <FolderArchive className="w-4 h-4 text-blue-600" />
              <span>المجلدات الفيزيائية في الرف ({shelfBinders.length}):</span>
            </div>

            {shelfBinders.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {shelfBinders.map((b) => {
                  const bSeps = separators.filter(s => s.binderId === b.id || s.binderCode === b.code);
                  return (
                    <div
                      key={b.id}
                      onClick={() => onSelectBinder(b)}
                      className="p-3 rounded-lg border border-slate-200 hover:border-blue-600 bg-white hover:bg-blue-50/40 transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                          {b.code}
                        </span>
                        <span className="text-[10px] text-blue-700 font-bold group-hover:underline">
                          عرض المحتويات ←
                        </span>
                      </div>
                      <div className="text-xs font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                        {b.name}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1">
                        السعة: <strong>{bSeps.length}</strong> / {b.totalCapacity || 10} فواصل كرتونية
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                لا توجد مجلدات مسجلة في هذا الرف حالياً (الرف متاح للإيداع).
              </div>
            )}
          </div>

          {/* Separators on this shelf */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>الفواصل الكرتونية المودعة في مجلدات هذا الرف ({shelfSeparators.length}):</span>
            </div>

            {shelfSeparators.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2 px-3">كود الفاصل</th>
                      <th className="py-2 px-3">اسم الفاصل</th>
                      <th className="py-2 px-3">المجلد التابع له</th>
                      <th className="py-2 px-3">الأوراق</th>
                      <th className="py-2 px-3 text-center">الحالة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {shelfSeparators.map((sep) => (
                      <tr key={sep.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-2 px-3 whitespace-nowrap font-mono font-bold text-slate-900">
                          <span 
                            className="inline-block w-2 h-2 rounded-full ml-1.5"
                            style={{ backgroundColor: sep.color || '#38bdf8' }}
                          />
                          {sep.code}
                        </td>
                        <td className="py-2 px-3 font-bold text-slate-900">
                          {sep.name}
                        </td>
                        <td className="py-2 px-3 text-slate-600">
                          {sep.binderName || sep.binderCode}
                        </td>
                        <td className="py-2 px-3 font-mono text-slate-600 text-[11px]">
                          {sep.papersCount || 20} ورقة
                        </td>
                        <td className="py-2 px-3 text-center whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            sep.status === 'available'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}>
                            {sep.status === 'available' ? '🟢 متاح' : '🟡 مستعار'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                لا توجد فواصل كرتونية مودعة في هذا الرف بعد.
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
