import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot,
  query,
  orderBy,
  serverTimestamp 
} from "firebase/firestore";
import { 
  initialChapters, 
  initialBinders, 
  initialDocuments, 
  initialAuditLogs 
} from "../data/initialData";

// User's exact Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC3Lt0xKAwasvKR8jfKgAjZUNm-jq2palo",
  authDomain: "archrive-5798a.firebaseapp.com",
  projectId: "archrive-5798a",
  storageBucket: "archrive-5798a.firebasestorage.app",
  messagingSenderId: "306846062744",
  appId: "1:306846062744:web:8a7f5e2ffe734b1e38d8ed"
};

let app;
let db;
let isFirestoreAvailable = false;

try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  isFirestoreAvailable = true;
} catch (err) {
  console.warn("Firebase initialization warning (using local archive storage fallback):", err);
}

// LocalStorage Keys
const STORAGE_CHAPTERS = "archive_chapters_v2";
const STORAGE_BINDERS = "archive_binders_v2";
const STORAGE_DOCS = "archive_documents_v2";
const STORAGE_LOGS = "archive_audit_logs_v2";

const getLocal = (key, fallback) => {
  try {
    const val = localStorage.getItem(key);
    if (!val) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(val);
  } catch (e) {
    return fallback;
  }
};

const setLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("Local storage save error:", e);
  }
};

// ================= CHAPTERS (الموضوعات / الأبواب) =================
export const getChapters = () => {
  return getLocal(STORAGE_CHAPTERS, initialChapters);
};

export const addChapter = async (newChapter) => {
  const chapters = getChapters();
  const code = (newChapter.code || newChapter.name.slice(0, 3)).toUpperCase().trim();
  const chapterId = newChapter.id || `ch-${code.toLowerCase()}-${Date.now()}`;
  
  const item = {
    ...newChapter,
    id: chapterId,
    code: code,
    bindersCount: 0,
    docsCount: 0
  };

  const updated = [...chapters, item];
  setLocal(STORAGE_CHAPTERS, updated);

  if (db) {
    try {
      const cRef = doc(db, "chapters", chapterId);
      await setDoc(cRef, item);
    } catch (e) {
      console.warn("Firestore chapter sync notice:", e.message);
    }
  }

  return updated;
};

// ================= BINDERS (المجلدات تحت الموضوع) =================
export const getBinders = () => {
  return getLocal(STORAGE_BINDERS, initialBinders);
};

// Auto-generate easy clean code for binders under a chapter (e.g. FIN-01, FIN-02)
export const generateNextBinderCode = (chapterCode) => {
  const binders = getBinders();
  const chapterBinders = binders.filter(b => b.chapterCode === chapterCode);
  const nextNum = chapterBinders.length + 1;
  const formattedNum = nextNum.toString().padStart(2, '0');
  return {
    code: `${chapterCode}-${formattedNum}`,
    number: nextNum
  };
};

export const addBinder = async (newBinder) => {
  const binders = getBinders();
  const binderId = newBinder.id || `binder-${Date.now()}`;
  
  // Ensure auto-generated code if not provided
  let code = newBinder.code;
  let number = newBinder.number;
  if (!code && newBinder.chapterCode) {
    const generated = generateNextBinderCode(newBinder.chapterCode);
    code = generated.code;
    number = generated.number;
  }

  const item = {
    ...newBinder,
    id: binderId,
    code: code,
    number: number || 1,
    currentDocsCount: 0,
    totalCapacity: newBinder.totalCapacity || 200,
    status: "نشط",
    separations: newBinder.separations || [
      { id: `sep-${binderId}-1`, number: 1, code: `${code}-S01`, name: "فاصل 1 (قسم عام)", color: "#38bdf8", docsCount: 0 }
    ],
    qrCode: `ARC-${code}`,
    barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
  };

  const updated = [item, ...binders];
  setLocal(STORAGE_BINDERS, updated);

  // Update chapter's binder count
  const chapters = getChapters();
  const updatedChapters = chapters.map(c => 
    c.id === newBinder.chapterId ? { ...c, bindersCount: (c.bindersCount || 0) + 1 } : c
  );
  setLocal(STORAGE_CHAPTERS, updatedChapters);

  if (db) {
    try {
      const bRef = doc(db, "binders", binderId);
      await setDoc(bRef, item);
    } catch (e) {
      console.warn("Firestore binder sync notice:", e.message);
    }
  }

  return { updatedBinders: updated, newBinder: item };
};

// ================= SEPARATIONS (الفواصل / التبويبات داخل المجلد) =================
export const generateNextSeparationCode = (binder) => {
  const existing = binder?.separations || [];
  const nextNum = existing.length + 1;
  const formattedNum = nextNum.toString().padStart(2, '0');
  return {
    code: `${binder.code}-S${formattedNum}`,
    number: nextNum
  };
};

export const addSeparationToBinder = async (binderId, separationData) => {
  const binders = getBinders();
  const binder = binders.find(b => b.id === binderId);
  if (!binder) return binders;

  const generated = generateNextSeparationCode(binder);
  const sepItem = {
    id: `sep-${Date.now()}`,
    number: generated.number,
    code: separationData.code || generated.code,
    name: separationData.name || `فاصل ${generated.number}`,
    color: separationData.color || '#0ea5e9',
    docsCount: 0,
    description: separationData.description || ''
  };

  const updatedSeparations = [...(binder.separations || []), sepItem];
  const updatedBinders = binders.map(b => 
    b.id === binderId ? { ...b, separations: updatedSeparations } : b
  );
  setLocal(STORAGE_BINDERS, updatedBinders);

  if (db) {
    try {
      const bRef = doc(db, "binders", binderId);
      await updateDoc(bRef, { separations: updatedSeparations });
    } catch (e) {
      console.warn("Firestore separation sync notice:", e.message);
    }
  }

  return { updatedBinders, newSeparation: sepItem };
};

// ================= DOCUMENTS (الوثائق) =================
export const subscribeToDocuments = (onUpdate, onError) => {
  const localDocs = getLocal(STORAGE_DOCS, initialDocuments);
  onUpdate(localDocs);

  if (!isFirestoreAvailable || !db) {
    return () => {};
  }

  try {
    const q = collection(db, "documents");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteDocs = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLocal(STORAGE_DOCS, remoteDocs);
        onUpdate(remoteDocs);
      }
    }, (error) => {
      console.warn("Firestore snapshot notice:", error.message);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (err) {
    return () => {};
  }
};

export const addDocument = async (newDoc) => {
  const docId = newDoc.id || `doc-${Date.now()}`;
  const fullDoc = {
    ...newDoc,
    id: docId,
    createdAt: new Date().toISOString()
  };

  const docs = getLocal(STORAGE_DOCS, initialDocuments);
  const updatedDocs = [fullDoc, ...docs];
  setLocal(STORAGE_DOCS, updatedDocs);

  // Update binder docs count
  if (fullDoc.binderId) {
    const binders = getBinders();
    const updatedBinders = binders.map(b => {
      if (b.id === fullDoc.binderId) {
        const updatedSeps = (b.separations || []).map(s => 
          s.id === fullDoc.separationId ? { ...s, docsCount: (s.docsCount || 0) + 1 } : s
        );
        return {
          ...b,
          currentDocsCount: (b.currentDocsCount || 0) + 1,
          separations: updatedSeps
        };
      }
      return b;
    });
    setLocal(STORAGE_BINDERS, updatedBinders);
  }

  // Audit log
  await addAuditLog({
    docId: docId,
    docTitle: fullDoc.title,
    action: "create",
    actionName: "إيداع وثيقة جديدة",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `إيداع في ${fullDoc.chapterName || 'الموضوع'} ← ${fullDoc.binderName} (${fullDoc.binderCode || ''}) ← ${fullDoc.separationName || 'فاصل'}`
  });

  if (db) {
    try {
      const docRef = doc(db, "documents", docId);
      await setDoc(docRef, fullDoc);
    } catch (e) {
      console.warn("Firestore document add notice:", e.message);
    }
  }

  return fullDoc;
};

export const toggleDocumentStatus = async (id, borrowerDetails = null) => {
  const docs = getLocal(STORAGE_DOCS, initialDocuments);
  const target = docs.find(d => d.id === id);
  if (!target) return docs;

  const isCheckingOut = target.status === "available";
  const newStatus = isCheckingOut ? "checked_out" : "available";

  const changes = {
    status: newStatus,
    borrower: isCheckingOut ? (borrowerDetails?.borrower || "أحمد الراجحي (قسم المحاسبة)") : null,
    borrowDate: isCheckingOut ? (borrowerDetails?.borrowDate || new Date().toISOString().split('T')[0]) : null,
    dueDate: isCheckingOut ? (borrowerDetails?.dueDate || "2024/02/01") : null,
  };

  const updatedDocs = docs.map(d => d.id === id ? { ...d, ...changes } : d);
  setLocal(STORAGE_DOCS, updatedDocs);

  await addAuditLog({
    docId: id,
    docTitle: target.title,
    action: isCheckingOut ? "checkout" : "checkin",
    actionName: isCheckingOut ? "إعارة وثيقة ورقية" : "إعادة وثيقة ورقية للأرشيف",
    performedBy: "أحمد",
    borrower: changes.borrower,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: isCheckingOut 
      ? (borrowerDetails?.reason || "طلب استعارة من قبل الإدارة") 
      : "تم إعادة الوثيقة وتدقيقها في مكانها داخل المجلد والفاصل"
  });

  if (db) {
    try {
      const docRef = doc(db, "documents", id);
      await updateDoc(docRef, changes);
    } catch (e) {
      console.warn("Firestore toggle notice:", e.message);
    }
  }

  return updatedDocs;
};

export const deleteDocument = async (id) => {
  const docs = getLocal(STORAGE_DOCS, initialDocuments);
  const filtered = docs.filter(d => d.id !== id);
  setLocal(STORAGE_DOCS, filtered);

  if (db) {
    try {
      const docRef = doc(db, "documents", id);
      await deleteDoc(docRef);
    } catch (e) {
      console.warn("Firestore delete notice:", e.message);
    }
  }
  return filtered;
};

// ================= AUDIT LOGS =================
export const getAuditLogs = () => {
  return getLocal(STORAGE_LOGS, initialAuditLogs);
};

export const addAuditLog = async (logEntry) => {
  const logs = getAuditLogs();
  const entry = {
    ...logEntry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
  };
  const updated = [entry, ...logs];
  setLocal(STORAGE_LOGS, updated);

  if (db) {
    try {
      const lRef = doc(db, "audit_logs", entry.id);
      await setDoc(lRef, entry);
    } catch (e) {}
  }
  return updated;
};

export { app, db };
