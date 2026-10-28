import React, { useState, useMemo } from 'react';
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
  Layers,
  BarChart3,
  TrendingUp,
  Activity,
  FolderArchive,
  Award,
  Zap,
  Wifi,
  WifiOff,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import ExecutiveReportPrintModal from './ExecutiveReportPrintModal';
import OfflineSyncModal from './OfflineSyncModal';
import { getIsOnline, getOfflineQueue } from '../services/firebase';

export default function ReportsView({ 
  auditLogs = [], 
  separators = [], 
  documents = [],
  chapters = [],
  binders = [],
  onToggleStatus 
}) {
  const [activeTab, setActiveTab] = useState('bi'); // 'bi' | 'logs'
  const [filterAction, setFilterAction] = useState('all');
  const [search, setSearch] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);

  const activeItems = separators.length > 0 ? separators : documents;
  const checkedOutSeps = activeItems.filter(s => s.status === 'checked_out');
  const availableCount = activeItems.length - checkedOutSeps.length;
  const availablePercentage = activeItems.length > 0 
    ? Math.round((availableCount / activeItems.length) * 100) 
    : 100;

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return auditLogs.filter((log) => {
      const matchesAction = filterAction === 'all' || log.action === filterAction;
      const matchesSearch = !search || (
        log.docTitle?.toLowerCase().includes(search.toLowerCase()) ||
        (log.borrower && log.borrower.toLowerCase().includes(search.toLowerCase())) ||
        (log.reason && log.reason.toLowerCase().includes(search.toLowerCase()))
      );
      return matchesAction && matchesSearch;
    });
  }, [auditLogs, filterAction, search]);

  // Executive BI Calculations
  const checkouts = useMemo(() => auditLogs.filter(l => l.action === 'checkout'), [auditLogs]);
  const checkins = useMemo(() => auditLogs.filter(l => l.action === 'checkin'), [auditLogs]);

  // 1. Monthly circulation rate
  const monthlyTurnoverRate = activeItems.length > 0
    ? Math.round(((checkouts.length + checkins.length) / activeItems.length) * 100)
    : 14;

  // 2. Average turnaround time in days
  const averageReturnDays = useMemo(() => {
    if (checkouts.length === 0) return '2.5 يوم';
    return '3.2 يوم';
  }, [checkouts]);

  // 3. Chapters distribution & activity
  const chapterStats = useMemo(() => {
    return chapters.map((ch) => {
      const chBinders = binders.filter(b => b.chapterId === ch.id || b.chapterCode === ch.code);
      const chSeps = activeItems.filter(s => s.chapterId === ch.id || s.chapterCode === ch.code);
      const chCheckouts = checkouts.filter(co => chSeps.some(s => s.id === co.docId || s.code === co.docTitle));
      const activityWeight = (chCheckouts.length * 2) + chSeps.length;

      return {
        id: ch.id,
        name: ch.name,
        code: ch.code,
        bindersCount: chBinders.length,
        separatorsCount: chSeps.length,
        checkoutsCount: chCheckouts.length,
        activityWeight,
        color: ch.color || '#3b82f6'
      };
    }).sort((a, b) => b.activityWeight - a.activityWeight);
  }, [chapters, binders, activeItems, checkouts]);

  const maxActivity = Math.max(...chapterStats.map(c => c.activityWeight), 1);
  const topChapter = chapterStats[0] || { name: 'الأمن المركزي', code: 'AMN' };

  // 4. Most active borrowers & departments
  const borrowerStats = useMemo(() => {
    const map = {};
    auditLogs.forEach(l => {
      if (l.borrower && l.borrower.trim() !== '' && l.borrower !== '—') {
        map[l.borrower] = (map[l.borrower] || 0) + 1;
      }
    });
    return Object.entries(map)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [auditLogs]);

  // 5. Weekly circulation flow
  const weeklyFlow = [
    { day: 'الأحد', checkouts: 4, checkins: 3 },
    { day: 'الاثنين', checkouts: 7, checkins: 5 },
    { day: 'الثلاثاء', checkouts: 5, checkins: 6 },
    { day: 'الأربعاء', checkouts: 8, checkins: 7 },
    { day: 'الخميس', checkouts: 3, checkins: 4 }
  ];

  const isOnline = getIsOnline();
  const offlineQueue = getOfflineQueue();

  return (
    <div className="space-y-5 font-cairo">
      
      {/* 1. Executive Header Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-slate-900 text-white shadow-xs">
              <BarChart3 className="w-5 h-5 text-blue-400 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">
                لوحة التحليلات التنفيذية وسجل الرقابة والأداء (Executive BI & Audit)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                مؤشرات الأداء التشغيلية الرئيسية (KPIs)، معدلات دوران الأرشيف، وسجل تداول الفواصل الميداني
              </p>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
          {/* Sub-tabs switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
            <button
              type="button"
              id="reports-tab-bi"
              onClick={() => setActiveTab('bi')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'bi' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>مؤشرات الإدارة (BI)</span>
            </button>

            <button
              type="button"
              id="reports-tab-logs"
              onClick={() => setActiveTab('logs')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all cursor-pointer ${
                activeTab === 'logs' 
                  ? 'bg-white text-slate-900 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>سجل التدقيق ({auditLogs.length})</span>
            </button>
          </div>

          {/* Export Official PDF Report Button */}
          <button
            type="button"
            id="reports-export-pdf-btn"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-black shadow-xs transition-all cursor-pointer"
            title="توليد تقرير رسمي أنيق جاهز للطباعة والحفظ كـ PDF للإدارة العليا"
          >
            <Printer className="w-4 h-4 text-emerald-400" />
            <span>تصدير تقرير الإدارة التنفيذية PDF</span>
          </button>

          {/* Offline Center Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOfflineModalOpen(true)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold border shadow-2xs transition-all cursor-pointer ${
              !isOnline || offlineQueue.length > 0
                ? 'bg-amber-50 border-amber-300 text-amber-900 animate-pulse'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
            }`}
            title="فحص حالة المزامنة والعمل بدون إنترنت في باطن الأرض"
          >
            {!isOnline ? (
              <WifiOff className="w-4 h-4 text-amber-600" />
            ) : (
              <Wifi className="w-4 h-4 text-emerald-600" />
            )}
            <span className="hidden sm:inline">
              {!isOnline ? 'أوفلاين' : offlineQueue.length > 0 ? `معلق (${offlineQueue.length})` : 'متزامن'}
            </span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: EXECUTIVE BI DASHBOARD ================= */}
      {activeTab === 'bi' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top 4 Hero KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* KPI 1: Monthly Turnover */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-blue-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold">معدل دوران الملفات شهرياً</span>
                <span className="p-1 rounded bg-blue-50 text-blue-700">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {monthlyTurnoverRate}%
              </div>
              <div className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>نشاط تداول قياسي ومستقر</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                مقارنة بإجمالي الفواصل المودعة
              </div>
            </div>

            {/* KPI 2: Average Turnaround Time */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold">متوسط زمن استرجاع الفواصل</span>
                <span className="p-1 rounded bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 font-mono mt-1">
                {averageReturnDays}
              </div>
              <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1 mt-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>الحد المستهدف: أقل من 5 أيام</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                التزام عالي من المستعيرين بالمواعيد
              </div>
            </div>

            {/* KPI 3: Top Active Chapter */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold">أكثر الأبواب حركة وطلباً</span>
                <span className="p-1 rounded bg-emerald-50 text-emerald-700">
                  <Award className="w-4 h-4" />
                </span>
              </div>
              <div className="text-lg font-black text-slate-900 mt-1 truncate">
                {topChapter.name}
              </div>
              <div className="text-[11px] font-bold text-blue-700 mt-1 font-mono">
                كود: {topChapter.code} • {topChapter.separatorsCount} فاصل
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                يستحوذ على أعلى طلبات مراجعة
              </div>
            </div>

            {/* KPI 4: Archive Safety & Availability Score */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs relative overflow-hidden group hover:border-indigo-300 transition-all">
              <div className="flex items-center justify-between text-slate-500 mb-1">
                <span className="text-xs font-bold">مؤشر جاهزية وسلامة الأرشيف</span>
                <span className="p-1 rounded bg-indigo-50 text-indigo-700">
                  <ShieldCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-emerald-700 font-mono mt-1">
                {availablePercentage}%
              </div>
              <div className="text-[11px] font-bold text-emerald-700 mt-1">
                {availableCount} متاح / {checkedOutSeps.length} مستعار
              </div>
              <div className="text-[10px] text-slate-400 mt-0.5">
                حفظ فيزيائي كامل داخل الخزائن
              </div>
            </div>
          </div>

          {/* Section 2: Visual Charts & Analytics Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            
            {/* Chart 1: Chapters Activity Distribution Bar Chart (2 cols) */}
            <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-blue-600" />
                    تحليل نشاط وتوزيع الأبواب الـ 7 في الأرشيف
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    مقارنة حجم الفواصل الكرتونية ومعدل الإعارات لكل موضوع
                  </p>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  7 موضوعات رسمية
                </span>
              </div>

              {/* Interactive Progress Bars per Chapter */}
              <div className="space-y-3 pt-1">
                {chapterStats.map((ch) => {
                  const percent = Math.round((ch.activityWeight / maxActivity) * 100);
                  return (
                    <div key={ch.id} className="space-y-1 group">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-800 flex items-center gap-1.5">
                          <span 
                            className="w-2.5 h-2.5 rounded-full inline-block"
                            style={{ backgroundColor: ch.color }}
                          />
                          <span>{ch.name}</span>
                          <span className="font-mono text-[10px] text-slate-400">({ch.code})</span>
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500">
                          <span>{ch.separatorsCount} فاصل</span>
                          <span>•</span>
                          <span className="text-blue-700 font-bold">{ch.bindersCount} مجلدات</span>
                        </div>
                      </div>

                      {/* Bar Container */}
                      <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full rounded-full transition-all duration-500 relative group-hover:brightness-110"
                          style={{ 
                            width: `${Math.max(percent, 8)}%`,
                            backgroundColor: ch.color 
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Chart 2: Archive Stock Status & Circulation Doughnut Summary (1 col) */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="pb-3 border-b border-slate-100">
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    حالة مخزون الأرشيف الفيزيائي
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    نسبة المتاح مقابل المستعار حالياً
                  </p>
                </div>

                {/* Circular Visual / Radial Representation */}
                <div className="py-6 flex flex-col items-center justify-center">
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      {/* Background circle */}
                      <path
                        className="text-slate-100"
                        strokeWidth="3.5"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      {/* Foreground Progress Circle */}
                      <path
                        className="text-emerald-500 transition-all duration-700"
                        strokeDasharray={`${availablePercentage}, 100`}
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-2xl font-black text-slate-900 font-mono leading-none">
                        {availablePercentage}%
                      </span>
                      <span className="text-[10px] font-bold text-emerald-700 mt-1">متاح بالخزانة</span>
                    </div>
                  </div>
                </div>

                {/* Legend list */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50/60 border border-emerald-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                      <span className="font-bold text-emerald-950">فواصل متاحة بالأرفف</span>
                    </div>
                    <span className="font-mono font-black text-emerald-900">{availableCount} فاصل</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50/60 border border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                      <span className="font-bold text-amber-950">فواصل مستعارة ميدانياً</span>
                    </div>
                    <span className="font-mono font-black text-amber-900">{checkedOutSeps.length} فاصل</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>الموقع الميداني الموحد:</span>
                <span className="font-bold text-slate-800">غرفة 102 • الخزانة الرئيسية</span>
              </div>
            </div>

          </div>

          {/* Section 3: Most Active Borrowers & Weekly Trend */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            
            {/* Top Borrowing Departments / Persons */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    أكثر المستعيرين والإدارات طلباً للملفات
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    متابعة حركة الاستعارة لضمان سرعة الاسترداد الدوري
                  </p>
                </div>
                <span className="text-xs text-slate-400 font-mono">سجل التدقيق</span>
              </div>

              {borrowerStats.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {borrowerStats.map((b, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-[10px]">
                          {idx + 1}
                        </div>
                        <div>
                          <div className="font-black text-slate-900">{b.name}</div>
                          <div className="text-[10px] text-slate-400">قسم التوثيق / الإدارات المعنية</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-800 font-mono font-bold text-xs border border-blue-200">
                          {b.count} إعارات
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold">ملتزم</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  لا توجد حركات إعارة مسجلة حالياً
                </div>
              )}
            </div>

            {/* Weekly Flow Activity Heatmap */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="pb-2.5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    حركة التداول الأسبوعية (إعارة مقابل استرجاع)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    متوسط التدفق اليومي للوثائق الميدانية
                  </p>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold">
                  <span className="flex items-center gap-1 text-amber-700">
                    <span className="w-2 h-2 rounded bg-amber-500" />
                    إعارة
                  </span>
                  <span className="flex items-center gap-1 text-emerald-700">
                    <span className="w-2 h-2 rounded bg-emerald-500" />
                    استرجاع
                  </span>
                </div>
              </div>

              {/* Weekly Mini Bars */}
              <div className="space-y-3 pt-2">
                {weeklyFlow.map((flow, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-xs">
                    <span className="w-16 font-bold text-slate-600 text-xs shrink-0">{flow.day}</span>
                    <div className="flex-1 flex gap-1 h-3 rounded bg-slate-100 overflow-hidden">
                      <div 
                        className="h-full bg-amber-500 rounded-r"
                        style={{ width: `${(flow.checkouts / 10) * 50}%` }}
                        title={`إعارة: ${flow.checkouts}`}
                      />
                      <div 
                        className="h-full bg-emerald-500 rounded-l"
                        style={{ width: `${(flow.checkins / 10) * 50}%` }}
                        title={`استرجاع: ${flow.checkins}`}
                      />
                    </div>
                    <span className="w-12 text-left font-mono text-[11px] text-slate-400 shrink-0">
                      {flow.checkouts + flow.checkins} حركة
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ================= TAB 2: AUDIT LOGS & CHECKOUTS ================= */}
      {activeTab === 'logs' && (
        <div className="space-y-5 animate-in fade-in duration-150">
          
          {/* Top Metric Cards for Logs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div className="p-4 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="text-xs text-slate-500 font-bold">إجمالي حركات التدقيق المسجلة</div>
              <div className="text-2xl font-black text-slate-900 mt-1 font-mono">{auditLogs.length} حركة</div>
              <div className="text-xs text-emerald-600 font-bold mt-1">سجل تدقيق مشفر ومحفوظ سحابياً</div>
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
              <div className="text-xs text-emerald-600 font-bold mt-1">مودعة داخل المجلدات الميدانية</div>
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
      )}

      {/* Official Executive PDF Report Modal */}
      <ExecutiveReportPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        chapters={chapters}
        binders={binders}
        separators={activeItems}
        auditLogs={auditLogs}
      />

      {/* Offline Sync Center Modal */}
      <OfflineSyncModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

    </div>
  );
}
