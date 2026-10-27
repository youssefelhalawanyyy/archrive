import React from 'react';
import { 
  BookOpen, 
  LayoutDashboard, 
  FolderArchive, 
  FileText, 
  Plus
} from 'lucide-react';

export default function MobileBottomNav({
  currentTab,
  setCurrentTab,
  onOpenAddModal,
  checkedOutCount = 0
}) {
  const tabs = [
    {
      id: 'hierarchy',
      label: 'الموضوعات',
      icon: BookOpen
    },
    {
      id: 'dashboard',
      label: 'السجل العام',
      icon: LayoutDashboard
    },
    {
      id: 'add_action',
      label: 'إضافة فاصل',
      icon: Plus,
      isAction: true
    },
    {
      id: 'binders',
      label: 'المجلدات',
      icon: FolderArchive
    },
    {
      id: 'reports',
      label: 'التقارير',
      icon: FileText,
      badge: checkedOutCount > 0 ? checkedOutCount : null
    }
  ];

  return (
    <nav 
      aria-label="شريط التنقل السفلي للهواتف" 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_20px_rgba(15,23,42,0.08)] font-cairo select-none"
      style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0.5rem))' }}
    >
      <div className="grid grid-cols-5 items-center px-1 pt-1.5 pb-1 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          // Special Center Action Button: Quick Add Separator
          if (tab.isAction) {
            return (
              <div key={tab.id} className="flex flex-col items-center justify-center">
                <button
                  type="button"
                  id="mobile-bottom-nav-add-btn"
                  onClick={onOpenAddModal}
                  aria-label="إضافة فاصل كرتوني جديد"
                  className="w-12 h-12 -mt-5 rounded-full bg-blue-700 hover:bg-blue-800 active:scale-95 text-white flex items-center justify-center shadow-lg shadow-blue-700/30 border-2 border-white transition-all cursor-pointer"
                >
                  <Plus className="w-6 h-6 stroke-[2.6]" />
                </button>
                <span className="text-[10px] font-black text-blue-700 mt-1">
                  + فاصل
                </span>
              </div>
            );
          }

          return (
            <button
              key={tab.id}
              type="button"
              id={`mobile-nav-tab-${tab.id}`}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1 rounded-lg transition-colors cursor-pointer relative min-h-[46px] ${
                isActive 
                  ? 'text-blue-700 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800 font-medium'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {tab.badge && (
                  <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-mono text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                    {tab.badge}
                  </span>
                )}
              </div>
              
              <span className={`text-[10px] tracking-tight mt-1 truncate max-w-full ${isActive ? 'font-black' : ''}`}>
                {tab.label}
              </span>

              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 bg-blue-600 rounded-full"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
