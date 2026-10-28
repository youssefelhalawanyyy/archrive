import React, { useState, useMemo } from 'react';
import { 
  Layers, 
  MapPin, 
  FolderKanban, 
  Calendar, 
  QrCode, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  BookOpen, 
  Building2, 
  Printer, 
  AlertCircle,
  Pencil,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { matchesSearch } from '../utils/searchUtils';

export default function DocumentsTable({ 
  separators = [], 
  searchQuery = '', 
  onToggleStatus, 
  onOpenQRModal, 
  onOpenPrintModal,
  onOpenEditSeparationModal,
  onDeleteSeparator,
  onOpenExcelModal,
  onOpenExportExcel
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, checked_out
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter separators based on search & status with Arabic normalization
  const filteredSeparators = useMemo(() => {
    return separators.filter((sep) => {
      const q = searchQuery.trim();
      const matches = !q || (
        matchesSearch(sep.name, q) ||
        matchesSearch(sep.code, q) ||
        matchesSearch(sep.chapterName, q) ||
        matchesSearch(sep.chapterCode, q) ||
        matchesSearch(sep.binderName, q) ||
        matchesSearch(sep.binderCode, q) ||
        matchesSearch(sep.location, q) ||
        matchesSearch(sep.client, q) ||
        matchesSearch(sep.borrower, q) ||
        matchesSearch(sep.description, q) ||
        matchesSearch(sep.notes, q)
      );

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'available' && sep.status === 'available') ||
        (statusFilter === 'checked_out' && sep.status === 'checked_out');

      return matches && matchesStatus;
    });
  }, [separators, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredSeparators.length / itemsPerPage) || 1;
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredSeparators.slice(start, start + itemsPerPage);
  }, [filteredSeparators, currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden transition-all font-cairo">
      
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white">
        
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-black text-slate-900">
              سجل الفواصل والتبويبات المودعة بالمجلدات
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {filteredSeparators.length} فاصل
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة وتتبع الفواصل الكرتونية الميدانية وحالات إعارتها واستردادها
          </p>
        </div>

        {/* Status Filter Badges (Clean Segmented Control) */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold border border-slate-200/80">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-white text-slate-900 shadow-2xs font-extrabold' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({separators.length})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('available'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'available' 
                ? 'bg-white text-emerald-800 shadow-2xs font-extrabold' 
                : 'text-emerald-700 hover:bg-emerald-50/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>متاح ({separators.filter(s => s.status === 'available').length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('checked_out'); setCurrentPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'checked_out' 
                ? 'bg-white text-amber-800 shadow-2xs font-extrabold' 
                : 'text-amber-700 hover:bg-amber-50/60'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>معار ({separators.filter(s => s.status === 'checked_out').length})</span>
          </button>
        </div>

      </div>

      {/* 1. Mobile Touch Cards View (< md) */}
      <div className="block md:hidden divide-y divide-slate-100">
        {paginatedItems.length > 0 ? (
          paginatedItems.map((sep) => {
            const isAvailable = sep.status === 'available';

            return (
              <div key={sep.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between gap-3">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/90 border border-slate-200/90 text-slate-800 text-xs font-bold font-mono shadow-2xs">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                      style={{ backgroundColor: sep.color || '#38bdf8' }}
                    />
                    <span>{sep.code}</span>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(sep)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border transition-colors cursor-pointer active:scale-95 ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span>{isAvailable ? 'متاح بالخزانة' : 'معار ميدانياً'}</span>
                  </button>
                </div>

                <div className="mt-3">
                  <h4 className="text-sm font-bold text-slate-900 leading-snug">
                    {sep.name}
                  </h4>
                  {sep.client && sep.client !== 'عام' && (
                    <div className="text-xs font-semibold text-slate-600 mt-1">
                      الجهة: {sep.client}
                    </div>
                  )}
                  {sep.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {sep.description}
                    </p>
                  )}
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                    {sep.binderName || sep.binderCode}
                  </span>

                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>{sep.location || 'الخزانة الرئيسية'}</span>
                  </span>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => onOpenEditSeparationModal && onOpenEditSeparationModal(sep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>تعديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenQRModal(sep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>كود</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPrintModal(sep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>طباعة</span>
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDeleteSeparator(sep.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title="حذف الفاصل"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-10 text-center text-slate-500">
            <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">لم يتم العثور على فواصل مطابقة</p>
          </div>
        )}
      </div>

      {/* 2. Desktop High-Density Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-wider">
              <th scope="col" className="py-3 px-4">كود الفاصل</th>
              <th scope="col" className="py-3 px-4">اسم الفاصل ومحتواه</th>
              <th scope="col" className="py-3 px-4">المجلد والموضوع</th>
              <th scope="col" className="py-3 px-4">الموقع الميداني</th>
              <th scope="col" className="py-3 px-4 text-center">الحالة</th>
              <th scope="col" className="py-3 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((sep) => {
                const isAvailable = sep.status === 'available';

                return (
                  <tr 
                    key={sep.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Code */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-100/90 hover:bg-slate-200/80 border border-slate-200/90 text-slate-800 text-xs font-bold font-mono transition-colors shadow-2xs">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs" 
                          style={{ backgroundColor: sep.color || '#38bdf8' }}
                        />
                        <span>{sep.code}</span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-4 px-4">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sep.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {sep.client && sep.client !== 'عام' && (
                          <span className="text-[11px] font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                            الجهة: {sep.client}
                          </span>
                        )}
                        {sep.date && (
                          <span className="text-[11px] text-slate-400 font-mono">
                            {sep.date}
                          </span>
                        )}
                      </div>
                      {sep.description && (
                        <div className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {sep.description}
                        </div>
                      )}
                    </td>

                    {/* Binder & Chapter */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800">
                        {sep.binderName || sep.binderCode}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                        {sep.chapterName || 'عام'} ({sep.chapterCode || 'SEC'})
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200/80">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sep.location || `${sep.cabinet || 'الخزانة الرئيسية'} - ${sep.shelf || 'رف 1'}`}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(sep)}
                        title="انقر لتسجيل الإعارة أو الاسترداد"
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer shadow-2xs active:scale-95 ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200/90 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200/90 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                        <span>{isAvailable ? 'متاح بالخزانة' : 'معار ميدانياً'}</span>
                      </button>
                      
                      {!isAvailable && sep.borrower && (
                        <div className="text-[10px] text-amber-800 font-medium mt-0.5 truncate max-w-[110px] mx-auto">
                          مع: {sep.borrower.split(' ')[0]}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1 bg-slate-50/70 p-1 rounded-xl border border-slate-100 w-fit mx-auto">
                        <button
                          type="button"
                          onClick={() => onOpenEditSeparationModal && onOpenEditSeparationModal(sep)}
                          title="تعديل بيانات الفاصل"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenPrintModal(sep)}
                          title="طباعة ملصق تبويب الفاصل"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onOpenQRModal(sep)}
                          title="عرض رمز QR الفاصل"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteSeparator(sep.id)}
                          title="حذف الفاصل"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-2xs transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-slate-400 mb-1.5" />
                    <p className="text-xs font-bold text-slate-700">لم يتم العثور على فواصل مطابقة</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredSeparators.length > itemsPerPage && (
        <div className="p-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <div>
            عرض {paginatedItems.length} من أصل {filteredSeparators.length} فاصل
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            
            <span className="px-2 font-bold text-slate-800">
              صفحة {currentPage} من {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-1 rounded border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
