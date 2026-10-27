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
  documents = [], 
  onSelectBinder, 
  onOpenQRModal, 
  onOpenPrintModal,
  onOpenAddDocWithBinder 
}) {
  const [cabinetFilter, setCabinetFilter] = useState('all');
  const [search, setSearch] = useState('');

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
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-brand-50 text-brand-600 border border-brand-200">
              <FolderArchive className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-cairo">
              المجلدات النشطة والأرفف الفيزيائية
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            إدارة ومتابعة المجلدات الكرتونية وسعتها الاستيعابية وتوزيعها على أرفف الخزائن
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'خزانة أ', 'خزانة ب', 'خزانة ج'].map((cab) => (
            <button
              key={cab}
              type="button"
              onClick={() => setCabinetFilter(cab)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                cabinetFilter === cab
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cab === 'all' ? 'جميع الخزائن' : cab}
            </button>
          ))}
        </div>
      </div>

      {/* Binders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredBinders.map((binder) => {
          // Count documents belonging to this binder
          const binderDocs = documents.filter(d => d.binderId === binder.id);
          const docsCount = binderDocs.length || binder.currentDocsCount || 0;
          const capacityPercentage = Math.min(100, Math.round((docsCount / binder.totalCapacity) * 100));
          const checkedOutInBinder = binderDocs.filter(d => d.status === 'checked_out').length;

          return (
            <div
              key={binder.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-card hover:shadow-lg transition-all p-5 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Binder Color accent bar */}
              <div 
                className="absolute top-0 right-0 left-0 h-1.5" 
                style={{ backgroundColor: binder.color || '#0284c7' }}
              />

              <div>
                {/* Top Location & Code */}
                <div className="flex items-center justify-between text-xs mb-3 pt-1">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    <MapPin className="w-3.5 h-3.5 text-brand-600" />
                    <span>{binder.cabinet} • {binder.shelf}</span>
                  </div>
                  <span className="font-mono text-[11px] font-bold text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    {binder.code}
                  </span>
                </div>

                {/* Binder Title */}
                <h3 className="text-base font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                  {binder.name}
                </h3>
                <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                  {binder.description}
                </p>

                {/* Stats: Docs Count & Checked Out */}
                <div className="grid grid-cols-2 gap-2 my-4">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <div className="text-base font-black text-slate-900">{docsCount}</div>
                    <div className="text-[11px] text-slate-600">وثيقة ورقية</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-100 text-center">
                    <div className="text-base font-black text-amber-700">{checkedOutInBinder}</div>
                    <div className="text-[11px] text-amber-800">مستعارة حالياً</div>
                  </div>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1 mb-4">
                  <div className="flex items-center justify-between text-[11px] text-slate-600">
                    <span>نسبة امتلاء المجلد:</span>
                    <span className="font-bold text-slate-700">{capacityPercentage}% ({docsCount}/{binder.totalCapacity})</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        capacityPercentage > 85 ? 'bg-red-500' : capacityPercentage > 60 ? 'bg-amber-500' : 'bg-brand-600'
                      }`}
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
