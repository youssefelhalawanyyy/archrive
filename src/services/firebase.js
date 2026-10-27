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
  serverTimestamp 
} from "firebase/firestore";
import { 
  initialChapters, 
  initialBinders, 
  initialSeparators, 
  initialAuditLogs 
} from "../data/initialData";

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
  console.warn("Firebase fallback notice:", err);
}

// LocalStorage Keys
const STORAGE_CHAPTERS = "archive_chapters_v3";
const STORAGE_BINDERS = "archive_binders_v3";
const STORAGE_SEPARATORS = "archive_separators_v3";
const STORAGE_LOGS = "archive_audit_logs_v3";

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
  } catch (e) {}
};

// ================= CHAPTERS (الموضوعات) =================
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
    separatorsCount: 0
  };

  const updated = [...chapters, item];
  setLocal(STORAGE_CHAPTERS, updated);

  if (db) {
    try {
      const cRef = doc(db, "chapters", chapterId);
      await setDoc(cRef, item);
    } catch (e) {}
  }

  return updated;
};

// ================= BINDERS (المجلدات) =================
export const getBinders = () => {
  return getLocal(STORAGE_BINDERS, initialBinders);
};

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
    currentSeparatorsCount: newBinder.separations?.length || 0,
    totalCapacity: newBinder.totalCapacity || 10,
    status: "نشط",
    qrCode: `ARC-${code}`,
    barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`
  };

  const updated = [item, ...binders];
  setLocal(STORAGE_BINDERS, updated);

  // If initial separations were created, add them into separators storage too
  if (newBinder.separations && newBinder.separations.length > 0) {
    const existingSeps = getSeparators();
    const formattedInitialSeps = newBinder.separations.map((s, idx) => ({
      id: s.id || `sep-${Date.now()}-${idx}`,
      code: s.code || `${code}-S${(idx + 1).toString().padStart(2, '0')}`,
      name: s.name || `فاصل ${idx + 1}`,
      chapterId: item.chapterId,
      chapterName: item.chapterName,
      chapterCode: item.chapterCode,
      binderId: item.id,
      binderName: item.name,
      binderCode: item.code,
      cabinet: item.cabinet,
      shelf: item.shelf,
      location: `${item.cabinet} - ${item.shelf}`,
      color: s.color || '#38bdf8',
      papersCount: 20,
      date: new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      status: "available",
      client: "عام",
      description: `فاصل كرتوني داخل مجلد ${item.name}`,
      qrCode: `ARC-${s.code || `${code}-S${(idx + 1).toString().padStart(2, '0')}`}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      createdAt: new Date().toISOString()
    }));
    setLocal(STORAGE_SEPARATORS, [...formattedInitialSeps, ...existingSeps]);
  }

  const chapters = getChapters();
  const updatedChapters = chapters.map(c => 
    c.id === newBinder.chapterId ? { ...c, bindersCount: (c.bindersCount || 0) + 1 } : c
  );
  setLocal(STORAGE_CHAPTERS, updatedChapters);

  if (db) {
    try {
      const bRef = doc(db, "binders", binderId);
      await setDoc(bRef, item);
    } catch (e) {}
  }

  return { updatedBinders: updated, newBinder: item };
};

// ================= SEPARATORS (الفواصل داخل المجلدات) =================
export const getSeparators = () => {
  return getLocal(STORAGE_SEPARATORS, initialSeparators);
};

export const generateNextSeparatorCode = (binder) => {
  const separators = getSeparators();
  const binderSeparators = separators.filter(s => s.binderId === binder?.id || s.binderCode === binder?.code);
  const nextNum = binderSeparators.length + 1;
  const formattedNum = nextNum.toString().padStart(2, '0');
  return {
    code: `${binder?.code || 'BIN-01'}-S${formattedNum}`,
    number: nextNum
  };
};

export const subscribeToSeparators = (onUpdate, onError) => {
  const localSeps = getLocal(STORAGE_SEPARATORS, initialSeparators);
  onUpdate(localSeps);

  if (!isFirestoreAvailable || !db) {
    return () => {};
  }

  try {
    const q = collection(db, "separators");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remoteSeps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setLocal(STORAGE_SEPARATORS, remoteSeps);
        onUpdate(remoteSeps);
      }
    }, (error) => {
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (err) {
    return () => {};
  }
};

export const addSeparator = async (newSeparator) => {
  const sepId = newSeparator.id || `sep-${Date.now()}`;
  const fullSep = {
    ...newSeparator,
    id: sepId,
    createdAt: new Date().toISOString()
  };

  const seps = getLocal(STORAGE_SEPARATORS, initialSeparators);
  const updatedSeps = [fullSep, ...seps];
  setLocal(STORAGE_SEPARATORS, updatedSeps);

  // Update binder's separators count
  const binders = getBinders();
  const updatedBinders = binders.map(b => 
    b.id === fullSep.binderId ? { ...b, currentSeparatorsCount: (b.currentSeparatorsCount || 0) + 1 } : b
  );
  setLocal(STORAGE_BINDERS, updatedBinders);

  // Audit log
  await addAuditLog({
    docId: sepId,
    docTitle: `${fullSep.name} (${fullSep.code})`,
    action: "create",
    actionName: "إيداع فاصل ورقي جديد",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `إضافة فاصل في مجلد ${fullSep.binderName} (${fullSep.binderCode}) بموقع ${fullSep.location}`
  });

  if (db) {
    try {
      const docRef = doc(db, "separators", sepId);
      await setDoc(docRef, fullSep);
    } catch (e) {}
  }

  return fullSep;
};

export const toggleSeparatorStatus = async (id, borrowerDetails = null) => {
  const seps = getLocal(STORAGE_SEPARATORS, initialSeparators);
  const target = seps.find(s => s.id === id);
  if (!target) return seps;

  const isCheckingOut = target.status === "available";
  const newStatus = isCheckingOut ? "checked_out" : "available";

  const changes = {
    status: newStatus,
    borrower: isCheckingOut ? (borrowerDetails?.borrower || "أحمد الراجحي (قسم المحاسبة)") : null,
    borrowDate: isCheckingOut ? (borrowerDetails?.borrowDate || new Date().toISOString().split('T')[0]) : null,
    dueDate: isCheckingOut ? (borrowerDetails?.dueDate || "2024/02/01") : null,
  };

  const updatedSeps = seps.map(s => s.id === id ? { ...s, ...changes } : s);
  setLocal(STORAGE_SEPARATORS, updatedSeps);

  await addAuditLog({
    docId: id,
    docTitle: `${target.name} (${target.code})`,
    action: isCheckingOut ? "checkout" : "checkin",
    actionName: isCheckingOut ? "إعارة فاصل ورقي" : "إعادة فاصل للمجلد",
    performedBy: "أحمد",
    borrower: changes.borrower,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: isCheckingOut 
      ? (borrowerDetails?.reason || "طلب استعارة من قبل الإدارة") 
      : "تم إعادة الفاصل ومحتوياته إلى المجلد بالخزانة"
  });

  if (db) {
    try {
      const docRef = doc(db, "separators", id);
      await updateDoc(docRef, changes);
    } catch (e) {}
  }

  return updatedSeps;
};

export const deleteSeparator = async (id) => {
  const seps = getLocal(STORAGE_SEPARATORS, initialSeparators);
  const target = seps.find(s => s.id === id);
  const filtered = seps.filter(s => s.id !== id);
  setLocal(STORAGE_SEPARATORS, filtered);

  if (target?.binderId) {
    const binders = getBinders();
    const updatedBinders = binders.map(b => 
      b.id === target.binderId ? { ...b, currentSeparatorsCount: Math.max(0, (b.currentSeparatorsCount || 1) - 1) } : b
    );
    setLocal(STORAGE_BINDERS, updatedBinders);
  }

  if (db) {
    try {
      const docRef = doc(db, "separators", id);
      await deleteDoc(docRef);
    } catch (e) {}
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
