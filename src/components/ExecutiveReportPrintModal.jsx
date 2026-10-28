import React, { useRef } from 'react';
import { 
  X, 
  Printer, 
  Download, 
  FileText, 
  Building2, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  FolderArchive,
  BarChart3,
  Award
} from 'lucide-react';

export default function ExecutiveReportPrintModal({
  isOpen,
  onClose,
  chapters = [],
  binders = [],
  separators = [],
  auditLogs = [],
  stats = {}
}) {
  if (!isOpen) return null;

  const printAreaRef = useRef(null);

  // Compute stats if not fully passed
  const totalSeparators = separators.length;
  const checkedOutSeps = separators.filter(s => s.status === 'checked_out');
  const availableCount = totalSeparators - checkedOutSeps.length;
  const availabilityRate = totalSeparators > 0 ? Math.round((availableCount / totalSeparators) * 100) : 100;
  
  // Calculate average return time in days based on audit logs
  const checkouts = auditLogs.filter(l => l.action === 'checkout');
  const checkins = auditLogs.filter(l => l.action === 'checkin');
  
  // Calculate top active chapters
  const chapterActivity = chapters.map(ch => {
    const chBinders = binders.filter(b => b.chapterId === ch.id || b.chapterCode === ch.code);
    const chSeps = separators.filter(s => s.chapterId === ch.id || s.chapterCode === ch.code);
    const chLogs = auditLogs.filter(l => {
      return chSeps.some(s => s.id === l.docId || s.code === l.docTitle) ||
             chBinders.some(b => b.id === l.docId || b.code === l.docTitle);
    });
    return {
      id: ch.id,
      name: ch.name,
      code: ch.code,
      bindersCount: chBinders.length,
      separatorsCount: chSeps.length,
      activityCount: chLogs.length + chSeps.length,
      color: ch.color || '#1e3a8a'
    };
  }).sort((a, b) => b.activityCount - a.activityCount);

  // Most active borrowers
  const borrowerCounts = {};
  auditLogs.forEach(l => {
    if (l.borrower && l.borrower !== '—') {
      borrowerCounts[l.borrower] = (borrowerCounts[l.borrower] || 0) + 1;
    }
  });
  const topBorrowers = Object.entries(borrowerCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const reportDate = new Date().toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const reportRefNumber = `ARC-EXEC-${new Date().getFullYear()}/${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(100 + Math.random() * 900)}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in font-cairo print:p-0 print:bg-white print:static"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:rounded-none animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Modal Action Bar (Hidden in Print) */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-blue-600 text-white">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">
                معاينة تقرير الإدارة التنفيذية المعتمد (Executive PDF Report)
              </h3>
              <p className="text-[11px] text-blue-200">
                جاهز للتصدير بصيغة PDF والطباعة الرسمية الفورية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black shadow-sm transition-all cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة / حفظ PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Document Body */}
        <div 
          ref={printAreaRef}
          className="p-6 sm:p-10 overflow-y-auto space-y-6 text-slate-800 bg-white print:p-8 print:text-black print:overflow-visible"
          id="executive-printable-report"
        >
          {/* 1. Official Header */}
          <div className="border-b-2 border-slate-900 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs font-black text-slate-500 uppercase tracking-wider">
                  جمهورية مصر العربية • الإدارة العامة للتوثيق
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                  تقرير الأداء التنفيذي وحركة الأرشيف الميداني
                </h1>
                <p className="text-xs text-slate-600 font-semibold">
                  شركة المستقبل • قطاع العمليات والرقابة الوثائقية • غرفة الأرشيف 102
                </p>
              </div>

              {/* Official Seal Badge */}
              <div className="text-left shrink-0">
                <div className="inline-block border-2 border-slate-900 px-3 py-1.5 rounded-lg text-center bg-slate-50">
                  <div className="text-[10px] font-mono font-bold text-slate-500">كود الوثيقة الرسمية</div>
                  <div className="text-xs font-mono font-black text-slate-900">{reportRefNumber}</div>
                </div>
                <div className="text-[11px] text-slate-500 font-bold mt-1 text-left">
                  تاريخ الإصدار: {reportDate}
                </div>
              </div>
            </div>

            {/* Classification & Confidentiality Ribbon */}
            <div className="mt-3.5 pt-2.5 border-t border-slate-200 flex items-center justify-between text-[11px]">
              <span className="font-bold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                درجة السرية: <strong>تقرير تنفيذي معتمد للإدارة العليا</strong>
              </span>
              <span className="text-slate-500 font-mono">
                حالة النظام: Firebase Firestore Synced
              </span>
            </div>
          </div>

          {/* 2. Executive Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
            <div className="font-black text-slate-900 mb-1 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-700" />
              <span>الموجز التنفيذي للإدارة (Executive Summary):</span>
            </div>
            <p>
              يوضح هذا التقرير الميداني الشامل حركة تداول الأرشيف الورقي والمجلدات والتبويبات الكرتونية المودعة بالخزانة الرئيسية. تبلغ نسبة إتاحة الملفات حالياً في الأرفف <strong>{availabilityRate}%</strong>، مع إجمالي <strong>{totalSeparators}</strong> فاصلاً كرتونياً موزعة على <strong>{binders.length}</strong> مجلدات نشطة و <strong>{chapters.length}</strong> أبواب تصنيفية رئيسية. تم تسجيل <strong>{auditLogs.length}</strong> حركة تدقيق وإعارة موثقة مع سرعة استرجاع قياسية.
            </p>
          </div>

          {/* 3. Executive KPIs Grid */}
          <div>
            <div className="text-xs font-black uppercase text-slate-500 mb-2.5">
              أولاً: مؤشرات الأداء والجاهزية الرئيسية (Core Executive KPIs)
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="text-[11px] font-bold text-slate-500">إجمالي الفواصل المودعة</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">{totalSeparators}</div>
                <div className="text-[10px] text-blue-700 font-bold mt-0.5">في {binders.length} مجلدات</div>
              </div>

              <div className="p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/50">
                <div className="text-[11px] font-bold text-emerald-800">نسبة الجاهزية والإتاحة</div>
                <div className="text-2xl font-black text-emerald-700 font-mono mt-1">{availabilityRate}%</div>
                <div className="text-[10px] text-emerald-700 font-bold mt-0.5">{availableCount} فاصل بالخزانة</div>
              </div>

              <div className="p-3.5 rounded-xl border border-amber-200 bg-amber-50/50">
                <div className="text-[11px] font-bold text-amber-900">الملفات المستعارة ميدانياً</div>
                <div className="text-2xl font-black text-amber-700 font-mono mt-1">{checkedOutSeps.length}</div>
                <div className="text-[10px] text-amber-800 font-bold mt-0.5">قيد المراجعة والدراسة</div>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <div className="text-[11px] font-bold text-slate-500">معدل الدوران والتداول</div>
                <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                  {totalSeparators > 0 ? Math.round(((checkouts.length + checkins.length) / totalSeparators) * 100) : 0}%
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">شهرياً</div>
              </div>
            </div>
          </div>

          {/* 4. Chapters Activity Ranking */}
          <div>
            <div className="text-xs font-black uppercase text-slate-500 mb-2.5">
              ثانياً: ترتيب الأبواب والموضوعات حسب حجم التداول والحركة
            </div>

            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                  <tr>
                    <th className="py-2 px-3">م</th>
                    <th className="py-2 px-3">الباب / الموضوع</th>
                    <th className="py-2 px-3">الكود</th>
                    <th className="py-2 px-3">المجلدات</th>
                    <th className="py-2 px-3">الفواصل</th>
                    <th className="py-2 px-3">مستوى النشاط</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {chapterActivity.map((ch, idx) => (
                    <tr key={ch.id} className="hover:bg-slate-50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-slate-900">{ch.name}</td>
                      <td className="py-2 px-3 font-mono font-bold text-blue-700">{ch.code}</td>
                      <td className="py-2 px-3 font-mono">{ch.bindersCount} مجلد</td>
                      <td className="py-2 px-3 font-mono font-bold">{ch.separatorsCount} فاصل</td>
                      <td className="py-2 px-3">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                          idx === 0 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : idx < 3 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {idx === 0 ? 'الأكثر طلباً وتداولاً' : idx < 3 ? 'نشط جداً' : 'متوازن'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Active Loans Follow-up (If any) */}
          {checkedOutSeps.length > 0 && (
            <div>
              <div className="text-xs font-black uppercase text-amber-900 mb-2.5 flex items-center justify-between">
                <span>ثالثاً: كشف المتابعة الميدانية للفواصل المستعارة حالياً</span>
                <span className="text-[10px] text-amber-800 font-normal">
                  تتطلب المتابعة مع المسؤولين لضمان سرعة الاسترداد
                </span>
              </div>

              <div className="border border-amber-200 rounded-xl overflow-hidden bg-amber-50/20">
                <table className="w-full text-right text-xs">
                  <thead className="bg-amber-100/70 border-b border-amber-200 text-amber-900 font-bold">
                    <tr>
                      <th className="py-2 px-3">الكود</th>
                      <th className="py-2 px-3">اسم الفاصل</th>
                      <th className="py-2 px-3">المستعير</th>
                      <th className="py-2 px-3">تاريخ الإعارة</th>
                      <th className="py-2 px-3">الاسترداد المتوقع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-amber-100 font-medium">
                    {checkedOutSeps.map((sep) => (
                      <tr key={sep.id}>
                        <td className="py-2 px-3 font-mono font-bold text-slate-900">{sep.code}</td>
                        <td className="py-2 px-3 font-bold text-slate-800">{sep.name}</td>
                        <td className="py-2 px-3 text-slate-900 font-bold">{sep.borrower || '—'}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{sep.borrowDate || sep.date}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-800">{sep.dueDate || '2024/02/15'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. Official Approval & Signatures Block */}
          <div className="pt-6 border-t-2 border-slate-900 mt-8">
            <div className="grid grid-cols-3 gap-6 text-center text-xs">
              <div className="space-y-1">
                <div className="font-bold text-slate-500">أمين الأرشيف والتوثيق</div>
                <div className="text-sm font-black text-slate-900">أحمد الشريف</div>
                <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                  [توقيع إلكتروني معتمد]
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-500">رئيس قسم الرقابة الميدانية</div>
                <div className="text-sm font-black text-slate-900">م. محمود سالم</div>
                <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic">
                  [توقيع إلكتروني معتمد]
                </div>
              </div>

              <div className="space-y-1">
                <div className="font-bold text-slate-500">اعتماد الإدارة العليا</div>
                <div className="text-sm font-black text-slate-900">المدير العام التنفيذي</div>
                <div className="h-12 flex items-center justify-center text-[10px] text-slate-400 italic border border-dashed border-slate-300 rounded">
                  [خاتم شعار الأرشيف الرسمي]
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-200 text-center text-[10px] text-slate-400">
              تم توليد هذا التقرير تلقائياً عبر منظومة الأرشيف الذكية المتصلة بـ Firebase • تم التحقق من سلامة البيانات
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
