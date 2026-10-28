import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  FolderArchive, 
  Layers, 
  Search, 
  MapPin, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  X, 
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { searchArchiveGlobal } from '../utils/searchUtils';

export default function OmniSearchDropdown({ 
  searchQuery, 
  setSearchQuery, 
  chapters = [], 
  binders = [], 
  separators = [], 
  onSelectItem, 
  onInspectItem,
  onClose 
}) {
  const [activeCategory, setActiveCategory] = useState('all'); // 'all' | 'chapters' | 'binders' | 'separators'

  const searchResults = useMemo(() => {
    return searchArchiveGlobal(chapters, binders, separators, searchQuery);
  }, [chapters, binders, separators, searchQuery]);

  if (!searchQuery.trim()) return null;

  const { totalCount, chapters: matchedChapters, binders: matchedBinders, separators: matchedSeparators } = searchResults;

  const hasAny = totalCount > 0;

  return (
    <div 
      className="absolute top-full right-0 left-0 sm:left-auto sm:w-[650px] mt-2 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 font-cairo select-none"
      dir="rtl"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header bar with summary & clear */}
      <div className="p-3 sm:px-4 bg-slate-900 text-white flex items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Search className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold">
            نتائج البحث الذكي عن: <span className="text-blue-300 font-mono">"{searchQuery}"</span>
          </span>
          <span className="text-[11px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-mono border border-slate-700">
            {totalCount} نتيجة
          </span>
        </div>

        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            if (onClose) onClose();
          }}
          className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-slate-800 transition-colors cursor-pointer"
          title="إغلاق البحث"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs */}
      {hasAny && (
        <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center gap-1.5 overflow-x-auto text-xs font-bold text-slate-600">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              activeCategory === 'all' 
                ? 'bg-blue-600 text-white shadow-2xs' 
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <span>الكل</span>
            <span className="text-[10px] opacity-80 font-mono">({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('chapters')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              activeCategory === 'chapters' 
                ? 'bg-indigo-600 text-white shadow-2xs' 
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>الموضوعات</span>
            <span className="text-[10px] opacity-80 font-mono">({matchedChapters.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('binders')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              activeCategory === 'binders' 
                ? 'bg-blue-600 text-white shadow-2xs' 
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <FolderArchive className="w-3.5 h-3.5" />
            <span>المجلدات</span>
            <span className="text-[10px] opacity-80 font-mono">({matchedBinders.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveCategory('separators')}
            className={`px-3 py-1 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shrink-0 ${
              activeCategory === 'separators' 
                ? 'bg-emerald-600 text-white shadow-2xs' 
                : 'hover:bg-slate-200 text-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>الفواصل</span>
            <span className="text-[10px] opacity-80 font-mono">({matchedSeparators.length})</span>
          </button>
        </div>
      )}

      {/* Results List */}
      <div className="max-h-[60vh] sm:max-h-[460px] overflow-y-auto divide-y divide-slate-100 p-2 space-y-2">
        
        {/* No Results Fallback */}
        {!hasAny && (
          <div className="p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">
              لا توجد عناصر تطابق: "{searchQuery}"
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              تأكد من كتابة الكلمات بشكل صحيح. يمكنك البحث بكود الفاصل، اسم الموضوع، اسم المجلد، أو الجهة المستعارة.
            </p>
          </div>
        )}

        {/* 1. Chapters Section */}
        {hasAny && (activeCategory === 'all' || activeCategory === 'chapters') && matchedChapters.length > 0 && (
          <div className="space-y-1.5">
            <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-black text-indigo-900">
              <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
              <span>الموضوعات والأبواب الرئيسية ({matchedChapters.length}):</span>
            </div>

            {matchedChapters.map((ch) => (
              <div 
                key={ch.id}
                className="p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200/80 hover:border-indigo-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {ch.name}
                      </span>
                      <span className="text-[10px] bg-indigo-100 text-indigo-800 font-mono px-1.5 py-0.5 rounded font-bold">
                        {ch.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {ch.description || 'موضوع رئيسي لحفظ الوثائق والمجلدات'}
                    </p>
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-600 font-medium">
                      <span>{ch.bindersCount} مجلدات فيزيائية</span>
                      <span>•</span>
                      <span>{ch.separatorsCount} فاصل كرتوني</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onInspectItem) onInspectItem(ch);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="عرض بطاقة التفاصيل الكاملة للموضوع"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px]">تفاصيل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectItem) onSelectItem(ch);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>فتح الموضوع</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 2. Binders Section */}
        {hasAny && (activeCategory === 'all' || activeCategory === 'binders') && matchedBinders.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-black text-blue-900">
              <FolderArchive className="w-3.5 h-3.5 text-blue-600" />
              <span>المجلدات الفيزيائية ({matchedBinders.length}):</span>
            </div>

            {matchedBinders.map((b) => (
              <div 
                key={b.id}
                className="p-3 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 hover:border-blue-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    <FolderArchive className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {b.name}
                      </span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 font-mono px-1.5 py-0.5 rounded font-bold">
                        {b.code}
                      </span>
                      <span className="text-[10px] bg-indigo-50 text-indigo-700 border border-indigo-200 px-1.5 py-0.5 rounded">
                        {b.chapterName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-600">
                      <span className="flex items-center gap-1 font-mono text-slate-500">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {b.location || 'الدولاب الرئيسي'}
                      </span>
                      <span>•</span>
                      <span className="font-semibold text-slate-700">{b.separatorsCount} فاصل كرتوني</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onInspectItem) onInspectItem(b);
                    }}
                    className="p-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-1 cursor-pointer"
                    title="عرض بطاقة التفاصيل الكاملة للمجلد"
                  >
                    <Info className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-[11px]">تفاصيل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectItem) onSelectItem(b);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>فتح المجلد</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 3. Separators Section */}
        {hasAny && (activeCategory === 'all' || activeCategory === 'separators') && matchedSeparators.length > 0 && (
          <div className="space-y-1.5 pt-1">
            <div className="px-2 py-1 flex items-center gap-1.5 text-xs font-black text-emerald-900">
              <Layers className="w-3.5 h-3.5 text-emerald-600" />
              <span>الفواصل الكرتونية المودعة ({matchedSeparators.length}):</span>
            </div>

            {matchedSeparators.map((sep) => (
              <div 
                key={sep.id}
                className="p-3 rounded-xl bg-white hover:bg-emerald-50/50 border border-slate-200 hover:border-emerald-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 mt-0.5 ${
                    sep.status === 'available' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                  }`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-mono font-black bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                        {sep.code}
                      </span>
                      <span className="text-xs font-bold text-slate-900">
                        {sep.name}
                      </span>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 ${
                        sep.status === 'available' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {sep.status === 'available' ? 'متاح بالخزانة' : `مستعار مع: ${sep.borrower || 'موظف'}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 flex-wrap">
                      <span className="text-blue-700 font-semibold">{sep.binderName}</span>
                      <span>•</span>
                      <span className="text-indigo-700">{sep.chapterName}</span>
                      {sep.client && (
                        <>
                          <span>•</span>
                          <span className="text-slate-700 font-medium">{sep.client}</span>
                        </>
                      )}
                      <span>•</span>
                      <span className="font-mono text-slate-400">{sep.physicalLocation}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      if (onInspectItem) onInspectItem(sep);
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 cursor-pointer border border-slate-200"
                    title="عرض الملف الكامل للفاصل (كل المعلومات)"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px]">الملف الكامل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectItem) onSelectItem(sep);
                    }}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-2xs"
                  >
                    <span>عرض</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>

      {/* Footer bar with quick hint */}
      <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 text-[11px] text-slate-500 flex items-center justify-between">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          البحث يدعم الحروف غير الكاملة وتطبيع الهمزات والتاء المربوطة
        </span>
        <span className="font-mono text-slate-400">انقر "الملف الكامل" لعرض كل البيانات</span>
      </div>
    </div>
  );
}
