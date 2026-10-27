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
  ChevronDown,
  Building2,
  FolderKanban
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

  // Active separation defaults to first separation or all
  const activeSeparation = selectedSeparationId ? binderSeparations.find(s => s.id === selectedSeparationId) : null;

  // Documents under active binder / separation
  const binderDocs = documents.filter(d => {
    if (activeSeparation) {
      return d.binderId === activeBinder?.id && (d.separationId === activeSeparation.id || d.folderTab?.includes(activeSeparation.code));
    }
    return d.binderId === activeBinder?.id;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-cairo">
      
      {/* 1. Header Banner & Actions */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-brand-50 text-brand-600 border border-brand-200 shadow-xs">
              <BookOpen className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-xs font-bold text-brand-700">الهيكل الأرشيفي الهرمي (Master Classification)</div>
              <h2 className="text-xl font-black text-slate-900">
                الموضوع ➔ المجلدات ➔ الفواصل ➔ الوثائق
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
            التصنيف الأرشيفي الميداني يبدأ بـ <strong>الموضوع (الباب الرئيسي)</strong>، تتبعه <strong>المجلدات الفيزيائية</strong> بأكواد تلقائية سهلة، وتنقسم داخل كل مجلد إلى <strong>فواصل وتبويبات كرتونية</strong> تضم أصول الوثائق.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            type="button"
            id="add-chapter-btn"
            onClick={onOpenAddChapterModal}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة موضوع جديد (Chapter)</span>
          </button>

          <button
            type="button"
            id="add-binder-btn"
            onClick={() => onOpenAddBinderModal(activeChapter?.id)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition-all cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ مجلد تحت هذا الموضوع</span>
          </button>
        </div>
      </div>

      {/* 2. Top Level: Chapters Selector (الموضوعات / الأبواب) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-brand-600"></span>
            <span>1. اختر الموضوع الرئيسي (الباب / Chapter):</span>
          </div>
          <span className="text-xs text-slate-600">إجمالي {chapters.length} موضوعات معتمدة</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {chapters.map((ch) => {
            const isSelected = activeChapter?.id === ch.id;
            const bCount = binders.filter(b => b.chapterId === ch.id || b.chapterCode === ch.code).length;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setSelectedBinderId(null);
                  setSelectedSeparationId(null);
                }}
                className={`p-3.5 rounded-2xl border text-right transition-all flex flex-col justify-between cursor-pointer group ${
                  isSelected
                    ? 'bg-brand-50/90 border-brand-500 ring-2 ring-brand-500/20 shadow-sm'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80 shadow-2xs'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-2">
                  <span 
                    className="font-mono text-xs font-black px-2 py-0.5 rounded-md border text-white shadow-2xs"
                    style={{ backgroundColor: ch.color || '#0284c7', borderColor: ch.color || '#0284c7' }}
                  >
                    {ch.code}
                  </span>
                  <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                    {bCount} مجلد
                  </span>
                </div>

                <div>
                  <div className={`text-sm font-black transition-colors ${isSelected ? 'text-brand-900' : 'text-slate-800'}`}>
                    {ch.name}
                  </div>
                  <div className="text-[11px] text-slate-600 mt-1 line-clamp-1">
                    {ch.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Main Workspace: Binders Under Chapter + Separations & Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Binders List under current Chapter */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 space-y-4">
          
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-500">2. المجلدات التابعة لـ:</span>
                <span className="text-xs font-black text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                  {activeChapter?.name} ({activeChapter?.code})
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                المجلدات الفيزيائية والأكواد التلقائية
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onOpenAddBinderModal(activeChapter?.id)}
              title="إضافة مجلد جديد لهذا الباب"
              className="p-2 rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 text-slate-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Binders List */}
          {chapterBinders.length > 0 ? (
            <div className="space-y-3">
              {chapterBinders.map((b) => {
                const isSelected = activeBinder?.id === b.id;
                const docsCount = documents.filter(d => d.binderId === b.id).length || b.currentDocsCount || 0;
                const sepsCount = (b.separations || []).length;

                return (
                  <div
                    key={b.id}
                    onClick={() => {
                      setSelectedBinderId(b.id);
                      setSelectedSeparationId(null);
                    }}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-brand-50/80 border-brand-500 shadow-sm ring-1 ring-brand-500/30'
                        : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    {/* Top Row: Auto-Generated Code & Location */}
                    <div className="flex items-center justify-between text-xs mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded-md shadow-2xs tracking-wider">
                          {b.code}
                        </span>
                        <span className="text-[11px] font-bold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-brand-600" />
                          {b.cabinet} • {b.shelf}
                        </span>
                      </div>

                      <span className="text-[11px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                        {sepsCount} فواصل
                      </span>
                    </div>

                    {/* Binder Name */}
                    <div className="text-sm font-black text-slate-900 group-hover:text-brand-700 transition-colors">
                      {b.name}
                    </div>

                    <div className="text-xs text-slate-600 mt-1 flex items-center justify-between">
                      <span>السعة: <strong>{docsCount}</strong> / {b.totalCapacity} وثيقة</span>
                      <span className="text-brand-600 text-[11px] font-bold flex items-center gap-1">
                        تصفح الفواصل ←
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <FolderKanban className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700">لا توجد مجلدات مسجلة تحت هذا الموضوع بعد</p>
              <p className="text-xs text-slate-600 mt-1">ابدأ بإنشاء مجلد فيزيائي ليتم توليد كوده تلقائياً (مثل {activeChapter?.code}-01)</p>
              <button
                type="button"
                onClick={() => onOpenAddBinderModal(activeChapter?.id)}
                className="mt-3 px-4 py-2 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-700 transition-colors"
              >
                + إضافة أول مجلد
              </button>
            </div>
          )}

        </div>

        {/* Right Column: Separations (الفواصل الداخلية) & Documents inside it */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-card p-5 space-y-5">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500">3. الفواصل والتبويبات الداخلية في:</span>
                <span className="font-mono text-xs font-black bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
                  {activeBinder?.code || 'FIN-01'}
                </span>
              </div>
              <h3 className="text-base font-black text-slate-900 mt-0.5">
                {activeBinder?.name || 'اختر مجلداً'}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              {activeBinder && (
                <button
                  type="button"
                  id="add-separation-btn"
                  onClick={() => onOpenAddSeparationModal(activeBinder)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-xs font-bold border border-blue-200 transition-colors cursor-pointer"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>+ فاصل كرتوني</span>
                </button>
              )}

              {activeBinder && (
                <button
                  type="button"
                  onClick={() => onOpenAddDocWithContext(activeChapter, activeBinder, activeSeparation)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-600 text-white hover:bg-brand-700 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ وثيقة في هذا المجلد</span>
                </button>
              )}
            </div>
          </div>

          {/* Visual Physical Dividers (الفواصل الكرتونية الملونة) */}
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-brand-600" />
                فواصل المجلد المتاحة (انقر للفلترة):
              </span>
              {activeSeparation && (
                <button
                  type="button"
                  onClick={() => setSelectedSeparationId(null)}
                  className="text-brand-600 hover:underline text-[11px]"
                >
                  عرض جميع فواصل المجلد
                </button>
              )}
            </div>

            {binderSeparations.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {binderSeparations.map((sep) => {
                  const isSepSelected = activeSeparation?.id === sep.id;
                  const docsInSep = documents.filter(d => 
                    d.binderId === activeBinder?.id && (d.separationId === sep.id || d.folderTab?.includes(sep.code))
                  ).length;

                  return (
                    <div
                      key={sep.id}
                      onClick={() => setSelectedSeparationId(isSepSelected ? null : sep.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden group ${
                        isSepSelected
                          ? 'bg-blue-50/90 border-blue-500 shadow-xs ring-1 ring-blue-500/30'
                          : 'bg-slate-50/70 border-slate-200 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      {/* Top Color Tab Indicator on Separation */}
                      <div 
                        className="absolute top-0 right-0 left-0 h-1.5"
                        style={{ backgroundColor: sep.color || '#38bdf8' }}
                      />

                      <div className="flex items-center justify-between text-xs mb-1 pt-1">
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-1.5 py-0.2 rounded border border-slate-200">
                          {sep.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-600 bg-white px-1.5 py-0.2 rounded-full">
                          {docsInSep} وثيقة
                        </span>
                      </div>

                      <div className="text-xs font-black text-slate-900 group-hover:text-brand-700 transition-colors truncate">
                        {sep.name}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-600">
                لا توجد فواصل داخلية مسجلة بعد في هذا المجلد. اضغط على "+ فاصل كرتوني" للتقسيم.
              </div>
            )}
          </div>

          {/* Documents Filed Under Selected Binder / Separation */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-brand-600" />
                <span>4. الوثائق المودعة {activeSeparation ? `داخل (${activeSeparation.name})` : `في المجلد (${activeBinder?.name})`}:</span>
              </div>
              <span className="text-xs font-bold text-slate-600">
                {binderDocs.length} وثيقة ورقية
              </span>
            </div>

            {binderDocs.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {binderDocs.map((doc) => {
                  const isAvailable = doc.status === 'available';

                  return (
                    <div
                      key={doc.id}
                      onClick={() => onSelectDoc(doc)}
                      className="p-3.5 rounded-xl border border-slate-200 hover:border-brand-400 bg-white hover:bg-brand-50/30 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl bg-slate-100 text-slate-600 group-hover:bg-brand-600 group-hover:text-white transition-colors shrink-0 mt-0.5">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900 group-hover:text-brand-700 transition-colors">
                            {doc.title}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-slate-600">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-bold text-slate-800">
                              {doc.docNumber}
                            </span>
                            <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.2 rounded">
                              {doc.separationName || doc.folderTab || 'فاصل عام'}
                            </span>
                            <span>• التاريخ: {doc.date}</span>
                            {doc.client && <span>• العميل: {doc.client}</span>}
                          </div>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleStatus(doc);
                          }}
                          className={`px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                          }`}
                        >
                          {isAvailable ? '🟢 متاح' : '🟡 مستعار'}
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectDoc(doc);
                          }}
                          title="تحديد الوثيقة وموقعها"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenQRModal(doc);
                          }}
                          title="مسح QR"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200">
                <FileText className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">لا توجد وثائق مودعة في هذا الفاصل حالياً</p>
                <button
                  type="button"
                  onClick={() => onOpenAddDocWithContext(activeChapter, activeBinder, activeSeparation)}
                  className="mt-2.5 px-3.5 py-1.5 bg-brand-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-brand-700 transition-colors"
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
