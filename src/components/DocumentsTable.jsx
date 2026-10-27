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
  AlertCircle
} from 'lucide-react';

export default function DocumentsTable({ 
  separators = [], 
  searchQuery = '', 
  onToggleStatus, 
  onOpenQRModal, 
  onOpenPrintModal,
  onDeleteSeparator 
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, checked_out
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Filter separators based on search & status
  const filteredSeparators = useMemo(() => {
    return separators.filter((sep) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        (sep.name && sep.name.toLowerCase().includes(q)) ||
        (sep.code && sep.code.toLowerCase().includes(q)) ||
        (sep.chapterName && sep.chapterName.toLowerCase().includes(q)) ||
        (sep.chapterCode && sep.chapterCode.toLowerCase().includes(q)) ||
        (sep.binderName && sep.binderName.toLowerCase().includes(q)) ||
        (sep.binderCode && sep.binderCode.toLowerCase().includes(q)) ||
        (sep.location && sep.location.toLowerCase().includes(q)) ||
        (sep.client && sep.client.toLowerCase().includes(q)) ||
        (sep.borrower && sep.borrower.toLowerCase().includes(q)) ||
        (sep.description && sep.description.toLowerCase().includes(q))
      );

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'available' && sep.status === 'available') ||
        (statusFilter === 'checked_out' && sep.status === 'checked_out');

      return matchesSearch && matchesStatus;
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

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-white text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({separators.length})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('available'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'available' 
                ? 'bg-emerald-700 text-white shadow-2xs' 
                : 'text-emerald-800 hover:bg-emerald-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>متاح ({separators.filter(s => s.status === 'available').length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('checked_out'); setCurrentPage(1); }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              statusFilter === 'checked_out' 
                ? 'bg-amber-700 text-white shadow-2xs' 
                : 'text-amber-800 hover:bg-amber-50'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            <span>مستعار ({separators.filter(s => s.status === 'checked_out').length})</span>
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
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full shrink-0" 
                      style={{ backgroundColor: sep.color || '#38bdf8' }}
                    />
                    <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                      {sep.code}
                    </span>
                  </div>

                  {/* Status Toggle Button */}
                  <button
                    type="button"
                    onClick={() => onToggleStatus(sep)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border transition-colors cursor-pointer active:scale-95 ${
                      isAvailable
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                    <span>{isAvailable ? '🟢 متاح' : '🟡 مستعار'}</span>
                  </button>
                </div>

                <div className="mt-2.5">
                  <h4 className="text-sm font-bold text-slate-900">
                    {sep.name}
                  </h4>
                  {sep.description && (
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                      {sep.description}
                    </p>
                  )}
                </div>

                <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {sep.binderName || sep.binderCode}
                  </span>

                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-bold border border-blue-200">
                    <MapPin className="w-3 h-3 text-blue-600" />
                    <span>{sep.location || 'الخزانة الرئيسية'}</span>
                  </span>

                  <span className="text-slate-500 font-mono">
                    <strong>{sep.papersCount || 20}</strong> ورقة
                  </span>
                </div>

                {/* Mobile Quick Action Buttons */}
                <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onOpenQRModal(sep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5 text-blue-600" />
                      <span>كود QR</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onOpenPrintModal(sep)}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
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
              <th scope="col" className="py-3 px-4">عدد الأوراق</th>
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
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0" 
                          style={{ backgroundColor: sep.color || '#38bdf8' }}
                        />
                        <span className="font-mono font-bold text-xs bg-slate-900 text-white px-2 py-0.5 rounded shadow-2xs">
                          {sep.code}
                        </span>
                      </div>
                    </td>

                    {/* Title */}
                    <td className="py-3.5 px-4">
                      <div className="text-sm font-bold text-slate-900 group-hover:text-blue-700 transition-colors">
                        {sep.name}
                      </div>
                      {sep.description && (
                        <div className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {sep.description}
                        </div>
                      )}
                    </td>

                    {/* Binder & Chapter */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-xs font-bold text-slate-800">
                        {sep.binderName || sep.binderCode}
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        {sep.chapterName || 'عام'} ({sep.chapterCode || 'SEC'})
                      </div>
                    </td>

                    {/* Location */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200">
                        <MapPin className="w-3.5 h-3.5 text-blue-600" />
                        <span>{sep.location || `${sep.cabinet || 'الخزانة الرئيسية'} - ${sep.shelf || 'رف 1'}`}</span>
                      </div>
                    </td>

                    {/* Papers Count */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs text-slate-700">
                      <strong>{sep.papersCount || 20}</strong> ورقة
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => onToggleStatus(sep)}
                        title="انقر لتسجيل الإعارة أو الاسترداد"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold border transition-colors cursor-pointer ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                        <span>{isAvailable ? '🟢 متاح' : '🟡 مستعار'}</span>
                      </button>
                      
                      {!isAvailable && sep.borrower && (
                        <div className="text-[10px] text-amber-800 font-medium mt-0.5 truncate max-w-[110px] mx-auto">
                          مع: {sep.borrower.split(' ')[0]}
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => onOpenQRModal(sep)}
                          title="عرض رمز QR الفاصل"
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
