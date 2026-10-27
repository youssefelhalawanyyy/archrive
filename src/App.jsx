import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DigitalTwinWidget from './components/DigitalTwinWidget';
import DocumentsTable from './components/DocumentsTable';
import ChaptersHierarchyView from './components/ChaptersHierarchyView';
import AddDocumentModal from './components/AddDocumentModal';
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
  addChapter,
  getBinders,
  addBinder,
  addSeparationToBinder,
  subscribeToDocuments, 
  addDocument, 
  toggleDocumentStatus, 
  deleteDocument, 
  getAuditLogs,
} from './services/firebase';

export default function App() {
  const [chapters, setChapters] = useState([]);
  const [binders, setBinders] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Start with 'hierarchy' (الموضوعات والأرشيف) as requested:
  // "i want to make it to be start with el mawdoo3 (the chapter) first"
  const [currentTab, setCurrentTab] = useState('hierarchy'); 
  
  // Selected Document & Binder for the Digital Twin
  const [selectedDocId, setSelectedDocId] = useState(null);
  const [selectedBinderId, setSelectedBinderId] = useState('binder-1');

  // Modals state
  const [isAddDocModalOpen, setIsAddDocModalOpen] = useState(false);
  const [isAddChapterModalOpen, setIsAddChapterModalOpen] = useState(false);
  const [isAddBinderModalOpen, setIsAddBinderModalOpen] = useState(false);
  const [isAddSeparationModalOpen, setIsAddSeparationModalOpen] = useState(false);
  const [targetBinderForSeparation, setTargetBinderForSeparation] = useState(null);
  const [targetChapterForBinder, setTargetChapterForBinder] = useState(null);
  const [docInitialContext, setDocInitialContext] = useState(null);

  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [targetCheckoutDoc, setTargetCheckoutDoc] = useState(null);
  const [targetQRItem, setTargetQRItem] = useState(null);

  // Initialize data & subscribe to Firestore / local sync
  useEffect(() => {
    // 1. Chapters
    const loadedChapters = getChapters();
    setChapters(loadedChapters);

    // 2. Binders
    const loadedBinders = getBinders();
    setBinders(loadedBinders);

    // 3. Audit logs
    const loadedLogs = getAuditLogs();
    setAuditLogs(loadedLogs);

    // 4. Documents with real-time sync
    const unsubscribe = subscribeToDocuments((docs) => {
      setDocuments(docs);
      if (docs.length > 0 && !selectedDocId) {
        setSelectedDocId(docs[0].id);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Selected document object & active binder
  const selectedDoc = documents.find(d => d.id === selectedDocId) || documents[0] || null;
  const selectedBinder = binders.find(b => b.id === (selectedDoc?.binderId || selectedBinderId)) || binders[0] || null;

  // Handle Document Selection
  const handleSelectDoc = (doc) => {
    setSelectedDocId(doc.id);
    if (doc.binderId) {
      setSelectedBinderId(doc.binderId);
    }
  };

  // Handle Binder Selection
  const handleSelectBinder = (binder) => {
    setSelectedBinderId(binder.id);
    const docInBinder = documents.find(d => d.binderId === binder.id);
    if (docInBinder) {
      setSelectedDocId(docInBinder.id);
    }
  };

  // Status Toggle
  const handleOpenStatusToggle = (doc) => {
    setTargetCheckoutDoc(doc);
    setIsCheckoutModalOpen(true);
  };

  const handleConfirmStatusToggle = async (docId, details) => {
    const updated = await toggleDocumentStatus(docId, details);
    setDocuments(updated);
    setAuditLogs(getAuditLogs());
  };

  // Add Chapter
  const handleAddChapter = async (newChapter) => {
    const updated = await addChapter(newChapter);
    setChapters(updated);
  };

  // Add Binder
  const handleAddBinder = async (binderData) => {
    const { updatedBinders, newBinder } = await addBinder(binderData);
    setBinders(updatedBinders);
    setChapters(getChapters());
    setSelectedBinderId(newBinder.id);
  };

  // Add Separation
  const handleAddSeparation = async (binderId, sepData) => {
    const { updatedBinders } = await addSeparationToBinder(binderId, sepData);
    setBinders(updatedBinders);
  };

  // Add Document
  const handleAddDocument = async (newDoc) => {
    await addDocument(newDoc);
    setDocuments(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
    setBinders(getBinders());
    setSelectedDocId(newDoc.id);
    setAuditLogs(getAuditLogs());
  };

  // Open Add Document with Context
  const handleOpenAddDocWithContext = (chapter, binder, separation) => {
    setDocInitialContext({
      chapterId: chapter?.id,
      binderId: binder?.id,
      separationId: separation?.id
    });
    setIsAddDocModalOpen(true);
  };

  // Delete Document
  const handleDeleteDoc = async (id) => {
    if (window.confirm("هل أنت متأكد من رغبتك في حذف هذه الوثيقة من سجل الأرشيف؟")) {
      const updated = await deleteDocument(id);
      setDocuments(updated);
      setAuditLogs(getAuditLogs());
      if (selectedDocId === id && updated.length > 0) {
        setSelectedDocId(updated[0].id);
      }
    }
  };

  // Open QR Scanner modal
  const handleOpenQRModal = (item = null) => {
    setTargetQRItem(item || selectedDoc || selectedBinder);
    setIsQRModalOpen(true);
  };

  // Open Spine Label modal
  const handleOpenPrintModal = (binder = null) => {
    setIsPrintModalOpen(true);
  };

  // Stats calculation
  const totalDocs = documents.length;
  const checkedOutCount = documents.filter(d => d.status === 'checked_out').length;
  const availableCount = totalDocs - checkedOutCount;

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-800 flex flex-col font-cairo" dir="rtl">
      
      {/* 1. Top Navbar */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenAddModal={() => {
          setDocInitialContext(null);
          setIsAddDocModalOpen(true);
        }}
        docsCount={totalDocs}
      />

      {/* Main Workspace: Sidebar (Right) + Content Area (Left) */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        
        {/* 2. Sidebar Navigation */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onOpenAddModal={() => {
            setDocInitialContext(null);
            setIsAddDocModalOpen(true);
          }}
          stats={{
            totalDocs,
            checkedOutCount,
            availableCount,
            bindersCount: binders.length,
            chaptersCount: chapters.length
          }}
        />

        {/* 3. Main Content Area */}
        <main className="flex-1 p-4 lg:p-7 overflow-y-auto space-y-6">
          
          {/* TAB 1: Hierarchical View (الموضوعات والأرشيف) - Starts with el mawdoo3 first! */}
          {currentTab === 'hierarchy' && (
            <ChaptersHierarchyView
              chapters={chapters}
              binders={binders}
              documents={documents}
              onOpenAddChapterModal={() => setIsAddChapterModalOpen(true)}
              onOpenAddBinderModal={(chapterId) => {
                setTargetChapterForBinder(chapterId);
                setIsAddBinderModalOpen(true);
              }}
              onOpenAddSeparationModal={(binder) => {
                setTargetBinderForSeparation(binder);
                setIsAddSeparationModalOpen(true);
              }}
              onOpenAddDocWithContext={handleOpenAddDocWithContext}
              onSelectDoc={(doc) => {
                handleSelectDoc(doc);
                setCurrentTab('dashboard');
              }}
              onToggleStatus={handleOpenStatusToggle}
              onOpenQRModal={handleOpenQRModal}
            />
          )}

          {/* TAB 2: Dashboard with Physical Location Digital Twin + Recent Documents */}
          {currentTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Physical Location Widget (The "Digital Twin" Panel) */}
              <DigitalTwinWidget
                selectedItem={selectedDoc}
                selectedBinder={selectedBinder}
                onOpenQRModal={() => handleOpenQRModal(selectedDoc)}
                onOpenPrintModal={() => handleOpenPrintModal(selectedBinder)}
                onToggleStatus={handleOpenStatusToggle}
              />

              {/* Recent Documents Table */}
              <DocumentsTable
                documents={documents}
                searchQuery={searchQuery}
                selectedDocId={selectedDocId}
                onSelectDoc={handleSelectDoc}
                onToggleStatus={handleOpenStatusToggle}
                onOpenQRModal={(doc) => handleOpenQRModal(doc)}
                onDeleteDoc={handleDeleteDoc}
              />

            </div>
          )}

          {/* TAB 3: Active Binders */}
          {currentTab === 'binders' && (
            <BindersView
              binders={binders}
              documents={documents}
              onSelectBinder={(binder) => {
                handleSelectBinder(binder);
                setCurrentTab('dashboard');
              }}
              onOpenQRModal={(b) => handleOpenQRModal(b)}
              onOpenPrintModal={(b) => handleOpenPrintModal(b)}
            />
          )}

          {/* TAB 4: Digital Cabinet Map */}
          {currentTab === 'cabinet-map' && (
            <CabinetMapView
              binders={binders}
              documents={documents}
              onSelectDoc={(doc) => {
                handleSelectDoc(doc);
                setCurrentTab('dashboard');
              }}
              onSelectBinder={(binder) => {
                handleSelectBinder(binder);
                setCurrentTab('dashboard');
              }}
            />
          )}

          {/* TAB 5: Checkout & Audit Reports */}
          {currentTab === 'reports' && (
            <ReportsView
              auditLogs={auditLogs}
              documents={documents}
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
        onClose={() => setIsAddSeparationModalOpen(false)}
        binder={targetBinderForSeparation}
        onAddSeparation={handleAddSeparation}
      />

      <AddDocumentModal
        isOpen={isAddDocModalOpen}
        onClose={() => {
          setIsAddDocModalOpen(false);
          setDocInitialContext(null);
        }}
        onAddDocument={handleAddDocument}
        chapters={chapters}
        binders={binders}
        initialContext={docInitialContext}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        document={targetCheckoutDoc}
        onConfirmToggle={handleConfirmStatusToggle}
      />

      <QRModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        targetItem={targetQRItem || selectedDoc}
        targetBinder={selectedBinder}
        onToggleStatus={handleOpenStatusToggle}
      />

      <SpineLabelModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        binder={selectedBinder}
        document={selectedDoc}
      />

    </div>
  );
}
