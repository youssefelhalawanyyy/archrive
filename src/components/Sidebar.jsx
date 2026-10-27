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
  Download
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  onOpenAddModal, 
  onOpenExcel,
  onOpenExportExcel,
  stats = { totalDocs: 0, checkedOutCount: 0, availableCount: 0, bindersCount: 5, chaptersCount: 5 },
  isOpenMobile = false,
  onCloseMobile = null
}) {
  const menuItems = [
    {
      id: 'hierarchy',
      label: 'الموضوعات والأرشيف',
      icon: BookOpen,
      badge: `${stats.chaptersCount || 7} موضوعات`,
      description: 'الموضوع ➔ المجلدات ➔ الفواصل'
    },
    {
      id: 'dashboard',
      label: 'سجل الفواصل العام',
      icon: LayoutDashboard,
      badge: null,
      description: 'جدول الفواصل والبحث الفوري'
    },
    {
      id: 'binders',
      label: 'المجلدات النشطة',
      icon: FolderArchive,
      badge: `${stats.bindersCount} مجلدات`,
      description: 'الأرفف وسعة المجلدات'
    },
    {
      id: 'reports',
      label: 'تقارير الإعارة',
      icon: FileText,
      badge: stats.checkedOutCount > 0 ? `${stats.checkedOutCount} مستعار` : null,
      badgeStyle: 'bg-amber-50 text-amber-800 border-amber-200',
      description: 'سجل الإعارة والتدقيق'
    }
  ];

  const handleSelectTab = (tabId) => {
    setCurrentTab(tabId);
    if (onCloseMobile) onCloseMobile();
  };

  const sidebarContent = (
    <>
      <div className="p-4">
        {/* Quick CTA to Add Separator */}
        <button
          type="button"
          id="sidebar-add-doc-cta"
          onClick={() => {
            onOpenAddModal();
            if (onCloseMobile) onCloseMobile();
          }}
          className="w-full mb-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 active:scale-98 text-white rounded-xl text-sm font-black transition-all shadow-sm cursor-pointer group"
        >
          <FilePlus2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>+ إضافة فاصل كرتوني</span>
        </button>

        {/* Section Title */}
        <div className="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          أقسام الأرشيف
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="شريط التنقل">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleSelectTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/90 text-blue-950 font-black border-r-4 border-blue-600 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 font-bold'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon className={`w-4 h-4 shrink-0 stroke-[2.2] ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge && (
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                    item.badgeStyle || (isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-slate-100 text-slate-600 border-slate-200')
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bulk Excel & Backup Quick Access */}
        {(onOpenExcel || onOpenExportExcel) && (
          <div className="mt-4 pt-3 border-t border-slate-100">
            <div className="px-2 mb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              أدوات الإكسل والنسخ الاحتياطي
            </div>
            <div className="space-y-1.5">
              {onOpenExcel && (
                <button
                  type="button"
                  id="sidebar-excel-import-btn"
                  onClick={() => {
                    onOpenExcel();
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 border border-emerald-200/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700 group-hover:scale-110 transition-transform" />
                    <span>إيداع فواصل (Excel)</span>
                  </div>
                  <span className="text-[10px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
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
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-slate-500 group-hover:scale-110 transition-transform" />
                    <span>تصدير الأرشيف بالكامل</span>
                  </div>
                  <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono">
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
            <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              محدث
            </span>
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
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* 1. Desktop Persistent Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-l border-slate-200 justify-between shrink-0 shadow-2xs font-cairo select-none">
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
