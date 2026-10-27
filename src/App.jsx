import React, { useState, useEffect } from 'react';
import { Plus, QrCode, Layers, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DocumentsTable from './components/DocumentsTable';
import ChaptersHierarchyView from './components/ChaptersHierarchyView';
import AddChapterModal from './components/AddChapterModal';
import AddBinderModal from './components/AddBinderModal';
import AddSeparationModal from './components/AddSeparationModal';
import CheckoutModal from './components/CheckoutModal';
import QRModal from './components/QRModal';
import SpineLabelModal from './components/SpineLabelModal';
import BindersView from './components/BindersView';
import CabinetMapView from './components/CabinetMapView';
import ReportsView from './components/ReportsView';

import { 
  getChapters,
  subscribeToChapters,
  addChapter,
  getBinders,
  subscribeToBinders,
  addBinder,
  getSeparators,
  subscribeToSeparators,
  addSeparator,
  toggleSeparatorStatus,
  deleteSeparator,
  getAuditLogs,
  subscribeToAuditLogs,
  subscribeToSyncStatus,
} from './services/firebase';

export default function App() {
  const [chapters, setChapters] = useState([]);
  const [binders, setBinders] = useState([]);
  const [separators, setSeparators] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  
  // Start with hierarchy view: Chapter -> Binder -> Separator
  const [currentTab, setCurrentTab] = useState('hierarchy'); 
  
  // Modals state
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [isAddBinderModalOpen, setIsAddBinderModalOpen] = useState(false);
  const [isAddSeparationModalOpen, setIsAddSeparationModalOpen] = useState(false);
  const [targetBinderForSeparation, setTargetBinderForSeparation] = useState(null);
  const [targetChapterForBinder, setTargetChapterForBinder] = useState(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [targetCheckoutItem, setTargetCheckoutItem] = useState(null);
  const [targetQRItem, setTargetQRItem] = useState(null);

  // Initialize live 2-way subscriptions to Firebase
  useEffect(() => {
    // 1. Chapters subscription
    const unsubChapters = subscribeToChapters((chaps) => {
      setChapters(chaps);
    });

    // 2. Binders subscription
    const unsubBinders = subscribeToBinders((bnds) => {
      setBinders(bnds);
    });

    // 3. Separators subscription
    const unsubSeparators = subscribeToSeparators((seps) => {
      setSeparators(seps);
    });

    // 4. Audit logs subscription
    const unsubLogs = subscribeToAuditLogs((logs) => {
      setAuditLogs(logs);
    });

    // 5. Cloud sync status
    const unsubSync = subscribeToSyncStatus((status) => {
      setSyncStatus(status);
    });

    return () => {
      if (typeof unsubChapters === 'function') unsubChapters();
      if (typeof unsubBinders === 'function') unsubBinders();
      if (typeof unsubSeparators === 'function') unsubSeparators();
      if (typeof unsubLogs === 'function') unsubLogs();
      if (typeof unsubSync === 'function') unsubSync();
    };
  }, []);

  // Status Toggle for a Separator
  const handleOpenStatusToggle = (item) => {
    setTargetCheckoutItem(item);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmStatusToggle = async (itemId, details) => {
    const updated = await toggleSeparatorStatus(itemId, details);
    setSeparators(updated);
    setAuditLogs(getAuditLogs());
  };

  // Add Chapter
  const handleAddChapter = async (newChapter) => {
    const updated = await addChapter(newChapter);
    setChapters(updated);
  };

  // Add Binder
  const handleAddBinder = async (binderData) => {
    const { updatedBinders } = await addBinder(binderData);
    setBinders(updatedBinders);
    setChapters(getChapters());
  };

  // Add Separator
  const handleAddSeparator = async (sepData) => {
    await addSeparator(sepData);
    setSeparators(getSeparators());
    setBinders(getBinders());
    setAuditLogs(getAuditLogs());
  };

  // Delete Separator
  const handleDeleteSeparator = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذا الفاصل من سجل الأرشيف؟")) {
      const updated = await deleteSeparator(id);
      setSeparators(updated);
      setBinders(getBinders());
      setAuditLogs(getAuditLogs());
    }
  };

  // Open QR Scanner modal
  const handleOpenQRModal = (item = null) => {
    setTargetQRItem(item || separators[0] || binders[0]);
    setIsQRModalOpen(true);
  };

  // Open Print Spine/Tab modal
  const handleOpenPrintModal = (item = null) => {
    setTargetQRItem(item || separators[0] || binders[0]);
    setIsPrintModalOpen(true);
  };

  // Stats calculation
  const totalSeparators = separators.length;
  const checkedOutCount = separators.filter(s => s.status === 'checked_out').length;
  const availableCount = totalSeparators - checkedOutCount;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-cairo" dir="rtl">
      
      {/* 1. Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        docsCount={totalSeparators}
        syncStatus={syncStatus}
      />

      {/* Main Workspace: Sidebar (Right) + Content Area (Left) */}
      <div className="flex-1 flex w-full">
        
        {/* 2. Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenAddModal={() => {
            setTargetBinderForSeparation(null);
            setIsAddSeparationModalOpen(true);
          }}
          stats={{
            totalDocs: totalSeparators,
            checkedOutCount,
            availableCount,
            bindersCount: binders.length,
            chaptersCount: chapters.length
          }}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 p-5 lg:p-7 overflow-y-auto max-w-[1550px] mx-auto w-full space-y-5">
          
          {/* TAB 1: Hierarchical View (الموضوعات والأرشيف) - Chapter -> Binder -> Separators */}
          {currentTab === 'hierarchy' && (
            <ChaptersHierarchyView
              chapters={chapters}
              binders={binders}
              separators={separators}
              globalSearchQuery={searchQuery}
              setGlobalSearchQuery={setSearchQuery}
              onOpenAddChapterModal={() => setIsAddChapterModalOpen(true)}
              onOpenAddBinderModal={(chapterId) => {
                setTargetChapterForBinder(chapterId);
                setIsAddBinderModalOpen(true);
              }}
              onOpenAddSeparationModal={(binder) => {
                setTargetBinderForSeparation(binder);
                setIsAddSeparationModalOpen(true);
              }}
              onToggleStatus={handleOpenStatusToggle}
              onOpenQRModal={handleOpenQRModal}
              onOpenPrintModal={handleOpenPrintModal}
              onDeleteSeparator={handleDeleteSeparator}
            />
          )}

          {/* TAB 2: Dashboard with Executive Overview + Separators Table */}
          {currentTab === 'dashboard' && (
            <div className="space-y-5">
              
              {/* Executive Overview Header */}
              <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-800 border border-blue-200">
                      شركة المستقبل • قسم الأرشفة
                    </span>
                  </div>
                  <h2 className="text-lg font-black text-slate-900 mt-1">
                    سجل الفواصل والأرشيف العام
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    إدارة شاملة لجميع الفواصل الكرتونية المودعة في المجلدات مع تتبع حالات الإعارة الميدانية
                  </p>
                </div>

                <div className="flex items-center gap-2 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetBinderForSeparation(null);
                      setIsAddSeparationModalOpen(true);
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة فاصل جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOpenQRModal()}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  >
                    <QrCode className="w-4 h-4" />
                    <span>مسح كود</span>
                  </button>
                </div>
              </div>

              {/* Metrics Row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500">إجمالي الفواصل الكرتونية</div>
                  <div className="text-xl font-black text-slate-900 mt-1 font-mono">{totalSeparators}</div>
                  <div className="text-[10px] text-blue-700 font-bold mt-0.5">مودعة في المجلدات</div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-slate-500">المجلدات الفيزيائية النشطة</div>
                  <div className="text-xl font-black text-slate-900 mt-1 font-mono">{binders.length}</div>
                  <div className="text-[10px] text-slate-500 font-medium mt-0.5">موزعة على الأرفف</div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-emerald-700">الفواصل المتاحة بالخزائن</div>
                  <div className="text-xl font-black text-emerald-700 mt-1 font-mono">{availableCount}</div>
                  <div className="text-[10px] text-emerald-600 font-bold mt-0.5">جاهزة للمطالعة</div>
                </div>

                <div className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs">
                  <div className="text-[11px] font-semibold text-amber-800">الفواصل المستعارة ميدانياً</div>
                  <div className="text-xl font-black text-amber-700 mt-1 font-mono">{checkedOutCount}</div>
                  <div className="text-[10px] text-amber-800 font-bold mt-0.5">قيد المراجعة</div>
                </div>
              </div>

              {/* Separators Table */}
              <DocumentsTable
                separators={separators}
                searchQuery={searchQuery}
                onToggleStatus={handleOpenStatusToggle}
                onOpenQRModal={handleOpenQRModal}
                onOpenPrintModal={handleOpenPrintModal}
                onDeleteSeparator={handleDeleteSeparator}
              />

            </div>
          )}

          {/* TAB 3: Active Binders */}
          {currentTab === 'binders' && (
            <BindersView
              binders={binders}
              separators={separators}
              onSelectBinder={() => setCurrentTab('hierarchy')}
              onOpenQRModal={(b) => handleOpenQRModal(b)}
              onOpenPrintModal={(b) => handleOpenPrintModal(b)}
            />
          )}

          {/* TAB 4: Digital Cabinet Map */}
          {currentTab === 'cabinet-map' && (
            <CabinetMapView
              binders={binders}
              separators={separators}
              onSelectBinder={() => setCurrentTab('hierarchy')}
            />
          )}

          {/* TAB 5: Checkout & Audit Reports */}
          {currentTab === 'reports' && (
            <ReportsView
              auditLogs={auditLogs}
              separators={separators}
              onToggleStatus={handleOpenStatusToggle}
            />
          )}

        </main>
      </div>

      {/* Global Modals */}
      <AddChapterModal
        isOpen={isAddChapterModalOpen}
        onClose={() => setIsAddChapterModalOpen(false)}
        onAddChapter={handleAddChapter}
      />

      <AddBinderModal
        isOpen={isAddBinderModalOpen}
        onClose={() => setIsAddBinderModalOpen(false)}
        chapters={chapters}
        defaultChapterId={targetChapterForBinder}
        onAddBinder={handleAddBinder}
      />

      <AddSeparationModal
        isOpen={isAddSeparationModalOpen}
        onClose={() => {
          setIsAddSeparationModalOpen(false);
          setTargetBinderForSeparation(null);
        }}
        chapters={chapters}
        binders={binders}
        defaultBinder={targetBinderForSeparation}
        onAddSeparator={handleAddSeparator}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        document={targetCheckoutItem}
        onConfirmToggle={handleConfirmStatusToggle}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetItem={targetQRItem}
        targetBinder={binders[0]}
        onToggleStatus={handleOpenStatusToggle}
      />

      <SpineLabelModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        binder={binders[0]}
        document={targetQRItem}
      />

    </div>
  );
}
