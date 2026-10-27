import React, { useState } from 'react';
import { 
  FolderArchive, 
  MapPin, 
  QrCode, 
  Printer, 
  Layers, 
  FileText, 
  Plus, 
  Search, 
  FolderKanban, 
  CheckCircle2, 
  Barcode,
  Sparkles
} from 'lucide-react';

export default function BindersView({ 
  binders = [], 
  separators = [], 
  documents = [],
  onSelectBinder, 
  onOpenQRModal, 
  onOpenPrintModal 
}) {
  const [cabinetFilter, setCabinetFilter] = useState('all');
  const [search, setSearch] = useState('');

  const activeItems = separators.length > 0 ? separators : documents;

  const filteredBinders = binders.filter((b) => {
    const matchesCabinet = cabinetFilter === 'all' || b.cabinet === cabinetFilter;
    const matchesSearch = !search || (
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.code.toLowerCase().includes(search.toLowerCase()) ||
      b.category.toLowerCase().includes(search.toLowerCase())
    );
    return matchesCabinet && matchesSearch;
  });

  return (
    <div className="space-y-5 font-cairo">
      
      {/* Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <FolderArchive className="w-5 h-5 text-blue-400 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              المجلدات الفيزيائية والأرفف
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            متابعة المجلدات وأكوادها وسعتها الاستيعابية من الفواصل الكرتونية
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {['all', 'خزانة أ', 'خزانة ب', 'خزانة ج'].map((cab) => (
            <button
              key={cab}
              type="button"
              onClick={() => setCabinetFilter(cab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                cabinetFilter === cab
                  ? 'bg-blue-700 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cab === 'all' ? 'جميع الخزائن' : cab}
            </button>
          ))}
        </div>
      </div>

      {/* Binders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBinders.map((binder) => {
          const binderSeps = activeItems.filter(s => s.binderId === binder.id || s.binderCode === binder.code);
          const sepsCount = binderSeps.length || binder.currentSeparatorsCount || 0;
          const capacity = binder.totalCapacity || 10;
          const capacityPercentage = Math.min(100, Math.round((sepsCount / capacity) * 100));
          const checkedOutInBinder = binderSeps.filter(s => s.status === 'checked_out').length;

          return (
            <div
              key={binder.id}
              className="bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition-all p-4 flex flex-col justify-between group relative overflow-hidden"
            >
              <div 
                className="absolute top-0 right-0 left-0 h-1" 
                style={{ backgroundColor: binder.color || '#0284c7' }}
              />

              <div>
                {/* Top Location & Code */}
                <div className="flex items-center justify-between text-xs mb-2 pt-0.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{binder.cabinet} • {binder.shelf}</span>
                  </div>
                  <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                    {binder.code}
                  </span>
                </div>

                {/* Binder Title */}
                <h3 className="text-sm font-black text-slate-900 group-hover:text-blue-700 transition-colors">
                  {binder.name}
                </h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {binder.description}
                </p>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 my-3">
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                    <div className="text-base font-black text-slate-900 font-mono">{sepsCount}</div>
                    <div className="text-xs text-slate-500 font-medium">فاصل كرتوني</div>
                  </div>
                  <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 text-center">
                    <div className="text-base font-black text-amber-700 font-mono">{checkedOutInBinder}</div>
                    <div className="text-xs text-slate-500 font-medium">مستعارة حالياً</div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 mb-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>نسبة الامتلاء:</span>
                    <span className="font-bold text-slate-700 font-mono">{capacityPercentage}% ({sepsCount}/{capacity} فواصل)</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${capacityPercentage}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onSelectBinder(binder)}
                  className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>تصفح الوثائق</span>
                </button>

                <button
                  type="button"
                  onClick={() => onOpenQRModal(binder)}
                  title="مسح QR المجلد"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <QrCode className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onOpenPrintModal(binder)}
                  title="طباعة ملصق الكعب"
                  className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
