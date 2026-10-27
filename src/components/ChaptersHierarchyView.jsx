import React, { useState } from 'react';
import { 
  BookOpen, 
  FolderArchive, 
  Layers, 
  FileText, 
  Plus, 
  MapPin, 
  Sparkles, 
  ChevronLeft, 
  CheckCircle2, 
  Clock, 
  QrCode, 
  Eye, 
  Barcode,
  FolderPlus,
  Hash,
  Building2,
  FolderKanban,
  FilePlus2,
  Calendar,
  Check
} from 'lucide-react';

export default function ChaptersHierarchyView({
  chapters = [],
  binders = [],
  documents = [],
  onOpenAddChapterModal,
  onOpenAddBinderModal,
  onOpenAddSeparationModal,
  onOpenAddDocWithContext,
  onSelectDoc,
  onToggleStatus,
  onOpenQRModal
}) {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?.id || 'ch-fin');
  const [selectedBinderId, setSelectedBinderId] = useState(null);
  const [selectedSeparationId, setSelectedSeparationId] = useState(null);

  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  const chapterBinders = binders.filter(b => b.chapterId === activeChapter?.id || b.chapterCode === activeChapter?.code);
  
  // Active binder defaults to first binder of chapter
  const activeBinder = (selectedBinderId ? binders.find(b => b.id === selectedBinderId) : chapterBinders[0]) || chapterBinders[0];
  const binderSeparations = activeBinder?.separations || [];

  // Active separation
  const activeSeparation = selectedSeparationId ? binderSeparations.find(s => s.id === selectedSeparationId) : null;

  // Documents under active binder / separation
  const binderDocs = documents.filter(d => {
    if (activeSeparation) {
      return d.binderId === activeBinder?.id && (d.separationId === activeSeparation.id || d.folderTab?.includes(activeSeparation.code));
    }
    return d.binderId === activeBinder?.id;
  });

  return (
    <div className="space-y-5 font-cairo">
      
      {/* 1. Corporate Header & Action Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
              <span>الأرشيف الورقي</span>
              <span>/</span>
              <span className="text-blue-700 font-bold">{activeChapter?.name} ({activeChapter?.code})</span>
              {activeBinder && (
                <>
                  <span>/</span>
                  <span className="text-slate-800 font-mono font-bold">{activeBinder?.code}</span>
                </>
              )}
            </div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">
              الهيكل الأرشيفي والموضوعات
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              التصنيف الهرمي: الموضوع الرئيسي ➔ المجلد الفيزيائي ➔ الفواصل الكرتونية ➔ الوثائق الورقية
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
            <button
              type="button"
              id="add-chapter-btn"
              onClick={onOpenAddChapterModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-300 shadow-2xs transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>إضافة موضوع (Chapter)</span>
            </button>

            <button
              type="button"
              id="add-binder-btn"
              onClick={() => onOpenAddBinderModal(activeChapter?.id)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>+ مجلد لهذا الموضوع</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chapters Strip (الموضوعات / الأبواب الرئيسية) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            1. اختر الموضوع (الباب الرئيسي)
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            {chapters.length} موضوعات معتمدة
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {chapters.map((ch) => {
            const isSelected = activeChapter?.id === ch.id;
            const bCount = binders.filter(b => b.chapterId === ch.id || b.chapterCode === ch.code).length;
            const dCount = documents.filter(d => d.chapterId === ch.id || d.chapterCode === ch.code).length;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setSelectedBinderId(null);
                  setSelectedSeparationId(null);
                }}
                className={`p-3 rounded-lg border text-right transition-all cursor-pointer relative overflow-hidden group ${
                  isSelected
                    ? 'bg-blue-50/60 border-blue-600 shadow-xs ring-1 ring-blue-600'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/70'
                }`}
              >
                {/* Subtle top indicator line in chapter color */}
                <div 
                  className="absolute top-0 right-0 left-0 h-1" 
                  style={{ backgroundColor: ch.color || '#0284c7' }} 
                />

                <div className="flex items-center justify-between w-full mb-1.5 pt-0.5">
                  <span className="font-mono text-[11px] font-black px-2 py-0.5 rounded bg-slate-900 text-white">
                    {ch.code}
                  </span>
                  {isSelected && (
                    <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  )}
                </div>

                <div className="text-xs font-bold text-slate-900 truncate">
                  {ch.name}
                </div>

                <div className="text-[10px] text-slate-500 font-medium mt-1">
                  {bCount} مجلدات • {dCount} وثيقة
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Two Main Explorer Columns: Binders (Right) and Separations/Docs (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Pane 1: Binders List under Active Chapter (4.5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
          
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                2. المجلدات الفيزيائية
              </div>
              <h3 className="text-sm font-black text-slate-900">
                مجلدات {activeChapter?.name}
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onOpenAddBinderModal(activeChapter?.id)}
              className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200 transition-colors cursor-pointer"
            >
              <Plus className="w-3 h-3" />
              <span>مجلد جديد</span>
            </button>
          </div>

          {/* Binders Cards */}
          {chapterBinders.length > 0 ? (
            <div className="space-y-2.5">
              {chapterBinders.map((b) => {
                const isSelected = activeBinder?.id === b.id;
                const docsCount = documents.filter(d => d.binderId === b.id).length || b.currentDocsCount || 0;
                const sepsCount = (b.separations || []).length;
                const capacityPercent = Math.min(100, Math.round((docsCount / (b.totalCapacity || 200)) * 100));

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBinderId(b.id);
                      setSelectedSeparationId(null);
                    }}
                    className={`p-3.5 rounded-lg border transition-all cursor-pointer relative ${
                      isSelected
                        ? 'bg-blue-50/70 border-blue-600 shadow-xs ring-1 ring-blue-600'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {/* Top Row: Auto Code & Physical Location */}
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                          {b.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          {b.cabinet} • {b.shelf}
                        </span>
                      </div>

                      <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {sepsCount} فواصل
                      </span>
                    </div>

                    {/* Binder Name */}
                    <div className="text-xs font-bold text-slate-900 leading-snug">
                      {b.name}
                    </div>

                    {/* Capacity Bar */}
                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>السعة: <strong className="text-slate-800 font-mono">{docsCount}</strong> / {b.totalCapacity} وثيقة</span>
                      <span className="font-mono">{capacityPercent}%</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <FolderKanban className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
              <p className="text-xs font-bold text-slate-700">لا توجد مجلدات مسجلة تحت هذا الموضوع</p>
              <button
                type="button"
                onClick={() => onOpenAddBinderModal(activeChapter?.id)}
                className="mt-2.5 px-3 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded shadow-2xs hover:bg-blue-800 transition-colors"
              >
                + إضافة أول مجلد
              </button>
            </div>
          )}

        </div>

        {/* Pane 2: Separations & Documents inside Selected Binder (7.5 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  3. الفواصل والوثائق في
                </span>
                <span className="font-mono text-xs font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {activeBinder?.code || 'FIN-01'}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                {activeBinder?.name || 'اختر مجلداً'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {activeBinder && (
                <button
                  type="button"
                  id="add-separation-btn"
                  onClick={() => onOpenAddSeparationModal(activeBinder)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-xs font-bold border border-slate-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5 text-slate-500" />
                  <span>+ فاصل</span>
                </button>
              )}

              {activeBinder && (
                <button
                  type="button"
                  onClick={() => onOpenAddDocWithContext(activeChapter, activeBinder, activeSeparation)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إيداع وثيقة</span>
                </button>
              )}
            </div>
          </div>

          {/* Separations Filter Tabs (Clean Horizontal Tabs that never wrap or break) */}
          <div>
            <div className="text-[11px] font-bold text-slate-500 mb-2 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                فواصل المجلد (اضغط للفلترة):
              </span>
              <span className="text-[10px] text-slate-400">
                {binderSeparations.length} فواصل كرتونية
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              {/* All tab */}
              <button
                type="button"
                onClick={() => setSelectedSeparationId(null)}
                className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                  selectedSeparationId === null
                    ? 'bg-slate-900 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                جميع فواصل المجلد ({documents.filter(d => d.binderId === activeBinder?.id).length})
              </button>

              {/* Individual Separation Tabs */}
              {binderSeparations.map((sep) => {
                const isSepSelected = selectedSeparationId === sep.id;
                const count = documents.filter(d => 
                  d.binderId === activeBinder?.id && (d.separationId === sep.id || d.folderTab?.includes(sep.code))
                ).length;

                return (
                  <button
                    key={sep.id}
                    type="button"
                    onClick={() => setSelectedSeparationId(isSepSelected ? null : sep.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer whitespace-nowrap border ${
                      isSepSelected
                        ? 'bg-blue-50 text-blue-900 border-blue-500 shadow-2xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <span 
                      className="w-2 h-2 rounded-full shrink-0" 
                      style={{ backgroundColor: sep.color || '#38bdf8' }}
                    />
                    <span className="font-mono font-bold text-[11px] opacity-80">{sep.code}</span>
                    <span>{sep.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">({count})</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Documents Table for this Binder/Separation */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500">
                قائمة الوثائق الورقية المودعة ({binderDocs.length})
              </span>
            </div>

            {binderDocs.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">كود الوثيقة</th>
                      <th className="py-2.5 px-3">اسم الوثيقة والعميل</th>
                      <th className="py-2.5 px-3">الفاصل الميداني</th>
                      <th className="py-2.5 px-3">التاريخ</th>
                      <th className="py-2.5 px-3 text-center">الحالة</th>
                      <th className="py-2.5 px-3 text-center">إجراء</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {binderDocs.map((doc) => {
                      const isAvailable = doc.status === 'available';

                      return (
                        <tr 
                          key={doc.id}
                          onClick={() => onSelectDoc(doc)}
                          className="hover:bg-slate-50 transition-colors cursor-pointer group"
                        >
                          {/* Code */}
                          <td className="py-2.5 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                            {doc.docNumber}
                          </td>

                          {/* Title & Client */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-1">
                              {doc.title}
                            </div>
                            {doc.client && (
                              <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                <Building2 className="w-3 h-3 text-slate-400" />
                                {doc.client}
                              </div>
                            )}
                          </td>

                          {/* Separation */}
                          <td className="py-2.5 px-3 whitespace-nowrap text-slate-600 text-[11px]">
                            {doc.separationName || doc.folderTab || 'فاصل عام'}
                          </td>

                          {/* Date */}
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {doc.date}
                          </td>

                          {/* Status */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleStatus(doc);
                              }}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isAvailable ? '🟢 متاح' : '🟡 مستعار'}
                            </button>
                          </td>

                          {/* Action */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                              <button
                                type="button"
                                onClick={() => onOpenQRModal(doc)}
                                title="مسح رمز QR"
                                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center bg-slate-50 rounded-lg border border-slate-200">
                <FileText className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">لا توجد وثائق في هذا الفاصل حالياً</p>
                <button
                  type="button"
                  onClick={() => onOpenAddDocWithContext(activeChapter, activeBinder, activeSeparation)}
                  className="mt-2 px-3 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded shadow-2xs hover:bg-blue-800 transition-colors"
                >
                  + إيداع وثيقة ورقية هنا
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
