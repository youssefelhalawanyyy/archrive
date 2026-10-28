import React, { useState, useEffect } from 'react';
import { Plus, QrCode, Layers, CheckCircle2, Clock, Sparkles, FileSpreadsheet, Download, Archive, Loader2 } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MobileBottomNav from './components/MobileBottomNav';
import InstallPWABanner from './components/InstallPWABanner';
import DocumentsTable from './components/DocumentsTable';
import ChaptersHierarchyView from './components/ChaptersHierarchyView';
import AddChapterModal from './components/AddChapterModal';
import EditChapterModal from './components/EditChapterModal';
import AddBinderModal from './components/AddBinderModal';
import EditBinderModal from './components/EditBinderModal';
import AddSeparationModal from './components/AddSeparationModal';
import EditSeparationModal from './components/EditSeparationModal';
import DeleteConfirmModal from './components/DeleteConfirmModal';
import CheckoutModal from './components/CheckoutModal';
import QRModal from './components/QRModal';
import SpineLabelModal from './components/SpineLabelModal';
import ExcelImportExportModal from './components/ExcelImportExportModal';
import OfflineSyncModal from './components/OfflineSyncModal';
import BindersView from './components/BindersView';
import ReportsView from './components/ReportsView';
import LoginPage from './components/LoginPage';
import OmniDetailModal from './components/OmniDetailModal';

import { 
  getChapters,
  subscribeToChapters,
  addChapter,
  updateChapter,
  deleteChapter,
  getBinders,
  subscribeToBinders,
  addBinder,
  updateBinder,
  deleteBinder,
  getSeparators,
  subscribeToSeparators,
  addSeparator,
  updateSeparator,
  toggleSeparatorStatus,
  deleteSeparator,
  bulkAddSeparators,
  getAuditLogs,
  subscribeToAuditLogs,
  subscribeToSyncStatus,
  getOfflineQueue,
  subscribeToOfflineQueue,
  subscribeToAuth,
  logoutUser,
  getCachedAuthUser,
  syncMasterDataToFirestore
} from './services/firebase';

export default function App() {
  const [chapters, setChapters] = useState(() => getChapters());
  const [binders, setBinders] = useState(() => getBinders());
  const [separators, setSeparators] = useState(() => getSeparators());
  const [auditLogs, setAuditLogs] = useState(() => getAuditLogs());
  const [searchQuery, setSearchQuery] = useState('');
  const [syncStatus, setSyncStatus] = useState('synced');
  
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => getCachedAuthUser());
  const [authInitialized, setAuthInitialized] = useState(false);
  
  // Start with hierarchy view: Chapter -> Binder -> Separator
  const [currentTab, setCurrentTab] = useState('hierarchy'); 
  
  // Mobile drawer & PWA state
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isInstallTriggered, setIsInstallTriggered] = useState(false);

  // Add Modals state
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [isAddBinderModalOpen, setIsAddBinderModalOpen] = useState(false);
  const [isAddSeparationModalOpen, setIsAddSeparationModalOpen] = useState(false);
  const [targetBinderForSeparation, setTargetBinderForSeparation] = useState(null);
  const [targetChapterForBinder, setTargetChapterForBinder] = useState(null);

  // Edit Modals state
  const [isEditChapterModalOpen, setIsEditChapterModalOpen] = useState(false);
  const [targetChapterForEdit, setTargetChapterForEdit] = useState(null);

  const [isEditBinderModalOpen, setIsEditBinderModalOpen] = useState(false);
  const [targetBinderForEdit, setTargetBinderForEdit] = useState(null);

  const [isEditSeparationModalOpen, setIsEditSeparationModalOpen] = useState(false);
  const [targetSeparationForEdit, setTargetSeparationForEdit] = useState(null);

  // Delete Confirmation Modal state
  const [deleteModalState, setDeleteModalState] = useState({
    isOpen: false,
    type: 'separator', // 'chapter' | 'binder' | 'separator'
    item: null,
    childCount: 0
  });

  // Action Modals state
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isExcelModalOpen, setIsExcelModalOpen] = useState(false);
  const [isOfflineModalOpen, setIsOfflineModalOpen] = useState(false);
  const [offlineQueue, setOfflineQueue] = useState(getOfflineQueue());
  const [excelModalInitialTab, setExcelModalInitialTab] = useState('import'); // 'import' | 'export'
  const [targetCheckoutItem, setTargetCheckoutItem] = useState(null);
  const [targetQRItem, setTargetQRItem] = useState(null);
  const [targetPrintItem, setTargetPrintItem] = useState(null);

  // Global OmniSearch Navigation & Inspection State
  const [targetHierarchyChapterId, setTargetHierarchyChapterId] = useState(null);
  const [targetHierarchyBinderId, setTargetHierarchyBinderId] = useState(null);
  const [inspectItem, setInspectItem] = useState(null);
  const [isInspectModalOpen, setIsInspectModalOpen] = useState(false);

  const handleNavigateToItem = (item) => {
    if (!item) return;
    setCurrentTab('hierarchy');

    if (item.entityType === 'chapter') {
      setTargetHierarchyChapterId(item.id);
      setTargetHierarchyBinderId(null);
    } else if (item.entityType === 'binder') {
      setTargetHierarchyChapterId(item.chapterId);
      setTargetHierarchyBinderId(item.id);
    } else if (item.entityType === 'separator') {
      if (item.chapterId) setTargetHierarchyChapterId(item.chapterId);
      if (item.binderId) setTargetHierarchyBinderId(item.binderId);
    }
  };

  const handleInspectItem = (item) => {
    setInspectItem(item);
    setIsInspectModalOpen(true);
  };

  // Subscribe to offline queue changes
  useEffect(() => {
    const unsub = subscribeToOfflineQueue((q) => setOfflineQueue(q));
    return () => unsub();
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubAuth = subscribeToAuth((user) => {
      setCurrentUser(user);
      setAuthInitialized(true);
    });
    return () => unsubAuth();
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
  };

  // Read URL query params on launch for PWA shortcuts
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['hierarchy', 'dashboard', 'binders', 'reports'].includes(tabParam)) {
        setCurrentTab(tabParam);
      }
      const actionParam = params.get('action');
      if (actionParam === 'add_separator') {
        setIsAddSeparationModalOpen(true);
      } else if (actionParam === 'scan_qr') {
        setIsQRModalOpen(true);
      }
    } catch (e) {
      console.warn('URL params parsing notice:', e);
    }
  }, []);

  // Initialize live 2-way subscriptions to Firebase (Protected by Authentication Guard)
  useEffect(() => {
    // Free Tier Quota Guard: Never open Firestore listeners when unauthenticated
    if (!currentUser) return;

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

    // Ensure Master Real Enterprise Data is synchronized to Firestore
    syncMasterDataToFirestore();

    return () => {
      if (typeof unsubChapters === 'function') unsubChapters();
      if (typeof unsubBinders === 'function') unsubBinders();
      if (typeof unsubSeparators === 'function') unsubSeparators();
      if (typeof unsubLogs === 'function') unsubLogs();
      if (typeof unsubSync === 'function') unsubSync();
    };
  }, [currentUser]);

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

  // ================= CHAPTERS CRUD =================
  const handleAddChapter = async (newChapter) => {
    const updated = await addChapter(newChapter);
    setChapters(updated);
  };

  const handleOpenEditChapter = (chapter) => {
    setTargetChapterForEdit(chapter);
    setIsEditChapterModalOpen(true);
  };

  const handleUpdateChapter = async (id, updatedFields) => {
    const updated = await updateChapter(id, updatedFields);
    setChapters(updated);
    setBinders(getBinders());
    setSeparators(getSeparators());
    setAuditLogs(getAuditLogs());
  };

  const handleOpenDeleteChapter = (chapter) => {
    const childBindersCount = binders.filter(b => b.chapterId === chapter.id || b.chapterCode === chapter.code).length;
    setDeleteModalState({
      isOpen: true,
      type: 'chapter',
      item: chapter,
      childCount: childBindersCount
    });
  };

  // ================= BINDERS CRUD =================
  const handleAddBinder = async (binderData) => {
    const { updatedBinders } = await addBinder(binderData);
    setBinders(updatedBinders);
    setChapters(getChapters());
  };

  const handleOpenEditBinder = (binder) => {
    setTargetBinderForEdit(binder);
    setIsEditBinderModalOpen(true);
  };

  const handleUpdateBinder = async (id, updatedFields) => {
    const updated = await updateBinder(id, updatedFields);
    setBinders(updated);
    setSeparators(getSeparators());
    setChapters(getChapters());
    setAuditLogs(getAuditLogs());
  };

  const handleOpenDeleteBinder = (binder) => {
    const childSepsCount = separators.filter(s => s.binderId === binder.id || s.binderCode === binder.code).length;
    setDeleteModalState({
      isOpen: true,
      type: 'binder',
      item: binder,
      childCount: childSepsCount
    });
  };

  // ================= SEPARATORS CRUD =================
  const handleAddSeparator = async (sepData) => {
    await addSeparator(sepData);
    setSeparators(getSeparators());
    setBinders(getBinders());
    setAuditLogs(getAuditLogs());
  };

  const handleOpenEditSeparation = (sep) => {
    setTargetSeparationForEdit(sep);
    setIsEditSeparationModalOpen(true);
  };

  const handleUpdateSeparator = async (id, updatedFields) => {
    const updated = await updateSeparator(id, updatedFields);
    setSeparators(updated);
    setBinders(getBinders());
    setAuditLogs(getAuditLogs());
  };

  const handleOpenDeleteSeparation = (sep) => {
    setDeleteModalState({
      isOpen: true,
      type: 'separator',
      item: sep,
      childCount: 0
    });
  };

  // Generic Confirm Delete Callback
  const handleConfirmDelete = async (id) => {
    if (deleteModalState.type === 'chapter') {
      const updated = await deleteChapter(id);
      setChapters(updated);
      setBinders(getBinders());
      setSeparators(getSeparators());
      setAuditLogs(getAuditLogs());
    } else if (deleteModalState.type === 'binder') {
      const updated = await deleteBinder(id);
      setBinders(updated);
      setSeparators(getSeparators());
      setChapters(getChapters());
      setAuditLogs(getAuditLogs());
    } else if (deleteModalState.type === 'separator') {
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

  // Open Print Spine/Tab/Index modal
  const handleOpenPrintModal = (item = null) => {
    setTargetPrintItem(item || binders[0] || separators[0]);
    setIsPrintModalOpen(true);
  };

  // Open Excel Import/Export modal
  const handleOpenExcelModal = (tab = 'import') => {
    setExcelModalInitialTab(tab);
    setIsExcelModalOpen(true);
  };

  // Handle bulk separator deposit from Excel into Firebase
  const handleBulkDeposit = async (items) => {
    const result = await bulkAddSeparators(items);
    setSeparators(result.updatedSeparators);
    setBinders(result.updatedBinders);
    setAuditLogs(getAuditLogs());
    return result;
  };

  // Stats calculation
  const totalSeparators = separators.length;
  const checkedOutCount = separators.filter(s => s.status === 'checked_out').length;
  const availableCount = totalSeparators - checkedOutCount;

  // Gate app behind Login Page if no active session
  if (!currentUser) {
    return <LoginPage onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-cairo" dir="rtl">
      
      {/* 1. Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        docsCount={totalSeparators}
        syncStatus={syncStatus}
        offlineQueueCount={offlineQueue.length}
        currentUser={currentUser}
        onLogout={handleLogout}
        chapters={chapters}
        binders={binders}
        separators={separators}
        onNavigateToItem={handleNavigateToItem}
        onInspectItem={handleInspectItem}
        onToggleMobileMenu={() => setIsMobileDrawerOpen(!isMobileDrawerOpen)}
        onTriggerInstall={() => setIsInstallTriggered(true)}
        onOpenQRModal={() => handleOpenQRModal()}
        onOpenExcel={() => handleOpenExcelModal('import')}
        onOpenExportExcel={() => handleOpenExcelModal('export')}
        onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
      />

      {/* Main Workspace: Sidebar (Right) + Content Area (Left) */}
      <div className="flex-1 flex w-full">
        
        {/* 2. Sidebar Navigation (Desktop Persistent + Mobile Drawer) */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenAddModal={() => {
            setTargetBinderForSeparation(null);
            setIsAddSeparationModalOpen(true);
          }}
          onOpenExcel={() => handleOpenExcelModal('import')}
          onOpenExportExcel={() => handleOpenExcelModal('export')}
          onOpenOfflineModal={() => setIsOfflineModalOpen(true)}
          stats={{
            totalDocs: totalSeparators,
            checkedOutCount,
            availableCount,
            bindersCount: binders.length,
            chaptersCount: chapters.length
          }}
          isOpenMobile={isMobileDrawerOpen}
          onCloseMobile={() => setIsMobileDrawerOpen(false)}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 p-3.5 sm:p-5 lg:p-7 pb-24 md:pb-8 overflow-y-auto max-w-[1600px] mx-auto w-full space-y-5">
          
          {/* TAB 1: Hierarchical View (الموضوعات والأرشيف) - Chapter -> Binder -> Separators */}
          {currentTab === 'hierarchy' && (
            <ChaptersHierarchyView
              chapters={chapters}
              binders={binders}
              separators={separators}
              targetChapterId={targetHierarchyChapterId}
              targetBinderId={targetHierarchyBinderId}
              globalSearchQuery={searchQuery}
              setGlobalSearchQuery={setSearchQuery}
              onOpenAddChapterModal={() => setIsAddChapterModalOpen(true)}
              onOpenEditChapterModal={handleOpenEditChapter}
              onOpenDeleteChapterModal={handleOpenDeleteChapter}
              onOpenAddBinderModal={(chapterId) => {
                setTargetChapterForBinder(chapterId);
                setIsAddBinderModalOpen(true);
              }}
              onOpenEditBinderModal={handleOpenEditBinder}
              onOpenDeleteBinderModal={handleOpenDeleteBinder}
              onOpenAddSeparationModal={(binder) => {
                setTargetBinderForSeparation(binder);
                setIsAddSeparationModalOpen(true);
              }}
              onOpenEditSeparationModal={handleOpenEditSeparation}
              onToggleStatus={handleOpenStatusToggle}
              onOpenQRModal={handleOpenQRModal}
              onOpenPrintModal={handleOpenPrintModal}
              onOpenExcel={() => handleOpenExcelModal('import')}
              onOpenExportExcel={() => handleOpenExcelModal('export')}
              onDeleteSeparator={(sepId) => {
                const target = separators.find(s => s.id === sepId);
                if (target) handleOpenDeleteSeparation(target);
              }}
            />
          )}

          {/* TAB 2: Dashboard with Executive Overview + Separators Table */}
          {currentTab === 'dashboard' && (
            <div className="space-y-5">
              
              {/* Executive Overview Header */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/80">
                      قسم الأرشفة والوثائق • شركة المستقبل
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-2">
                    سجل الفواصل والأرشيف العام
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    إدارة شاملة لجميع الفواصل الكرتونية المودعة في المجلدات مع تتبع حالات الإعارة الميدانية
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetBinderForSeparation(null);
                      setIsAddSeparationModalOpen(true);
                    }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span>إضافة فاصل كرتوني</span>
                  </button>

                  <button
                    type="button"
                    id="dashboard-bulk-excel-btn"
                    onClick={() => handleOpenExcelModal('import')}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                    title="إيداع فواصل متعددة دفعة واحدة من ملف إكسل"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                    <span>إيداع إكسل</span>
                  </button>

                  <button
                    type="button"
                    id="dashboard-export-excel-btn"
                    onClick={() => handleOpenExcelModal('export')}
                    className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs sm:text-sm font-bold transition-all cursor-pointer active:scale-95"
                    title="تصدير نسخة احتياطية كاملة من الأرشيف"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>تصدير الأرشيف</span>
                  </button>
                </div>
              </div>

              {/* Redesigned Executive KPI Metrics */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {/* Total Separators */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">إجمالي الفواصل الكرتونية</span>
                    <span className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
                    {totalSeparators}
                  </div>
                  <div className="text-xs font-semibold text-blue-700 mt-1 flex items-center gap-1">
                    <span>مودعة داخل المجلدات</span>
                  </div>
                </div>

                {/* Active Binders */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-500">المجلدات الفيزيائية النشطة</span>
                    <span className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
                      <FolderArchive className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2 font-mono tracking-tight">
                    {binders.length}
                  </div>
                  <div className="text-xs font-medium text-slate-500 mt-1">
                    موزعة على الخزائن والأرفف
                  </div>
                </div>

                {/* Available */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800">الفواصل المتاحة للحفظ</span>
                    <span className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2 font-mono tracking-tight">
                    {availableCount}
                  </div>
                  <div className="text-xs font-semibold text-emerald-600 mt-1">
                    جاهزة داخل المجلد بالمقر
                  </div>
                </div>

                {/* Checked Out */}
                <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/90 shadow-2xs hover:shadow-xs transition-shadow">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-amber-800">فواصل معارة ميدانياً</span>
                    <span className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                      {checkedOutCount > 0 ? '!' : '✓'}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-black text-amber-700 mt-2 font-mono tracking-tight">
                    {checkedOutCount}
                  </div>
                  <div className="text-xs font-semibold text-amber-800 mt-1">
                    {checkedOutCount > 0 ? 'قيد المراجعة والمتابعة' : 'لا توجد إعارات حالياً'}
                  </div>
                </div>
              </div>

              {/* Separators Table */}
              <DocumentsTable
                separators={separators}
                searchQuery={searchQuery}
                onToggleStatus={handleOpenStatusToggle}
                onOpenQRModal={handleOpenQRModal}
                onOpenPrintModal={handleOpenPrintModal}
                onOpenEditSeparationModal={handleOpenEditSeparation}
                onOpenExcelModal={() => handleOpenExcelModal('import')}
                onOpenExportExcel={() => handleOpenExcelModal('export')}
                onDeleteSeparator={(sepId) => {
                  const target = separators.find(s => s.id === sepId);
                  if (target) handleOpenDeleteSeparation(target);
                }}
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
              onOpenEditBinderModal={handleOpenEditBinder}
              onOpenDeleteBinderModal={handleOpenDeleteBinder}
            />
          )}

          {/* TAB 4: Executive BI Analytics & Audit Reports */}
          {currentTab === 'reports' && (
            <ReportsView
              auditLogs={auditLogs}
              separators={separators}
              chapters={chapters}
              binders={binders}
              onToggleStatus={handleOpenStatusToggle}
            />
          )}

        </main>
      </div>

      {/* 4. Mobile Bottom Navigation Bar (< md) */}
      <MobileBottomNav
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAddModal={() => {
          setTargetBinderForSeparation(null);
          setIsAddSeparationModalOpen(true);
        }}
        checkedOutCount={checkedOutCount}
      />

      {/* 5. In-App PWA Install Banner & iOS Guidance Modal */}
      <InstallPWABanner
        isTriggeredManually={isInstallTriggered}
        onCloseManual={() => setIsInstallTriggered(false)}
      />

      {/* Modals: Chapters */}
      <AddChapterModal
        isOpen={isAddChapterModalOpen}
        onClose={() => setIsAddChapterModalOpen(false)}
        onAddChapter={handleAddChapter}
      />

      <EditChapterModal
        isOpen={isEditChapterModalOpen}
        onClose={() => {
          setIsEditChapterModalOpen(false);
          setTargetChapterForEdit(null);
        }}
        chapter={targetChapterForEdit}
        onUpdateChapter={handleUpdateChapter}
      />

      {/* Modals: Binders */}
      <AddBinderModal
        isOpen={isAddBinderModalOpen}
        onClose={() => setIsAddBinderModalOpen(false)}
        chapters={chapters}
        defaultChapterId={targetChapterForBinder}
        onAddBinder={handleAddBinder}
      />

      <EditBinderModal
        isOpen={isEditBinderModalOpen}
        onClose={() => {
          setIsEditBinderModalOpen(false);
          setTargetBinderForEdit(null);
        }}
        binder={targetBinderForEdit}
        chapters={chapters}
        onUpdateBinder={handleUpdateBinder}
      />

      {/* Modals: Separators */}
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

      <EditSeparationModal
        isOpen={isEditSeparationModalOpen}
        onClose={() => {
          setIsEditSeparationModalOpen(false);
          setTargetSeparationForEdit(null);
        }}
        separator={targetSeparationForEdit}
        binders={binders}
        onUpdateSeparator={handleUpdateSeparator}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModalState.isOpen}
        onClose={() => setDeleteModalState(prev => ({ ...prev, isOpen: false, item: null }))}
        onConfirm={handleConfirmDelete}
        type={deleteModalState.type}
        item={deleteModalState.item}
        childCount={deleteModalState.childCount}
      />

      {/* Operational Modals */}
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
        targetItem={targetPrintItem}
        binders={binders}
        separators={separators}
        chapters={chapters}
      />

      {/* Excel Import / Export & Backup Modal */}
      <ExcelImportExportModal
        isOpen={isExcelModalOpen}
        onClose={() => setIsExcelModalOpen(false)}
        chapters={chapters}
        binders={binders}
        separators={separators}
        auditLogs={auditLogs}
        initialTab={excelModalInitialTab}
        onBulkDeposit={handleBulkDeposit}
      />

      {/* True Offline Center & Mutation Queue Modal */}
      <OfflineSyncModal
        isOpen={isOfflineModalOpen}
        onClose={() => setIsOfflineModalOpen(false)}
      />

      {/* OmniDetail Full Dossier Modal (Tell Everything About It) */}
      <OmniDetailModal
        isOpen={isInspectModalOpen}
        onClose={() => setIsInspectModalOpen(false)}
        item={inspectItem}
        onNavigateToItem={handleNavigateToItem}
        onOpenQRModal={handleOpenQRModal}
        onOpenPrintModal={handleOpenPrintModal}
        onToggleStatus={handleOpenStatusToggle}
      />

    </div>
  );
}
