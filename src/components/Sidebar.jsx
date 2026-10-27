import React from 'react';
import { 
  LayoutDashboard, 
  BookOpen, 
  FolderArchive, 
  Server, 
  FilePlus2, 
  FileText, 
  Boxes, 
  ChevronLeft,
  Sparkles,
  Layers,
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
      badge: `${stats.chaptersCount || 5} موضوعات`,
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold',
      description: 'الموضوع ➔ المجلدات ➔ الفواصل'
    },
    {
      id: 'dashboard',
      label: 'الرئيسية (سجل الوثائق)',
      icon: LayoutDashboard,
      badge: null,
      description: 'متابعة وبحث كافة الوثائق المادية'
    },
    {
      id: 'binders',
      label: 'المجلدات النشطة',
      icon: FolderArchive,
      badge: `${stats.bindersCount} مجلدات`,
      badgeColor: 'bg-brand-50 text-brand-700 border-brand-200',
      description: 'أرفف المجلدات وسعتها'
    },
    {
      id: 'cabinet-map',
      label: 'الخزانة الرقمية',
      icon: Server,
      badge: '3 خزائن',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      description: 'خريطة الأرفف والخزائن الورقية'
    },
    {
      id: 'add-document',
      label: 'إيداع وثيقة جديدة',
      icon: FilePlus2,
      badge: 'جديد',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse',
      isAction: true,
      description: 'إيداع وثيقة في فاصل ومجلد'
    },
    {
      id: 'reports',
      label: 'تقارير الإعارة',
      icon: FileText,
      badge: stats.checkedOutCount > 0 ? `${stats.checkedOutCount} مستعار` : null,
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      description: 'سجل حركات وتدقيق الإعارة'
    }
  ];

  const handleItemClick = (item) => {
    if (item.isAction) {
      onOpenAddModal();
    } else {
      setCurrentTab(item.id);
    }
  };

  return (
    <aside className="w-64 lg:w-72 bg-white border-l border-slate-200/90 flex flex-col justify-between shrink-0 shadow-xs select-none">
      <div className="p-4 lg:p-5">
        
        {/* Quick CTA to Add Document */}
        <button
          type="button"
          id="sidebar-add-doc-cta"
          onClick={onOpenAddModal}
          className="w-full mb-5 flex items-center justify-center gap-2.5 px-4 py-3 bg-gradient-to-r from-brand-600 via-brand-700 to-brand-800 hover:from-brand-500 hover:to-brand-700 text-white rounded-2xl font-bold shadow-md shadow-brand-600/25 transition-all transform active:scale-98 group cursor-pointer"
        >
          <FilePlus2 className="w-5 h-5 transition-transform group-hover:scale-110" />
          <span className="text-sm">إيداع وثيقة جديدة</span>
        </button>

        {/* Navigation Section Title */}
        <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
          القائمة والأقسام
        </div>

        {/* Menu list */}
        <nav className="space-y-1.5" aria-label="شريط التنقل الجانبي">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;

            return (
              <button
                key={item.id}
                type="button"
                id={`sidebar-nav-${item.id}`}
                onClick={() => handleItemClick(item)}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all group cursor-pointer ${
                  isActive
                    ? 'bg-brand-50 text-brand-700 shadow-xs font-bold border border-brand-200/70'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-brand-600 text-white shadow-xs' 
                      : 'bg-slate-100 text-slate-500 group-hover:bg-brand-100 group-hover:text-brand-600'
                  }`}>
                    <Icon className="w-4 h-4 stroke-[2.2]" />
                  </div>
                  <div className="text-right">
                    <span className="block truncate">{item.label}</span>
                  </div>
                </div>

                {item.badge && (
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${item.badgeColor || 'bg-slate-100 text-slate-600'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Physical Archive Snapshot */}
      <div className="p-4 border-t border-slate-100 bg-gradient-to-b from-transparent to-slate-50/70">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Boxes className="w-4 h-4 text-brand-600" />
              حالة الأرشيف الفيزيائي
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/50">
              تصنيف هرمي
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center pt-1">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-base font-black text-slate-800">{stats.totalDocs}</div>
              <div className="text-[11px] text-slate-500">إجمالي الوثائق</div>
            </div>
            <div className="p-2 rounded-xl bg-amber-50/60 border border-amber-100">
              <div className="text-base font-black text-amber-700">{stats.checkedOutCount}</div>
              <div className="text-[11px] text-amber-800">مستعارة حالياً</div>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
            <span>شركة المستقبل</span>
            <span className="text-brand-600 font-bold">الهيكل الميداني</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
