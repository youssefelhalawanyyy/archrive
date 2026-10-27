import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  FolderArchive, 
  Layers, 
  Plus, 
  MapPin, 
  Check, 
  QrCode, 
  Printer, 
  Trash2, 
  FolderPlus, 
  Search, 
  LayoutGrid, 
  List, 
  Calendar,
  Sparkles,
  ChevronLeft,
  FileText,
  Boxes,
  X
} from 'lucide-react';

export default function ChaptersHierarchyView({
  chapters = [],
  binders = [],
  separators = [],
  globalSearchQuery = '',
  setGlobalSearchQuery,
  onOpenAddChapterModal,
  onOpenAddBinderModal,
  onOpenAddSeparationModal,
  onToggleStatus,
  onOpenQRModal,
  onOpenPrintModal,
  onDeleteSeparator
}) {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?.id || 'ch-amn');
  const [selectedBinderId, setSelectedBinderId] = useState(null);
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'available', 'checked_out'
  const [viewMode, setViewMode] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table';
  });

  // If selected chapter is invalid, default to first chapter
  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  
  // Binders that belong to the active chapter
  const chapterBinders = useMemo(() => {
    if (!activeChapter) return [];
    return binders.filter(
      b => b.chapterId === activeChapter.id || b.chapterCode === activeChapter.code
    );
  }, [binders, activeChapter]);

  // Active binder: either user-selected, or first binder in this chapter
  const activeBinder = useMemo(() => {
    if (selectedBinderId) {
      const found = binders.find(b => b.id === selectedBinderId);
      if (found && (found.chapterId === activeChapter?.id || found.chapterCode === activeChapter?.code)) {
        return found;
      }
    }
    return chapterBinders[0] || null;
  }, [selectedBinderId, binders, activeChapter, chapterBinders]);

  // Search query (combines local search and global navbar search)
  const effectiveSearch = (localSearch || globalSearchQuery || '').toLowerCase().trim();

  // Filter separators inside the active binder
  const binderSeparators = useMemo(() => {
    if (!activeBinder) return [];
    
    return separators.filter(s => {
      const belongsToBinder = s.binderId === activeBinder.id || s.binderCode === activeBinder.code;
      if (!belongsToBinder) return false;

      // Status filter
      if (statusFilter === 'available' && s.status !== 'available') return false;
      if (statusFilter === 'checked_out' && s.status !== 'checked_out') return false;

      // Search filter
      if (effectiveSearch) {
        const matchesName = s.name?.toLowerCase().includes(effectiveSearch);
        const matchesCode = s.code?.toLowerCase().includes(effectiveSearch);
        const matchesClient = s.client?.toLowerCase().includes(effectiveSearch);
        const matchesDesc = s.description?.toLowerCase().includes(effectiveSearch);
        const matchesBorrower = s.borrower?.toLowerCase().includes(effectiveSearch);
        return matchesName || matchesCode || matchesClient || matchesDesc || matchesBorrower;
      }

      return true;
    });
  }, [separators, activeBinder, statusFilter, effectiveSearch]);

  // Stats for the active binder
  const totalInActiveBinder = separators.filter(
    s => s.binderId === activeBinder?.id || s.binderCode === activeBinder?.code
  ).length;
  const availableInActiveBinder = separators.filter(
    s => (s.binderId === activeBinder?.id || s.binderCode === activeBinder?.code) && s.status === 'available'
  ).length;
  const checkedOutInActiveBinder = totalInActiveBinder - availableInActiveBinder;

  return (
    <div className="space-y-6 font-cairo">
      
      {/* ================= 1. BREADCRUMBS & TOP SUMMARY ================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            {/* Active Breadcrumb Trail */}
            <div className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500 mb-1.5">
              <span className="flex items-center gap-1 text-slate-700">
                <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                الأرشيف الميداني
              </span>
              <ChevronLeft className="w-3 h-3 text-slate-400" />
              <span className="text-blue-700 font-bold">
                {activeChapter ? `${activeChapter.name} (${activeChapter.code})` : 'اختر الموضوع'}
              </span>
              {activeBinder && (
                <>
                  <ChevronLeft className="w-3 h-3 text-slate-400" />
                  <span className="text-slate-900 font-extrabold bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {activeBinder.name} ({activeBinder.code})
                  </span>
                </>
              )}
            </div>

            <h2 className="text-lg sm:text-xl font-black text-slate-900">
              أرشيف الموضوعات والمجلدات والفواصل الورقية
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              اختر الموضوع (الباب) أولاً، ثم المجلد الفيزيائي، لتصفح الفواصل الكرتونية المودعة بداخله بسهولة
            </p>
          </div>

          {/* Quick Action: Add Chapter */}
          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <button
              type="button"
              id="add-chapter-top-cta"
              onClick={onOpenAddChapterModal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 text-blue-400" />
              <span>إضافة موضوع (باب) جديد</span>
            </button>
          </div>
        </div>
      </div>

      {/* ================= 2. CHAPTERS SELECTOR (الخطوة 1: الموضوع) ================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center shrink-0">
              1
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
              الموضوع (الباب الرئيسي للتصنيف)
            </h3>
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">
              — اختر الموضوع لعرض المجلدات التابعة له
            </span>
          </div>

          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
            {chapters.length} موضوعات مسجلة
          </span>
        </div>

        {/* Chapters Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-1">
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
                  setLocalSearch('');
                }}
                className={`p-3.5 rounded-xl border text-right transition-all cursor-pointer relative flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-slate-900'
                    : 'bg-slate-50/70 hover:bg-white text-slate-800 border-slate-200 hover:border-slate-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className={`font-mono text-xs font-black px-2 py-0.5 rounded ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-white text-slate-900 border border-slate-200'
                    }`}>
                      {ch.code}
                    </span>
                    <span className={`text-xs font-bold ${isSelected ? 'text-blue-300' : 'text-slate-500'}`}>
                      {bCount} مجلدات
                    </span>
                  </div>

                  <div className="text-xs sm:text-sm font-bold leading-snug">
                    {ch.name}
                  </div>
                </div>

                {isSelected && (
                  <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                    <span>الموضوع النشط حالياً</span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= 3. BINDERS SELECTOR (الخطوة 2: المجلدات) ================= */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-700 text-white text-xs font-black flex items-center justify-center shrink-0">
              2
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                مجلدات موضوع: {activeChapter?.name}
              </h3>
              <p className="text-xs text-slate-500">
                انقر على أي مجلد لفتح قائمة الفواصل الكرتونية المودعة بداخله أدناه
              </p>
            </div>
          </div>

          <button
            type="button"
            id="add-binder-btn"
            onClick={() => onOpenAddBinderModal(activeChapter?.id)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>+ إضافة مجلد جديد لهذا الموضوع</span>
          </button>
        </div>

        {/* Binders Cards Grid */}
        {chapterBinders.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pt-1">
            {chapterBinders.map((b) => {
              const isSelected = activeBinder?.id === b.id;
              const sepsCount = separators.filter(s => s.binderId === b.id || s.binderCode === b.code).length;

              return (
                <div
                  key={b.id}
                  onClick={() => {
                    setSelectedBinderId(b.id);
                    setLocalSearch('');
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/80 border-blue-600 shadow-sm ring-2 ring-blue-600'
                      : 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div>
                    {/* Code & Location */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-2xs">
                        {b.code}
                      </span>
                      <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-blue-600" />
                        <span>{b.cabinet} • {b.shelf}</span>
                      </span>
                    </div>

                    {/* Binder Title */}
                    <h4 className="text-sm font-black text-slate-900 line-clamp-1 mb-1">
                      {b.name}
                    </h4>
                    {b.description && (
                      <p className="text-xs text-slate-500 line-clamp-1 mb-2">
                        {b.description}
                      </p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between text-xs pt-2.5 border-t border-slate-200/80 font-medium mt-2">
                    <span className="text-slate-600">
                      يحتوي: <strong className="text-slate-900 font-bold">{sepsCount}</strong> فواصل
                    </span>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenPrintModal(b);
                        }}
                        title="طباعة فهرس المجلد وملصق الكعب"
                        className="p-1 rounded text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-colors cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                      </button>

                      {isSelected ? (
                        <span className="text-blue-700 font-black flex items-center gap-1">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>مفتوح</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 group-hover:text-blue-600">
                          فتح ←
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <FolderArchive className="w-10 h-10 text-slate-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-800">
              لا توجد مجلدات مسجلة في هذا الباب حتى الآن
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              ابدأ بإضافة أول مجلد فيزيائي لترتيب الفواصل الكرتونية بداخله
            </p>
            <button
              type="button"
              onClick={() => onOpenAddBinderModal(activeChapter?.id)}
              className="mt-3 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
            >
              + إضافة أول مجلد لهذا الباب الآن
            </button>
          </div>
        )}
      </div>

      {/* ================= 4. SEPARATORS STAGE (الخطوة 3: الفواصل الكرتونية) ================= */}
      {activeBinder && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs space-y-4">
          
          {/* Section Header: Binder identity + Live stats + Actions */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                  3
                </span>
                <span className="text-xs font-bold text-slate-600">
                  الفواصل الكرتونية المودعة داخل مجلد:
                </span>
                <span className="font-mono text-xs font-black bg-blue-100 text-blue-900 px-2 py-0.5 rounded border border-blue-200">
                  {activeBinder.code}
                </span>
                <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-blue-600 inline" />
                  {activeBinder.cabinet} • {activeBinder.shelf}
                </span>
              </div>

              <div className="flex items-center flex-wrap gap-3 mt-1">
                <h3 className="text-lg font-black text-slate-900">
                  {activeBinder.name}
                </h3>

                {/* Quick metrics pills */}
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                    الإجمالي: {totalInActiveBinder} فاصل
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
                    🟢 {availableInActiveBinder} متاح
                  </span>
                  {checkedOutInActiveBinder > 0 && (
                    <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                      🟡 {checkedOutInActiveBinder} مستعار
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Controls Bar: Search + Filter + View Toggle + Add Button */}
            <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
              {/* Search Inside Binder */}
              <div className="relative">
                <Search className="w-4 h-4 absolute right-3 top-2.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={localSearch}
                  onChange={(e) => setLocalSearch(e.target.value)}
                  placeholder="ابحث داخل هذا المجلد..."
                  className="pr-9 pl-8 py-1.5 rounded-lg border border-slate-300 text-xs text-slate-800 placeholder-slate-400 bg-white focus:border-blue-600 focus:ring-1 focus:ring-blue-600 outline-hidden w-44 sm:w-56"
                />
                {localSearch && (
                  <button
                    type="button"
                    onClick={() => setLocalSearch('')}
                    className="absolute left-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === 'all' ? 'bg-white text-slate-900 shadow-2xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('available')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === 'available' ? 'bg-emerald-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-emerald-700'
                  }`}
                >
                  متاح
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('checked_out')}
                  className={`px-2.5 py-1 rounded transition-colors ${
                    statusFilter === 'checked_out' ? 'bg-amber-600 text-white shadow-2xs font-extrabold' : 'text-slate-600 hover:text-amber-800'
                  }`}
                >
                  مستعار
                </button>
              </div>

              {/* View toggle: Table or Cards */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewMode('table')}
                  title="عرض جدول منظم"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('cards')}
                  title="عرض بطاقات فواصل"
                  className={`p-1.5 rounded-md transition-colors ${
                    viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
              </div>

              {/* Print Binder Index & Spine button */}
              <button
                type="button"
                id="print-active-binder-index-btn"
                onClick={() => onOpenPrintModal(activeBinder)}
                title="طباعة فهرس محتويات المجلد وملصق الكعب"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-blue-400" />
                <span>طباعة فهرس المجلد</span>
              </button>

              {/* Add Separator button */}
              <button
                type="button"
                id="add-separator-inside-binder-btn"
                onClick={() => onOpenAddSeparationModal(activeBinder)}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ إضافة فاصل كرتوني</span>
              </button>
            </div>
          </div>

          {/* Separators List */}
          {binderSeparators.length > 0 ? (
            viewMode === 'table' ? (
              /* ================= READABLE, HIGH-CONTRAST TABLE VIEW ================= */
              <div className="border border-slate-200 rounded-xl overflow-x-auto shadow-2xs">
                <table className="w-full text-right text-sm">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-extrabold text-xs uppercase">
                    <tr>
                      <th className="py-3.5 px-4">كود الفاصل</th>
                      <th className="py-3.5 px-4">اسم الفاصل ومحتواه</th>
                      <th className="py-3.5 px-4">عدد الأوراق</th>
                      <th className="py-3.5 px-4">الجهة / العميل</th>
                      <th className="py-3.5 px-4">تاريخ الإيداع</th>
                      <th className="py-3.5 px-4 text-center">حالة التواجد</th>
                      <th className="py-3.5 px-4 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {binderSeparators.map((sep) => {
                      const isAvailable = sep.status === 'available';

                      return (
                        <tr 
                          key={sep.id}
                          className="hover:bg-slate-50/90 transition-colors"
                        >
                          {/* Code */}
                          <td className="py-3.5 px-4 whitespace-nowrap">
                            <div className="flex items-center gap-2.5">
                              <span 
                                className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs border border-white" 
                                style={{ backgroundColor: sep.color || '#38bdf8' }}
                                title={`لون التبويب: ${sep.color || '#38bdf8'}`}
                              />
                              <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                                {sep.code}
                              </span>
                            </div>
                          </td>

                          {/* Title & Notes */}
                          <td className="py-3.5 px-4">
                            <div className="text-sm font-bold text-slate-900 leading-snug">
                              {sep.name}
                            </div>
                            {sep.description && (
                              <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                                {sep.description}
                              </div>
                            )}
                          </td>

                          {/* Papers Count */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                            <span className="font-bold text-slate-900 text-sm">{sep.papersCount || 20}</span> ورقة
                          </td>

                          {/* Client */}
                          <td className="py-3.5 px-4 whitespace-nowrap text-xs font-semibold text-slate-700">
                            {sep.client || 'عام'}
                          </td>

                          {/* Date */}
                          <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-500">
                            {sep.date}
                          </td>

                          {/* Status Badge */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(sep)}
                              title="انقر لتسجيل الإعارة أو الاسترجاع"
                              className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer shadow-2xs ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isAvailable ? '🟢 متاح في المجلد' : `🟡 مستعار (${sep.borrower?.split(' ')[0] || 'مستعار'})`}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => onOpenQRModal(sep)}
                                title="عرض كود QR الفاصل"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onOpenPrintModal(sep)}
                                title="طباعة ملصق تبويب الفاصل"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Printer className="w-4 h-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() => onDeleteSeparator(sep.id)}
                                title="حذف الفاصل"
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
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
              /* ================= REALISTIC SEPARATOR CARDS VIEW (EASY SCANNING) ================= */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {binderSeparators.map((sep) => {
                  const isAvailable = sep.status === 'available';

                  return (
                    <div
                      key={sep.id}
                      className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs hover:shadow-xs transition-all relative overflow-hidden flex flex-col justify-between"
                    >
                      {/* Top colored divider tab matching physical cardboard */}
                      <div 
                        className="absolute top-0 right-0 left-0 h-2"
                        style={{ backgroundColor: sep.color || '#38bdf8' }}
                      />

                      <div>
                        {/* Header: Code & Date */}
                        <div className="flex items-center justify-between text-xs mb-2.5 pt-1">
                          <span className="font-mono text-xs font-black bg-slate-900 text-white px-2.5 py-0.5 rounded shadow-2xs">
                            {sep.code}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {sep.date}
                          </span>
                        </div>

                        {/* Separator Title */}
                        <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 leading-snug">
                          {sep.name}
                        </h4>

                        {/* Metadata Details */}
                        <div className="mt-3 text-xs text-slate-600 space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                          <div className="flex items-center justify-between">
                            <span className="text-slate-500">الأوراق المحفوظة:</span>
                            <span className="font-extrabold text-slate-900 font-mono">{sep.papersCount || 20} ورقة</span>
                          </div>
                          {sep.client && (
                            <div className="flex items-center justify-between">
                              <span className="text-slate-500">الجهة / العميل:</span>
                              <span className="font-bold text-slate-800">{sep.client}</span>
                            </div>
                          )}
                          {sep.description && (
                            <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 line-clamp-1">
                              {sep.description}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Footer: Status button + Actions */}
                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(sep)}
                          className={`px-3 py-1 rounded-lg text-xs font-extrabold border transition-all cursor-pointer ${
                            isAvailable
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                          }`}
                        >
                          {isAvailable ? '🟢 متاح في المجلد' : '🟡 مستعار'}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => onOpenQRModal(sep)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="رمز QR"
                          >
                            <QrCode className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onOpenPrintModal(sep)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="طباعة ملصق تبويب"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteSeparator(sep.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                            title="حذف"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          ) : (
            <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
              <Layers className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <h4 className="text-sm font-bold text-slate-800">
                {effectiveSearch ? 'لا توجد فواصل مطابقة لبحثك' : 'لا توجد فواصل كرتونية مضافة في هذا المجلد بعد'}
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                {effectiveSearch ? 'جرّب البحث بكلمة أخرى أو قم بإلغاء التصفية' : 'أضف أول فاصل كرتوني داخل هذا المجلد لترتيب وتوثيق الأوراق'}
              </p>
              {!effectiveSearch && (
                <button
                  type="button"
                  onClick={() => onOpenAddSeparationModal(activeBinder)}
                  className="mt-3 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-lg shadow-2xs transition-colors cursor-pointer"
                >
                  + إضافة أول فاصل لهذا المجلد الآن
                </button>
              )}
            </div>
          )}

        </div>
      )}

    </div>
  );
}
