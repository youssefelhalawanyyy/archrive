import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  FolderArchive, 
  FilePlus2, 
  FileText, 
  Boxes, 
  Building2,
  X,
  Archive,
  FileSpreadsheet,
  Download,
  BarChart3,
  Wifi,
  LogOut
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  onOpenAddModal, 
  onOpenExcel,
  onOpenExportExcel,
  onOpenOfflineModal,
  stats = { totalDocs: 0, checkedOutCount: 0, availableCount: 0, bindersCount: 5, chaptersCount: 5 },
  isOpenMobile = false,
  onCloseMobile = null,
  currentUser = null,
  onLogout = null
}) {
  const menuItems = [
    {
      id: 'hierarchy',
      label: 'الموضوعات والأبواب',
      icon: BookOpen,
      badge: `${stats.chaptersCount || 7}`,
      badgeLabel: 'أبواب',
      description: 'شجرة الأرشيف الهيكلية'
    },
    {
      id: 'dashboard',
      label: 'سجل الفواصل الكامل',
      icon: LayoutDashboard,
      badge: `${stats.totalDocs || 0}`,
      badgeLabel: 'فاصل',
      description: 'جدول الفواصل والبحث الفوري'
    },
    {
      id: 'binders',
      label: 'المجلدات والأرفف',
      icon: FolderArchive,
      badge: `${stats.bindersCount || 10}`,
      badgeLabel: 'مجلد',
      description: 'الأرفف وسعة المجلدات'
    },
    {
      id: 'reports',
      label: 'التحليلات ومؤشرات BI',
      icon: BarChart3,
      badge: stats.checkedOutCount > 0 ? `${stats.checkedOutCount} معار` : null,
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'مؤشرات الأداء والتقارير'
    }
  ];

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <>
      <div className="p-4 space-y-4">
        {/* Primary Action CTA */}
        <button
          type="button"
          id="sidebar-add-doc-cta"
          onClick={() => {
            onOpenAddModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2.5 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-98 text-white rounded-xl text-sm font-bold transition-all shadow-xs cursor-pointer group"
        >
          <FilePlus2 className="w-4 h-4 text-blue-200 group-hover:scale-110 transition-transform" />
          <span>إضافة فاصل كرتوني</span>
        </button>

        {/* Section Title */}
        <div>
          <div className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            أقسام الأرشيف
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1" aria-label="شريط التنقل">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  id={`sidebar-nav-${item.id}`}
                  onClick={() => handleSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-900 font-extrabold border-r-3 border-blue-600 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Icon className={`w-4 h-4 shrink-0 stroke-[2] ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="whitespace-nowrap">{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border shrink-0 ${
                      item.badgeStyle || (isActive ? 'bg-blue-100/80 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200/80')
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Excel Tools Section (Clean, Subtle, Not Zahma) */}
        {(onOpenExcel || onOpenExportExcel) && (
          <div className="pt-3 border-t border-slate-100">
            <div className="px-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              أدوات البيانات والأرشيف
            </div>
            <div className="space-y-1">
              {onOpenExcel && (
                <button
                  type="button"
                  id="sidebar-excel-import-btn"
                  onClick={() => {
                    onOpenExcel();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-800 hover:bg-emerald-50/70 border border-transparent hover:border-emerald-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
                    <span>إيداع فواصل (Excel)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-md font-medium">
                    مجمع
                  </span>
                </button>
              )}

              {onOpenExportExcel && (
                <button
                  type="button"
                  id="sidebar-excel-export-btn"
                  onClick={() => {
                    onOpenExportExcel();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-slate-400 group-hover:scale-110 transition-transform" />
                    <span>تصدير نسخة كاملة</span>
                  </div>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md font-mono">
                    .xlsx
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Physical Archive Snapshot */}
      <div className="p-4 border-t border-slate-200 bg-slate-50/70">
        <div className="p-3.5 rounded-xl bg-white border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2.5">
            <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-blue-600" />
              حالة الأرشيف الميداني
            </span>
            <button
              type="button"
              onClick={onOpenOfflineModal}
              title="انقر لفحص المزامنة وحالة العمل أوفلاين في باطن الأرض"
              className="text-[11px] font-bold text-slate-700 hover:text-blue-700 bg-slate-100 hover:bg-blue-50 px-2 py-0.5 rounded border border-slate-200 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Wifi className="w-3 h-3 text-emerald-600" />
              <span>مزامنة الأرشيف</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-slate-900 font-mono">{stats.totalDocs}</div>
              <div className="text-xs text-slate-500 font-medium">إجمالي الفواصل</div>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-amber-700 font-mono">{stats.checkedOutCount}</div>
              <div className="text-xs text-slate-500 font-medium">مستعارة حالياً</div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>شركة المستقبل</span>
            <span className="text-slate-800 font-bold">غرفة الأرشيف 102</span>
          </div>

          {onLogout && (
            <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 min-w-0">
                <div className="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                  {currentUser?.displayName ? currentUser.displayName[0] : (currentUser?.email ? currentUser.email[0].toUpperCase() : 'أ')}
                </div>
                <span className="text-[11px] font-bold text-slate-700 truncate max-w-[110px]" title={currentUser?.email || 'archive@organization.gov'}>
                  {currentUser?.displayName || (currentUser?.email ? currentUser.email.split('@')[0] : 'أحمد الشريف')}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                title="تسجيل الخروج وإنهاء الجلسة"
                className="text-[11px] text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1 hover:bg-rose-50 px-1.5 py-0.5 rounded transition-colors cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>خروج</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-l border-slate-200/90 justify-between shrink-0 shadow-2xs font-cairo select-none">
        {sidebarContent}
      </aside>

      {/* 2. Mobile Drawer Overlay */}
      {isOpenMobile && (
        <div 
          className="md:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-start animate-in fade-in font-cairo"
          onClick={onCloseMobile}
        >
          <div 
            className="w-72 max-w-[85vw] bg-white h-full shadow-2xl flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-900 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <Archive className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">الأرشيف الذكي</h3>
                  <p className="text-[10px] text-blue-200">شركة المستقبل</p>
                </div>
              </div>

              <button
                type="button"
                onClick={onCloseMobile}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                aria-label="إغلاق القائمة"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col justify-between">
              {sidebarContent}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
