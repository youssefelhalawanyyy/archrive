import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  MapPin, 
  FolderKanban, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Eye, 
  QrCode, 
  Trash2, 
  ChevronRight, 
  ChevronLeft, 
  Filter, 
  BookOpen,
  Layers,
  Building2,
  AlertCircle
} from 'lucide-react';

export default function DocumentsTable({ 
  documents = [], 
  searchQuery = '', 
  selectedDocId = null, 
  onSelectDoc, 
  onToggleStatus, 
  onOpenQRModal, 
  onDeleteDoc 
}) {
  const [statusFilter, setStatusFilter] = useState('all'); // all, available, checked_out
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter documents based on searchQuery & status
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch = !q || (
        (doc.title && doc.title.toLowerCase().includes(q)) ||
        (doc.docNumber && doc.docNumber.toLowerCase().includes(q)) ||
        (doc.chapterName && doc.chapterName.toLowerCase().includes(q)) ||
        (doc.chapterCode && doc.chapterCode.toLowerCase().includes(q)) ||
        (doc.binderName && doc.binderName.toLowerCase().includes(q)) ||
        (doc.binderCode && doc.binderCode.toLowerCase().includes(q)) ||
        (doc.separationName && doc.separationName.toLowerCase().includes(q)) ||
        (doc.location && doc.location.toLowerCase().includes(q)) ||
        (doc.client && doc.client.toLowerCase().includes(q)) ||
        (doc.borrower && doc.borrower.toLowerCase().includes(q))
      );

      const matchesStatus = 
        statusFilter === 'all' || 
        (statusFilter === 'available' && doc.status === 'available') ||
        (statusFilter === 'checked_out' && doc.status === 'checked_out');

      return matchesSearch && matchesStatus;
    });
  }, [documents, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage) || 1;
  const paginatedDocs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage]);

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
              سجل الوثائق الورقية
            </h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
              {filteredDocuments.length} وثيقة
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            إدارة ومتابعة الوثائق المادية مع تصنيف الموضوع والمجلد والفاصل
          </p>
        </div>

        {/* Status Filter Badges */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto border border-slate-200">
          <button
            type="button"
            onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}
            className={`px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'all' 
                ? 'bg-white text-slate-900 shadow-2xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            الكل ({documents.length})
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('available'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'available' 
                ? 'bg-emerald-600 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-emerald-700'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>متاح ({documents.filter(d => d.status === 'available').length})</span>
          </button>
          <button
            type="button"
            onClick={() => { setStatusFilter('checked_out'); setCurrentPage(1); }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'checked_out' 
                ? 'bg-amber-600 text-white shadow-2xs' 
                : 'text-slate-600 hover:text-amber-800'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-300"></span>
            <span>مستعار ({documents.filter(d => d.status === 'checked_out').length})</span>
          </button>
        </div>

      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold text-xs uppercase tracking-wider">
              <th scope="col" className="py-3.5 px-4 sm:px-6">اسم الوثيقة والكود</th>
              <th scope="col" className="py-3.5 px-4">الموضوع (Chapter)</th>
              <th scope="col" className="py-3.5 px-4">المجلد والفاصل</th>
              <th scope="col" className="py-3.5 px-4">الموقع الميداني</th>
              <th scope="col" className="py-3.5 px-4">التاريخ</th>
              <th scope="col" className="py-3.5 px-4 text-center">الحالة</th>
              <th scope="col" className="py-3.5 px-4 text-center">إجراءات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {paginatedDocs.length > 0 ? (
              paginatedDocs.map((doc) => {
                const isSelected = selectedDocId === doc.id;
                const isAvailable = doc.status === 'available';

                return (
                  <tr 
                    key={doc.id}
                    onClick={() => onSelectDoc(doc)}
                    className={`transition-colors cursor-pointer group ${
                      isSelected 
                        ? 'bg-brand-50/70 hover:bg-brand-50' 
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* اسم الوثيقة (Document Name) */}
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl transition-colors shrink-0 ${
                          isSelected 
                            ? 'bg-brand-600 text-white shadow-xs' 
                            : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600'
                        }`}>
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-black text-slate-900 group-hover:text-brand-700 transition-colors truncate max-w-xs">
                            {doc.title}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                            <span className="font-mono text-[10px] bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200 font-bold text-slate-700">
                              {doc.docNumber || 'DOC-ARCH'}
                            </span>
                            {doc.client && (
                              <span className="truncate max-w-[120px] flex items-center gap-1">
                                <Building2 className="w-3 h-3 inline text-slate-400" />
                                {doc.client}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* الموضوع (Chapter) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200/80">
                        <BookOpen className="w-3 h-3 text-brand-600" />
                        <span>{doc.chapterName || 'شؤون عامة'}</span>
                      </div>
                    </td>

                    {/* المجلد والفاصل (Binder & Separation) */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                        <span className="font-mono text-[11px] font-black bg-slate-900 text-white px-1.5 py-0.2 rounded">
                          {doc.binderCode || 'B01'}
                        </span>
                        <span className="truncate max-w-[150px]">{doc.binderName}</span>
                      </div>
                      <div className="text-[11px] text-brand-700 font-semibold mt-0.5 flex items-center gap-1">
                        <Layers className="w-3 h-3" />
                        <span className="truncate max-w-[150px]">{doc.separationName || doc.folderTab || 'فاصل عام'}</span>
                      </div>
                    </td>

                    {/* الموقع (Location) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200/70">
                        <MapPin className="w-3.5 h-3.5 text-brand-600" />
                        <span>{doc.location || `${doc.cabinet || 'خزانة أ'} - ${doc.shelf || 'رف 3'}`}</span>
                      </div>
                    </td>

                    {/* التاريخ (Date) */}
                    <td className="py-4 px-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>{doc.date}</span>
                      </div>
                    </td>

                    {/* الحالة (Status Badge - Clickable toggle) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleStatus(doc);
                        }}
                        title="انقر لتغيير الحالة فورياً (متاح / مستعار)"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black transition-all transform active:scale-95 shadow-xs cursor-pointer ${
                          isAvailable
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full ${isAvailable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`}></span>
                        <span>{isAvailable ? '🟢 متاح' : '🟡 مستعار'}</span>
                      </button>
                      
                      {!isAvailable && doc.borrower && (
                        <div className="text-[10px] text-amber-700 font-medium mt-1 truncate max-w-[120px] mx-auto">
                          مع: {doc.borrower.split(' ')[0]}
                        </div>
                      )}
                    </td>

                    {/* إجراءات (Actions) */}
                    <td className="py-4 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          type="button"
                          onClick={() => onSelectDoc(doc)}
                          title="تحديد الوثيقة"
                          className={`p-1.5 rounded-lg transition-colors ${
                            isSelected 
                              ? 'bg-brand-600 text-white' 
                              : 'text-slate-400 hover:text-brand-600 hover:bg-slate-100'
                          }`}
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectDoc(doc);
                            onOpenQRModal(doc);
                          }}
                          title="عرض رمز QR ومسحه بالجوال"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-slate-100 transition-colors"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteDoc(doc.id)}
                          title="حذف الوثيقة من الأرشيف"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
                <td colSpan="7" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center">
                    <AlertCircle className="w-10 h-10 text-slate-400 mb-2" />
                    <p className="text-base font-bold text-slate-700">لم يتم العثور على وثائق مطابقة</p>
                    <p className="text-xs text-slate-500 mt-1">
                      جرب تغيير مصطلح البحث أو اختيار فلتر مختلف
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {filteredDocuments.length > itemsPerPage && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div>
            عرض {paginatedDocs.length} من أصل {filteredDocuments.length} وثيقة
          </div>
          
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <span className="px-2 font-bold text-slate-800">
              صفحة {currentPage} من {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
