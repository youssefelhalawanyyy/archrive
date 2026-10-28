import React, { useState, useRef } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Upload, 
  FileUp, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  FolderArchive, 
  Sparkles, 
  Database,
  ArrowRight,
  FileCheck,
  RefreshCw,
  Building2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { 
  exportArchiveToExcel, 
  downloadImportTemplate, 
  parseExcelImportFile 
} from '../services/excelService';

export default function ExcelImportExportModal({
  isOpen,
  onClose,
  chapters = [],
  binders = [],
  separators = [],
  auditLogs = [],
  onBulkDeposit,
  initialTab = 'import'
}) {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Update activeTab when initialTab changes
  React.useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);
  
  // Import States
  const [selectedFile, setSelectedFile] = useState(null);
  const [isParsing, setIsParsing] = useState(false);
  const [parseError, setParseError] = useState('');
  const [parsedData, setParsedData] = useState(null);
  const [defaultBinderId, setDefaultBinderId] = useState(binders[0]?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successCount, setSuccessCount] = useState(null);

  const fileInputRef = useRef(null);

  // Handle file selection
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setIsParsing(true);
    setParseError('');
    setParsedData(null);
    setSuccessCount(null);

    try {
      const result = await parseExcelImportFile(file, binders);
      setParsedData(result);
    } catch (err) {
      setParseError(err.message || 'حدث خطأ أثناء قراءة ملف الإكسل. يرجى التأكد من صيغة الملف.');
    } finally {
      setIsParsing(false);
    }
  };

  // Confirm bulk deposit into Firebase
  const handleConfirmImport = async () => {
    if (!parsedData || parsedData.items.length === 0) return;

    setIsSubmitting(true);
    try {
      // Filter valid rows and assign fallback binder if needed
      const fallbackBinder = binders.find(b => b.id === defaultBinderId) || binders[0];
      
      const validItemsToDeposit = parsedData.items
        .filter(item => item.isValid)
        .map(item => ({
          ...item,
          matchedBinder: item.matchedBinder || fallbackBinder
        }));

      if (validItemsToDeposit.length === 0) {
        alert("لا توجد صفوف صالحة للإيداع.");
        setIsSubmitting(false);
        return;
      }

      await onBulkDeposit(validItemsToDeposit);

      setSuccessCount(validItemsToDeposit.length);
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (e) {}
    } catch (err) {
      alert("حدث خطأ أثناء حفظ الفواصل في الأرشيف: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Export Entire Archive
  const handleExportAll = () => {
    const filename = exportArchiveToExcel({
      chapters,
      binders,
      separators,
      auditLogs
    });
    try {
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 }
      });
    } catch (e) {}
  };

  // Reset import state for a new file
  const handleResetImport = () => {
    setSelectedFile(null);
    setParsedData(null);
    setParseError('');
    setSuccessCount(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 font-cairo"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col animate-in zoom-in-95 duration-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* 1. Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md">
              <FileSpreadsheet className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>إدارة البيانات المجمعة • Microsoft Excel</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                استيراد وتصدير الأرشيف والنسخ الاحتياطي
              </h3>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 2. Mode Tabs */}
        <div className="bg-slate-100 p-2 border-b border-slate-200 flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { setActiveTab('import'); handleResetImport(); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'import'
                ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Upload className="w-4 h-4 text-emerald-600" />
            <span>إيداع فواصل متعددة من Excel (استيراد مجمع)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('export')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer ${
              activeTab === 'export'
                ? 'bg-white text-blue-800 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <Download className="w-4 h-4 text-blue-600" />
            <span>تصدير الأرشيف والنسخ الاحتياطي الكامل (Excel)</span>
          </button>
        </div>

        {/* 3. Modal Body Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5">
          
          {/* ================= TAB 1: BULK IMPORT ================= */}
          {activeTab === 'import' && (
            <div className="space-y-5">
              
              {/* Success Banner */}
              {successCount !== null ? (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h4 className="text-lg font-black text-emerald-900">
                    تم إيداع {successCount} فاصل كرتوني بنجاح في الأرشيف!
                  </h4>
                  <p className="text-xs text-emerald-700 max-w-md mx-auto leading-relaxed">
                    تم إنشاء وتوليد الأكواد التسلسلية وتوزيع الفواصل داخل المجلدات وحفظها في Firebase Firestore وسجل التدقيق فوراً.
                  </p>
                  <div className="pt-2 flex items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={handleResetImport}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                    >
                      إيداع ملف إكسل آخر
                    </button>
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-xl border border-slate-200 transition-colors cursor-pointer"
                    >
                      إغلاق والعودة للأرشيف
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {/* Step 1 & 2 Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Step 1: Download Template */}
                    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                            1
                          </span>
                          <h4 className="text-sm font-black text-slate-900">
                            تحميل نموذج الإكسل الرسمي
                          </h4>
                        </div>
                        <p className="text-xs text-slate-600 leading-relaxed">
                          حمّل قالب Excel المجهز باللغة العربية وأسماء الأعمدة ودليل أكواد المجلدات النشطة لتعبئة فواصلك بسهولة.
                        </p>
                      </div>

                      <button
                        type="button"
                        id="download-excel-template-btn"
                        onClick={() => downloadImportTemplate(binders)}
                        className="mt-4 w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 border border-slate-300 text-xs font-bold transition-all shadow-2xs cursor-pointer active:scale-98"
                      >
                        <Download className="w-4 h-4 text-emerald-600" />
                        <span>تحميل نموذج إيداع الفواصل (.xlsx)</span>
                      </button>
                    </div>

                    {/* Step 2: Upload File Box */}
                    <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-6 h-6 rounded-full bg-emerald-700 text-white text-xs font-black flex items-center justify-center">
                            2
                          </span>
                          <h4 className="text-sm font-black text-emerald-950">
                            رفع ملف الإكسل المعبأ
                          </h4>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          يدعم رفع 50 إلى 100+ فاصل كرتوني دفعة واحدة بصيغة <span className="font-mono font-bold">.xlsx</span> أو <span className="font-mono font-bold">.csv</span>.
                        </p>
                      </div>

                      <div className="mt-4">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="excel-file-upload-input"
                          accept=".xlsx, .xls, .csv"
                          onChange={handleFileChange}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isParsing}
                          className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-98 text-white text-xs font-black transition-all shadow-xs cursor-pointer disabled:opacity-50"
                        >
                          <FileUp className="w-4 h-4" />
                          <span>{selectedFile ? `الملف: ${selectedFile.name}` : 'اختر ملف Excel من جهازك'}</span>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Fallback Binder Setting */}
                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="text-xs">
                      <span className="font-bold text-slate-800">المجلد الافتراضي للإيداع (Fallback): </span>
                      <span className="text-slate-500">في حال ترك كود المجلد فارغاً في الإكسل، سيتم إيداع الفاصل هنا:</span>
                    </div>

                    <select
                      value={defaultBinderId}
                      onChange={(e) => setDefaultBinderId(e.target.value)}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-bold text-slate-800 bg-slate-50 focus:bg-white outline-hidden"
                    >
                      {binders.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code} • {b.cabinet} - {b.shelf})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Parsing State */}
                  {isParsing && (
                    <div className="p-6 text-center text-slate-600 space-y-2">
                      <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-600" />
                      <p className="text-xs font-bold">جاري قراءة وتحليل بيانات ملف الإكسل...</p>
                    </div>
                  )}

                  {/* Error Alert */}
                  {parseError && (
                    <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs text-red-700">
                      <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                      <span>{parseError}</span>
                    </div>
                  )}

                  {/* Preview Table of Parsed Rows */}
                  {parsedData && (
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-black text-slate-900">
                            معاينة الفواصل المقروءة من الملف
                          </h4>
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            {parsedData.validCount} فاصل جاهز
                          </span>
                          {parsedData.invalidCount > 0 && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                              {parsedData.invalidCount} صف غير مكتمل
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={handleResetImport}
                          className="text-xs text-slate-500 hover:text-slate-800 font-bold"
                        >
                          تغيير الملف
                        </button>
                      </div>

                      {/* Responsive Table */}
                      <div className="border border-slate-200 rounded-xl overflow-x-auto max-h-64 shadow-2xs">
                        <table className="w-full text-right text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">السطر</th>
                              <th className="py-2.5 px-3">اسم الفاصل ومحتواه</th>
                              <th className="py-2.5 px-3">المجلد المحدد</th>
                              <th className="py-2.5 px-3">الجهة / العميل</th>
                              <th className="py-2.5 px-3">التاريخ</th>
                              <th className="py-2.5 px-3 text-center">حالة الفحص</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {parsedData.items.map((item, idx) => (
                              <tr key={idx} className={item.isValid ? "hover:bg-slate-50" : "bg-red-50/50"}>
                                <td className="py-2 px-3 font-mono text-slate-500">{item.rowNumber}</td>
                                <td className="py-2 px-3 font-bold text-slate-900 flex items-center gap-1.5">
                                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                  <span className="truncate max-w-[200px]">{item.name}</span>
                                </td>
                                <td className="py-2 px-3">
                                  {item.matchedBinder ? (
                                    <span className="font-bold text-slate-800">
                                      {item.matchedBinder.name} ({item.matchedBinder.code})
                                    </span>
                                  ) : (
                                    <span className="text-amber-700 font-bold">
                                      افتراضي: {binders[0]?.code}
                                    </span>
                                  )}
                                </td>
                                <td className="py-2 px-3 text-slate-600 truncate max-w-[120px]">{item.client}</td>
                                <td className="py-2 px-3 font-mono text-slate-500">{item.date}</td>
                                <td className="py-2 px-3 text-center">
                                  {item.isValid ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                      جاهز للإيداع
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-red-100 text-red-800">
                                      {item.error}
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Final Submit Action */}
                      <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-xs text-slate-600">
                          سيتم توليد أكواد تلقائية تسلسلية لكل مجلد وحفظها في قاعدة بيانات Firebase.
                        </div>

                        <button
                          type="button"
                          id="confirm-excel-bulk-deposit-btn"
                          onClick={handleConfirmImport}
                          disabled={isSubmitting || parsedData.validCount === 0}
                          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 active:scale-95 text-white text-xs font-black shadow-md transition-all cursor-pointer disabled:opacity-50"
                        >
                          <FileCheck className="w-4 h-4" />
                          <span>{isSubmitting ? 'جاري الحفظ في Firebase...' : `تأكيد إيداع ${parsedData.validCount} فاصل في الأرشيف الآن`}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

            </div>
          )}

          {/* ================= TAB 2: EXPORT ALL ================= */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              
              <div className="bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl p-5 text-white flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-md">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-bold bg-blue-500/30 text-blue-200 px-2 py-0.5 rounded-md border border-blue-400/30">
                      تصدير رسمي شامل
                    </span>
                  </div>
                  <h4 className="text-base font-black text-white">
                    تصدير سجل الأرشيف الورقي بالكامل إلى Excel
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-lg">
                    ملف إكسل متكامل يحتوي على 4 صفحات منفصلة (الموضوعات، المجلدات النشطة، الفواصل الكرتونية، وسجل التدقيق والإعارة).
                  </p>
                </div>

                <button
                  type="button"
                  id="export-archive-excel-confirm-btn"
                  onClick={handleExportAll}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-black shadow-lg shadow-emerald-950/40 transition-all cursor-pointer shrink-0"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير ملف Excel الشامل (.xlsx)</span>
                </button>
              </div>

              {/* Live Archive Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-bold">الموضوعات والأبواب</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-1">{chapters.length}</div>
                  <div className="text-[10px] text-blue-700 font-bold mt-0.5">صفحة مخصصة</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-bold">المجلدات الفيزيائية</div>
                  <div className="text-xl font-black text-slate-900 font-mono mt-1">{binders.length}</div>
                  <div className="text-[10px] text-slate-600 font-bold mt-0.5">بالأرفف وسعاتها</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-bold">الفواصل الكرتونية</div>
                  <div className="text-xl font-black text-emerald-700 font-mono mt-1">{separators.length}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">بكافة التفاصيل</div>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                  <div className="text-xs text-slate-500 font-bold">حركات التدقيق الموثقة</div>
                  <div className="text-xl font-black text-amber-700 font-mono mt-1">{auditLogs.length}</div>
                  <div className="text-[10px] text-amber-800 font-bold mt-0.5">تاريخ الإعارات</div>
                </div>
              </div>

              {/* Export Features Checklist */}
              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2 text-xs text-slate-700">
                <h5 className="font-black text-slate-900 text-xs mb-2">مميزات ملف التصدير:</h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تنسيق من اليمين إلى اليسار (RTL) متوافق تماماً مع Microsoft Excel العربي.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>يتضمن أكواد الـ QR والباركود الرقمي لكل فاصل ومجلد.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>حالات الإعارة وأسماء المستعيرين وتواريخ الاسترداد المتوقعة.</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>صالح للاستخدام كنسخة احتياطية آمنة (Offline Backup) للأرشيف.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* 4. Modal Footer */}
        <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>شركة المستقبل • نظام أرشفة الملفات الذكي</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold hover:bg-slate-200 transition-colors cursor-pointer"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
}
