import React, { useState } from 'react';
import { 
  FileText, 
  Printer, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  UserCheck, 
  Building2, 
  Calendar, 
  Download, 
  ShieldCheck,
  Search,
  Filter
} from 'lucide-react';

export default function ReportsView({ 
  auditLogs = [], 
  documents = [], 
  onToggleStatus 
}) {
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const checkedOutDocs = documents.filter(d => d.status === 'checked_out');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = !search || (
      log.docTitle.toLowerCase().includes(search.toLowerCase()) ||
      (log.borrower && log.borrower.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesAction && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 lg:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
              <FileText className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h2 className="text-xl font-black text-slate-900 font-cairo">
              تقارير الإعارة وسجل التدقيق والرقابة (Audit Trail)
            </h2>
          </div>
          <p className="text-xs text-slate-600 mt-1">
            سجل تاريخي كامل لحركة تداول الوثائق الورقية وأسماء المستعيرين ومواعيد الاسترداد
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all cursor-pointer self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة تقرير الإعارة الرسمي</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="text-xs text-slate-600 font-semibold">إجمالي حركات الإعارة المسجلة</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{auditLogs.length} حركة</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">سجل موثق بالكامل</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="text-xs text-amber-800 font-semibold">الوثائق المستعارة ميدانياً الآن</div>
          <div className="text-2xl font-black text-amber-700 mt-1">{checkedOutDocs.length} وثيقة</div>
          <div className="text-[11px] text-amber-800 font-medium mt-1">قيد الاستخدام لدى الموظفين</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-card">
          <div className="text-xs text-emerald-700 font-semibold">نسبة الوثائق المتاحة في الأرفف</div>
          <div className="text-2xl font-black text-emerald-700 mt-1">
            {documents.length > 0 ? Math.round(((documents.length - checkedOutDocs.length) / documents.length) * 100) : 100}%
          </div>
          <div className="text-[11px] text-slate-600 font-medium mt-1">جاهزة للمطالعة في الخزائن</div>
        </div>
      </div>

      {/* Currently Checked Out Documents Section */}
      {checkedOutDocs.length > 0 && (
        <div className="bg-white rounded-2xl border border-amber-200/80 shadow-card p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">
                قائمة الوثائق المستعارة حالياً (تتطلب المتابعة)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              {checkedOutDocs.length} وثائق خارج الخزانة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {checkedOutDocs.map((doc) => (
              <div 
                key={doc.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-mono text-[10px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-amber-200">
                      {doc.docNumber}
                    </span>
                    <span className="text-[11px] font-bold text-amber-800">
                      مستعار منذ: {doc.borrowDate || doc.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{doc.title}</h4>
                  <div className="mt-2 text-xs text-slate-700">
                    <div>المستعير: <strong>{doc.borrower}</strong></div>
                    <div>الموقع الأصلي: <span className="text-slate-600">{doc.location}</span></div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-amber-800 font-medium">
                    تاريخ الاسترداد المتوقع: {doc.dueDate || '2024/02/01'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(doc)}
                    className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    تأكيد الإرجاع
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Audit Log History */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-black text-slate-900">سجل حركات الأرشيف الموثقة</h3>
            <p className="text-xs text-slate-600 mt-0.5">تسجيل زمني لجميع عمليات الإيداع، الإعارة، والاسترجاع</p>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            {['all', 'checkout', 'checkin', 'create'].map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setFilterAction(act)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  filterAction === act
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {act === 'all' ? 'الكل' : act === 'checkout' ? 'إعارة' : act === 'checkin' ? 'إرجاع' : 'إيداع جديد'}
              </button>
            ))}
          </div>
        </div>

        {/* Logs Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 font-bold uppercase">
                <th className="py-2.5 px-3">التاريخ والوقت</th>
                <th className="py-2.5 px-3">نوع الحركة</th>
                <th className="py-2.5 px-3">الوثيقة</th>
                <th className="py-2.5 px-3">المستعير / المستفيد</th>
                <th className="py-2.5 px-3">المسؤول المنفذ</th>
                <th className="py-2.5 px-3">ملاحظات / الغرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">{log.date}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      log.action === 'checkout'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : log.action === 'checkin'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border border-blue-200'
                    }`}>
                      {log.actionName}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-900 max-w-xs truncate">{log.docTitle}</td>
                  <td className="py-3 px-3 text-slate-700">{log.borrower || '—'}</td>
                  <td className="py-3 px-3 font-semibold text-slate-800">{log.performedBy || 'أحمد'}</td>
                  <td className="py-3 px-3 text-slate-600 max-w-xs truncate">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
