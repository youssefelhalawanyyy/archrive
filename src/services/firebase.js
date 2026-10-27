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
  orderBy
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
  console.warn("Firebase initialization warning (using local fallback):", err);
}

// LocalStorage Keys (Local fallback & instant render)
const STORAGE_CHAPTERS = "archive_chapters_v5";
const STORAGE_BINDERS = "archive_binders_v5";
const STORAGE_SEPARATORS = "archive_separators_v5";
const STORAGE_LOGS = "archive_audit_logs_v5";

// ================= SYNC STATUS MANAGEMENT =================
let currentSyncStatus = isFirestoreAvailable ? "synced" : "offline"; // 'synced' | 'saving' | 'offline' | 'error'
const syncListeners = new Set();

export const getSyncStatus = () => currentSyncStatus;

export const subscribeToSyncStatus = (callback) => {
  syncListeners.add(callback);
  callback(currentSyncStatus);
  return () => syncListeners.delete(callback);
};

const notifySyncStatus = (status) => {
  currentSyncStatus = status;
  syncListeners.forEach((cb) => {
    try {
      cb(status);
    } catch (e) {}
  });
};

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

export const subscribeToChapters = (onUpdate, onError) => {
  // Feed local first for instant responsive load
  const local = getChapters();
  onUpdate(local);

  if (!isFirestoreAvailable || !db) return () => {};

  try {
    const q = collection(db, "chapters");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setLocal(STORAGE_CHAPTERS, remote);
        onUpdate(remote);
        notifySyncStatus("synced");
      }
    }, (error) => {
      console.warn("Chapters snapshot warning:", error);
      if (onError) onError(error);
    });
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
};

export const addChapter = async (newChapter) => {
  notifySyncStatus("saving");
  const chapters = getChapters();
  const code = (newChapter.code || newChapter.name.slice(0, 3)).toUpperCase().trim();
  const chapterId = newChapter.id || `ch-${code.toLowerCase()}-${Date.now()}`;
  
  const item = {
    ...newChapter,
    id: chapterId,
    code: code,
    bindersCount: 0,
    separatorsCount: 0,
    createdAt: new Date().toISOString()
  };

  const updated = [...chapters, item];
  setLocal(STORAGE_CHAPTERS, updated);

  if (db) {
    try {
      const cRef = doc(db, "chapters", chapterId);
      await setDoc(cRef, item);
      notifySyncStatus("synced");
    } catch (e) {
      console.error("Firestore addChapter error:", e);
      notifySyncStatus("synced");
    }
  }

  return updated;
};

// ================= BINDERS (المجلدات) =================
export const getBinders = () => {
  return getLocal(STORAGE_BINDERS, initialBinders);
};

export const subscribeToBinders = (onUpdate, onError) => {
  const local = getBinders();
  onUpdate(local);

  if (!isFirestoreAvailable || !db) return () => {};

  try {
    const q = collection(db, "binders");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setLocal(STORAGE_BINDERS, remote);
        onUpdate(remote);
        notifySyncStatus("synced");
      }
    }, (error) => {
      console.warn("Binders snapshot warning:", error);
      if (onError) onError(error);
    });
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
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
  notifySyncStatus("saving");
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
    barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
    createdAt: new Date().toISOString()
  };

  const updated = [item, ...binders];
  setLocal(STORAGE_BINDERS, updated);

  // If initial separations were created, add them into separators storage and Firestore
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

    // Save initial separations to Firestore
    if (db) {
      for (const sep of formattedInitialSeps) {
        try {
          await setDoc(doc(db, "separators", sep.id), sep);
        } catch (e) {}
      }
    }
  }

  // Update chapter's binders count
  const chapters = getChapters();
  const updatedChapters = chapters.map(c => 
    c.id === newBinder.chapterId ? { ...c, bindersCount: (c.bindersCount || 0) + 1 } : c
  );
  setLocal(STORAGE_CHAPTERS, updatedChapters);

  if (db) {
    try {
      const bRef = doc(db, "binders", binderId);
      await setDoc(bRef, item);

      // Update chapter in Firestore
      if (newBinder.chapterId) {
        const cTarget = updatedChapters.find(c => c.id === newBinder.chapterId);
        if (cTarget) {
          await setDoc(doc(db, "chapters", newBinder.chapterId), cTarget, { merge: true });
        }
      }
      notifySyncStatus("synced");
    } catch (e) {
      console.error("Firestore addBinder error:", e);
      notifySyncStatus("synced");
    }
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
  const localSeps = getSeparators();
  onUpdate(localSeps);

  if (!isFirestoreAvailable || !db) return () => {};

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
        notifySyncStatus("synced");
      }
    }, (error) => {
      console.warn("Separators snapshot warning:", error);
      if (onError) onError(error);
    });

    return unsubscribe;
  } catch (err) {
    return () => {};
  }
};

export const addSeparator = async (newSeparator) => {
  notifySyncStatus("saving");
  const sepId = newSeparator.id || `sep-${Date.now()}`;
  const fullSep = {
    ...newSeparator,
    id: sepId,
    createdAt: new Date().toISOString()
  };

  const seps = getSeparators();
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
    actionName: "إيداع فاصل كرتوني جديد",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `إضافة فاصل في مجلد ${fullSep.binderName} (${fullSep.binderCode}) بموقع ${fullSep.location}`
  });

  if (db) {
    try {
      const docRef = doc(db, "separators", sepId);
      await setDoc(docRef, fullSep);

      // Update binder in Firestore
      if (fullSep.binderId) {
        const bTarget = updatedBinders.find(b => b.id === fullSep.binderId);
        if (bTarget) {
          await setDoc(doc(db, "binders", fullSep.binderId), bTarget, { merge: true });
        }
      }
      notifySyncStatus("synced");
    } catch (e) {
      console.error("Firestore addSeparator error:", e);
      notifySyncStatus("synced");
    }
  }

  return fullSep;
};

export const toggleSeparatorStatus = async (id, borrowerDetails = null) => {
  notifySyncStatus("saving");
  const seps = getSeparators();
  const target = seps.find(s => s.id === id);
  if (!target) return seps;

  const isCheckingOut = target.status === "available";
  const newStatus = isCheckingOut ? "checked_out" : "available";

  const changes = {
    status: newStatus,
    borrower: isCheckingOut ? (borrowerDetails?.borrower || "أحمد الراجحي (قسم المحاسبة)") : null,
    borrowDate: isCheckingOut ? (borrowerDetails?.borrowDate || new Date().toISOString().split('T')[0]) : null,
    dueDate: isCheckingOut ? (borrowerDetails?.dueDate || "2024/02/15") : null,
    updatedAt: new Date().toISOString()
  };

  const updatedSeps = seps.map(s => s.id === id ? { ...s, ...changes } : s);
  setLocal(STORAGE_SEPARATORS, updatedSeps);

  await addAuditLog({
    docId: id,
    docTitle: `${target.name} (${target.code})`,
    action: isCheckingOut ? "checkout" : "checkin",
    actionName: isCheckingOut ? "إعارة فاصل كرتوني" : "إعادة فاصل للمجلد",
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
      notifySyncStatus("synced");
    } catch (e) {
      console.error("Firestore toggleSeparatorStatus error:", e);
      notifySyncStatus("synced");
    }
  }

  return updatedSeps;
};

export const deleteSeparator = async (id) => {
  notifySyncStatus("saving");
  const seps = getSeparators();
  const target = seps.find(s => s.id === id);
  const filtered = seps.filter(s => s.id !== id);
  setLocal(STORAGE_SEPARATORS, filtered);

  if (target?.binderId) {
    const binders = getBinders();
    const updatedBinders = binders.map(b => 
      b.id === target.binderId ? { ...b, currentSeparatorsCount: Math.max(0, (b.currentSeparatorsCount || 1) - 1) } : b
    );
    setLocal(STORAGE_BINDERS, updatedBinders);

    if (db) {
      try {
        const bTarget = updatedBinders.find(b => b.id === target.binderId);
        if (bTarget) {
          await setDoc(doc(db, "binders", target.binderId), bTarget, { merge: true });
        }
      } catch (e) {}
    }
  }

  if (db) {
    try {
      const docRef = doc(db, "separators", id);
      await deleteDoc(docRef);
      notifySyncStatus("synced");
    } catch (e) {
      console.error("Firestore deleteSeparator error:", e);
      notifySyncStatus("synced");
    }
  }
  return filtered;
};

// ================= AUDIT LOGS =================
export const getAuditLogs = () => {
  return getLocal(STORAGE_LOGS, initialAuditLogs);
};

export const subscribeToAuditLogs = (onUpdate, onError) => {
  const local = getAuditLogs();
  onUpdate(local);

  if (!isFirestoreAvailable || !db) return () => {};

  try {
    const q = collection(db, "audit_logs");
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const remote = snapshot.docs.map(d => ({
          id: d.id,
          ...d.data()
        }));
        setLocal(STORAGE_LOGS, remote);
        onUpdate(remote);
      }
    }, (error) => {
      console.warn("Audit logs snapshot warning:", error);
      if (onError) onError(error);
    });
    return unsubscribe;
  } catch (e) {
    return () => {};
  }
};

export const addAuditLog = async (logEntry) => {
  const logs = getAuditLogs();
  const entry = {
    ...logEntry,
    id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    createdAt: new Date().toISOString()
  };
  const updated = [entry, ...logs];
  setLocal(STORAGE_LOGS, updated);

  if (db) {
    try {
      const lRef = doc(db, "audit_logs", entry.id);
      await setDoc(lRef, entry);
    } catch (e) {
      console.error("Firestore addAuditLog error:", e);
    }
  }
  return updated;
};

export { app, db };
