import React, { useState } from 'react';
import { 
  BookOpen, 
  FolderArchive, 
  Layers, 
  Plus, 
  MapPin, 
  Check, 
  Clock, 
  QrCode, 
  Printer, 
  Trash2, 
  FolderPlus, 
  Calendar, 
  Building2, 
  FileText
} from 'lucide-react';

export default function ChaptersHierarchyView({
  chapters = [],
  binders = [],
  separators = [],
  onOpenAddChapterModal,
  onOpenAddBinderModal,
  onOpenAddSeparationModal,
  onToggleStatus,
  onOpenQRModal,
  onOpenPrintModal,
  onDeleteSeparator
}) {
  const [selectedChapterId, setSelectedChapterId] = useState(chapters[0]?.id || 'ch-fin');
  const [selectedBinderId, setSelectedBinderId] = useState(null);

  const activeChapter = chapters.find(c => c.id === selectedChapterId) || chapters[0];
  const chapterBinders = binders.filter(b => b.chapterId === activeChapter?.id || b.chapterCode === activeChapter?.code);
  
  // Active binder defaults to first binder of chapter
  const activeBinder = (selectedBinderId ? binders.find(b => b.id === selectedBinderId) : chapterBinders[0]) || chapterBinders[0];

  // Separators inside active binder
  const binderSeparators = separators.filter(s => s.binderId === activeBinder?.id || s.binderCode === activeBinder?.code);

  return (
    <div className="space-y-5 font-cairo">
      
      {/* 1. Header Toolbar */}
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
              الهيكل الأرشيفي: الموضوع ➔ المجلدات ➔ الفواصل
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              إدارة الأرشيف بالترتيب الهرمي: تصنيف الموضوع الرئيسي، تنظيم المجلدات، وإيداع الفواصل الكرتونية
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
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ مجلد لهذا الموضوع</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Chapters Strip (الموضوعات / الأبواب) */}
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
            const sCount = separators.filter(s => s.chapterId === ch.id || s.chapterCode === ch.code).length;

            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => {
                  setSelectedChapterId(ch.id);
                  setSelectedBinderId(null);
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
                  {bCount} مجلدات • {sCount} فواصل
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Binders (Right) and Separators (Left) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* Pane 1: Binders List (4.5 cols) */}
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

          {/* Binders List */}
          {chapterBinders.length > 0 ? (
            <div className="space-y-2.5">
              {chapterBinders.map((b) => {
                const isSelected = activeBinder?.id === b.id;
                const sepsCount = separators.filter(s => s.binderId === b.id || s.binderCode === b.code).length;

                return (
                  <div
                    key={b.id}
                    onClick={() => setSelectedBinderId(b.id)}
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

                    <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
                      <span>السعة: <strong>{sepsCount}</strong> / {b.totalCapacity || 10} فواصل كرتونية</span>
                      <span className="text-blue-700 font-bold">عرض الفواصل ←</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-6 text-center bg-slate-50 rounded-lg border border-dashed border-slate-200">
              <FolderArchive className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
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

        {/* Pane 2: Separators inside Selected Binder (7.5 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-4">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  3. الفواصل الكرتونية المودعة في:
                </span>
                <span className="font-mono text-xs font-black bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200">
                  {activeBinder?.code || 'FIN-01'}
                </span>
              </div>
              <h3 className="text-sm font-black text-slate-900 mt-0.5">
                {activeBinder?.name || 'اختر مجلداً'} ({activeBinder?.cabinet} • {activeBinder?.shelf})
              </h3>
            </div>

            {/* Action to Add Separator inside this Binder */}
            <div>
              {activeBinder && (
                <button
                  type="button"
                  id="add-separator-inside-binder-btn"
                  onClick={() => onOpenAddSeparationModal(activeBinder)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ إضافة فاصل جديد للمجلد</span>
                </button>
              )}
            </div>
          </div>

          {/* Separators List / Table inside this Binder */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500">
                قائمة الفواصل الكرتونية ({binderSeparators.length})
              </span>
              <span className="text-[10px] text-slate-400">
                يتم تنظيم وحفظ الأوراق داخل هذه الفواصل مباشرة
              </span>
            </div>

            {binderSeparators.length > 0 ? (
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-3">كود الفاصل</th>
                      <th className="py-2.5 px-3">اسم الفاصل ومحتواه</th>
                      <th className="py-2.5 px-3">عدد الأوراق</th>
                      <th className="py-2.5 px-3">التاريخ / الفترة</th>
                      <th className="py-2.5 px-3 text-center">الحالة</th>
                      <th className="py-2.5 px-3 text-center">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {binderSeparators.map((sep) => {
                      const isAvailable = sep.status === 'available';

                      return (
                        <tr 
                          key={sep.id}
                          className="hover:bg-slate-50 transition-colors group"
                        >
                          {/* Code with color tab dot */}
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <div className="flex items-center gap-1.5">
                              <span 
                                className="w-2 h-2 rounded-full shrink-0" 
                                style={{ backgroundColor: sep.color || '#38bdf8' }}
                              />
                              <span className="font-mono font-bold text-slate-900">
                                {sep.code}
                              </span>
                            </div>
                          </td>

                          {/* Title & Notes */}
                          <td className="py-2.5 px-3">
                            <div className="font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                              {sep.name}
                            </div>
                            {sep.description && (
                              <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                                {sep.description}
                              </div>
                            )}
                          </td>

                          {/* Papers Count */}
                          <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-700 text-[11px]">
                            {sep.papersCount || 20} ورقة
                          </td>

                          {/* Date */}
                          <td className="py-2.5 px-3 font-mono text-slate-500 text-[11px] whitespace-nowrap">
                            {sep.date}
                          </td>

                          {/* Status Badge - Clickable to toggle checkout */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => onToggleStatus(sep)}
                              title="انقر لتبديل حالة الإعارة (متاح / مستعار)"
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                                isAvailable
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                                  : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                              }`}
                            >
                              {isAvailable ? '🟢 متاح في المجلد' : '🟡 مستعار'}
                            </button>
                            {!isAvailable && sep.borrower && (
                              <div className="text-[9px] text-amber-700 font-medium mt-0.5">
                                {sep.borrower.split(' ')[0]}
                              </div>
                            )}
                          </td>

                          {/* Actions */}
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              {/* QR Scan Modal */}
                              <button
                                type="button"
                                onClick={() => onOpenQRModal(sep)}
                                title="عرض رمز QR الفاصل"
                                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <QrCode className="w-3.5 h-3.5" />
                              </button>

                              {/* Print Spine/Tab Label */}
                              <button
                                type="button"
                                onClick={() => onOpenPrintModal(sep)}
                                title="طباعة ملصق تبويب الفاصل"
                                className="p-1 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                              >
                                <Printer className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete Separator */}
                              <button
                                type="button"
                                onClick={() => onDeleteSeparator(sep.id)}
                                title="حذف الفاصل"
                                className="p-1 rounded text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
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
              <div className="p-8 text-center bg-slate-50 rounded-lg border border-slate-200">
                <Layers className="w-6 h-6 text-slate-400 mx-auto mb-1.5" />
                <p className="text-xs font-bold text-slate-700">لا توجد فواصل كرتونية مضافة في هذا المجلد بعد</p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  أضف فواصل كرتونية لتقسيم محتويات المجلد وحفظ الأوراق بداخلها
                </p>
                <button
                  type="button"
                  onClick={() => onOpenAddSeparationModal(activeBinder)}
                  className="mt-2.5 px-3.5 py-1.5 bg-blue-700 text-white text-[11px] font-bold rounded shadow-2xs hover:bg-blue-800 transition-colors cursor-pointer"
                >
                  + إضافة أول فاصل للمجلد
                </button>
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
