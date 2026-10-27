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
  Filter,
  Layers
} from 'lucide-react';

export default function ReportsView({ 
  auditLogs = [], 
  separators = [], 
  documents = [],
  onToggleStatus 
}) {
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');

  const activeItems = separators.length > 0 ? separators : documents;
  const checkedOutSeps = activeItems.filter(s => s.status === 'checked_out');

  const filteredLogs = auditLogs.filter((log) => {
    const matchesAction = filterAction === 'all' || log.action === filterAction;
    const matchesSearch = !search || (
      log.docTitle?.toLowerCase().includes(search.toLowerCase()) ||
      (log.borrower && log.borrower.toLowerCase().includes(search.toLowerCase())) ||
      (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()))
    );
    return matchesAction && matchesSearch;
  });

  const handlePrint = () => {
    window.print();
  };

  const availableCount = activeItems.length - checkedOutSeps.length;
  const availablePercentage = activeItems.length > 0 
    ? Math.round((availableCount / activeItems.length) * 100) 
    : 100;

  return (
    <div className="space-y-5 font-cairo">
      
      {/* Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white">
              <FileText className="w-5 h-5 text-blue-400 stroke-[2.2]" />
            </div>
            <h2 className="text-lg font-black text-slate-900">
              تقارير الإعارة وسجل التدقيق والرقابة (Audit Trail)
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            سجل تاريخي كامل لحركة تداول الفواصل الكرتونية الميدانية وأسماء المستعيرين ومواعيد الاسترداد
          </p>
        </div>

        <button
          type="button"
          onClick={handlePrint}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer self-start md:self-auto"
        >
          <Printer className="w-4 h-4" />
          <span>طباعة تقرير الإعارة الرسمي</span>
        </button>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-slate-500 font-bold">إجمالي حركات التدقيق المسجلة</div>
          <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{auditLogs.length} حركة</div>
          <div className="text-xs text-emerald-600 font-bold mt-1">سجل تدقيق مشفر ومحفوظ</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-amber-800 font-bold">الفواصل المستعارة ميدانياً الآن</div>
          <div className="text-2xl font-black text-amber-700 mt-1 font-mono">{checkedOutSeps.length} فاصل</div>
          <div className="text-xs text-amber-800 font-bold mt-1">قيد المراجعة والمطالعة</div>
        </div>

        <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="text-xs text-emerald-700 font-bold">نسبة الفواصل المتاحة في الأرفف</div>
          <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
            {availablePercentage}%
          </div>
          <div className="text-xs text-emerald-600 font-bold mt-1">مودعة داخل المجلدات</div>
        </div>
      </div>

      {/* Currently Checked Out Separators Section */}
      {checkedOutSeps.length > 0 && (
        <div className="bg-white rounded-xl border border-amber-200 p-5 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-amber-100">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-black text-slate-900">
                قائمة الفواصل الكرتونية المستعارة حالياً (تتطلب المتابعة)
              </h3>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
              {checkedOutSeps.length} فواصل خارج المجلدات
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {checkedOutSeps.map((sep) => (
              <div 
                key={sep.id}
                className="p-4 rounded-xl border border-amber-200 bg-amber-50/50 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-amber-200">
                      {sep.code}
                    </span>
                    <span className="text-xs font-bold text-amber-800">
                      مستعار منذ: {sep.borrowDate || sep.date}
                    </span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-1">{sep.name}</h4>
                  <div className="mt-2 text-xs text-slate-700 space-y-1">
                    <div>المستعير: <strong className="text-slate-900">{sep.borrower}</strong></div>
                    <div>الموقع الأصلي: <span className="text-slate-600 font-medium">{sep.location} ({sep.binderName})</span></div>
                  </div>
                </div>

                <div className="mt-3.5 pt-3 border-t border-amber-200/60 flex items-center justify-between">
                  <span className="text-xs text-amber-800 font-semibold">
                    الاسترداد المتوقع: {sep.dueDate || '2024/02/15'}
                  </span>
                  <button
                    type="button"
                    onClick={() => onToggleStatus(sep)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-2xs transition-colors cursor-pointer"
                  >
                    تأكيد الإرجاع للمجلد
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Audit Log History */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-black text-slate-900">سجل حركات الأرشيف الموثقة</h3>
            <p className="text-xs text-slate-500 mt-0.5">تسجيل زمني لجميع عمليات إيداع الفواصل، الإعارة الميدانية، والاسترجاع</p>
          </div>

          {/* Action Filter */}
          <div className="flex items-center gap-1 text-xs">
            {['all', 'checkout', 'checkin', 'create'].map((act) => (
              <button
                key={act}
                type="button"
                onClick={() => setFilterAction(act)}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-all cursor-pointer ${
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
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
              <tr>
                <th className="py-2.5 px-3">التاريخ والوقت</th>
                <th className="py-2.5 px-3">نوع الحركة</th>
                <th className="py-2.5 px-3">الفاصل الكرتوني</th>
                <th className="py-2.5 px-3">المستعير / المستفيد</th>
                <th className="py-2.5 px-3">المسؤول المنفذ</th>
                <th className="py-2.5 px-3">ملاحظات / الغرض</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">{log.date}</td>
                  <td className="py-2.5 px-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-bold text-[10px] border ${
                      log.action === 'checkout'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : log.action === 'checkin'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-blue-50 text-blue-800 border-blue-200'
                    }`}>
                      {log.actionName}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 font-bold text-slate-900 max-w-xs truncate">{log.docTitle}</td>
                  <td className="py-2.5 px-3 text-slate-700">{log.borrower || '—'}</td>
                  <td className="py-2.5 px-3 font-semibold text-slate-800">{log.performedBy || 'أحمد'}</td>
                  <td className="py-2.5 px-3 text-slate-600 max-w-xs truncate">{log.reason || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
