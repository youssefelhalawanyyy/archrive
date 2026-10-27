import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  FolderArchive, 
  FilePlus2, 
  FileText, 
  Boxes, 
  Building2
} from 'lucide-react';

export default function Sidebar({ 
  currentTab, 
  setCurrentTab, 
  onOpenAddModal, 
  stats = { totalDocs: 0, checkedOutCount: 0, availableCount: 0, bindersCount: 5, chaptersCount: 5 } 
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

  return (
    <aside className="w-64 bg-white border-l border-slate-200 flex flex-col justify-between shrink-0 shadow-2xs font-cairo select-none">
      <div className="p-4">
        
        {/* Quick CTA to Add Separator */}
        <button
          type="button"
          id="sidebar-add-doc-cta"
          onClick={onOpenAddModal}
          className="w-full mb-5 flex items-center justify-center gap-2 px-4 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-black transition-all shadow-sm cursor-pointer group"
        >
          <FilePlus2 className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
          <span>+ إضافة فاصل كرتوني</span>
        </button>

        {/* Section Title */}
        <div className="px-2 mb-2.5 text-xs font-extrabold uppercase tracking-wider text-slate-400">
          أقسام الأرشيف
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5" aria-label="شريط التنقل الجانبي">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm transition-all cursor-pointer ${
                  isActive
                    ? 'bg-blue-50/80 text-blue-950 font-black border-r-4 border-blue-600 shadow-2xs'
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
    </aside>
  );
}
