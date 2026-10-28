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

import { 
  enqueueOfflineAction, 
  dequeueOfflineAction, 
  clearOfflineQueue, 
  getOfflineQueue, 
  getIsOnline, 
  subscribeToNetworkStatus, 
  subscribeToOfflineQueue,
  registerOfflineSyncHandler 
} from "./offlineSyncService";

// LocalStorage Keys (Local fallback & instant render)
const STORAGE_CHAPTERS = "archive_chapters_v6";
const STORAGE_BINDERS = "archive_binders_v6";
const STORAGE_SEPARATORS = "archive_separators_v6";
const STORAGE_LOGS = "archive_audit_logs_v6";

// ================= SYNC STATUS & OFFLINE QUEUE MANAGEMENT =================
let currentSyncStatus = (isFirestoreAvailable && getIsOnline()) ? "synced" : "offline"; 
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

/**
 * Safely commit a write to Firestore or automatically queue it in LocalStorage if offline
 */
export const safeFirestoreWrite = async (entity, id, data, isDelete = false, description = "") => {
  const online = getIsOnline() && isFirestoreAvailable && !!db;
  if (!online) {
    enqueueOfflineAction({
      type: isDelete ? 'DELETE' : 'SET',
      entity,
      id,
      payload: isDelete ? null : data,
      description: description || (isDelete ? `حذف من ${entity}` : `حفظ في ${entity}`)
    });
    notifySyncStatus("offline");
    return false;
  }

  try {
    if (isDelete) {
      await deleteDoc(doc(db, entity, id));
    } else {
      await setDoc(doc(db, entity, id), data, { merge: true });
    }
    const q = getOfflineQueue();
    notifySyncStatus(q.length > 0 ? "offline" : "synced");
    return true;
  } catch (err) {
    console.warn(`Firestore write deferred to offline queue for ${entity}/${id}:`, err);
    enqueueOfflineAction({
      type: isDelete ? 'DELETE' : 'SET',
      entity,
      id,
      payload: isDelete ? null : data,
      description: description || (isDelete ? `حذف من ${entity}` : `حفظ في ${entity}`)
    });
    notifySyncStatus("offline");
    return false;
  }
};

/**
 * Flush all pending offline mutations to Firestore when back online
 */
export const flushOfflineQueue = async () => {
  const queue = getOfflineQueue();
  if (queue.length === 0) {
    notifySyncStatus(getIsOnline() ? "synced" : "offline");
    return { success: true, count: 0 };
  }

  if (!isFirestoreAvailable || !db || !getIsOnline()) {
    notifySyncStatus("offline");
    return { success: false, count: 0, reason: "الشبكة أو قاعدة البيانات غير متصلة" };
  }

  notifySyncStatus("saving");
  let syncedCount = 0;
  const remaining = [];

  for (const item of queue) {
    try {
      if (item.type === 'DELETE') {
        await deleteDoc(doc(db, item.entity, item.id));
      } else {
        await setDoc(doc(db, item.entity, item.id), item.payload, { merge: true });
      }
      syncedCount++;
    } catch (e) {
      console.warn("Failed syncing queue item:", item, e);
      remaining.push(item);
    }
  }

  if (remaining.length === 0) {
    clearOfflineQueue();
    notifySyncStatus("synced");
  } else {
    try {
      localStorage.setItem('archive_offline_queue_v1', JSON.stringify(remaining));
    } catch (e) {}
    notifySyncStatus("offline");
  }

  return { success: remaining.length === 0, count: syncedCount, remainingCount: remaining.length };
};

// Register automatic sync handler on network reconnect
registerOfflineSyncHandler(flushOfflineQueue);

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

  await safeFirestoreWrite("chapters", chapterId, item, false, `إضافة موضوع جديد: ${item.name}`);

  return updated;
};

export const updateChapter = async (id, updatedFields) => {
  notifySyncStatus("saving");
  const chapters = getChapters();
  const existing = chapters.find(c => c.id === id);
  if (!existing) return chapters;

  const code = (updatedFields.code || existing.code).toUpperCase().trim();
  const item = {
    ...existing,
    ...updatedFields,
    code,
    updatedAt: new Date().toISOString()
  };

  const updatedChapters = chapters.map(c => c.id === id ? item : c);
  setLocal(STORAGE_CHAPTERS, updatedChapters);

  // If chapter code or name changed, cascade to child binders and child separators
  const nameChanged = updatedFields.name && updatedFields.name !== existing.name;
  const codeChanged = code !== existing.code;
  if (nameChanged || codeChanged) {
    const binders = getBinders();
    const updatedBinders = binders.map(b => {
      if (b.chapterId === id || b.chapterCode === existing.code) {
        return {
          ...b,
          chapterName: item.name,
          chapterCode: item.code
        };
      }
      return b;
    });
    setLocal(STORAGE_BINDERS, updatedBinders);

    const seps = getSeparators();
    const updatedSeps = seps.map(s => {
      if (s.chapterId === id || s.chapterCode === existing.code) {
        return {
          ...s,
          chapterName: item.name,
          chapterCode: item.code
        };
      }
      return s;
    });
    setLocal(STORAGE_SEPARATORS, updatedSeps);

    if (db) {
      for (const b of updatedBinders.filter(b => b.chapterId === id || b.chapterCode === existing.code)) {
        try { await setDoc(doc(db, "binders", b.id), b, { merge: true }); } catch (e) {}
      }
      for (const s of updatedSeps.filter(s => s.chapterId === id || s.chapterCode === existing.code)) {
        try { await setDoc(doc(db, "separators", s.id), s, { merge: true }); } catch (e) {}
      }
    }
  }

  await safeFirestoreWrite("chapters", id, item, false, `تعديل موضوع: ${item.name}`);

  await addAuditLog({
    docId: id,
    docTitle: `موضوع: ${item.name} (${item.code})`,
    action: "update",
    actionName: "تعديل بيانات موضوع",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم تحديث بيانات الموضوع والتصنيف`
  });

  return updatedChapters;
};

export const deleteChapter = async (id) => {
  notifySyncStatus("saving");
  const chapters = getChapters();
  const target = chapters.find(c => c.id === id);
  if (!target) return chapters;

  const filteredChapters = chapters.filter(c => c.id !== id);
  setLocal(STORAGE_CHAPTERS, filteredChapters);

  // Find child binders and child separators to cascade delete
  const binders = getBinders();
  const childBinders = binders.filter(b => b.chapterId === id || b.chapterCode === target.code);
  const remainingBinders = binders.filter(b => b.chapterId !== id && b.chapterCode !== target.code);
  setLocal(STORAGE_BINDERS, remainingBinders);

  const childBinderIds = new Set(childBinders.map(b => b.id));
  const seps = getSeparators();
  const childSeps = seps.filter(s => s.chapterId === id || childBinderIds.has(s.binderId));
  const remainingSeps = seps.filter(s => s.chapterId !== id && !childBinderIds.has(s.binderId));
  setLocal(STORAGE_SEPARATORS, remainingSeps);

  // Safe delete chapter & children
  await safeFirestoreWrite("chapters", id, null, true, `حذف موضوع: ${target.name}`);
  for (const b of childBinders) {
    await safeFirestoreWrite("binders", b.id, null, true, `حذف مجلد تابع: ${b.name}`);
  }
  for (const s of childSeps) {
    await safeFirestoreWrite("separators", s.id, null, true, `حذف فاصل تابع: ${s.name}`);
  }

  await addAuditLog({
    docId: id,
    docTitle: `موضوع: ${target.name} (${target.code})`,
    action: "delete",
    actionName: "حذف موضوع كامل ومجلداته",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم حذف الموضوع (${target.name}) مع عدد ${childBinders.length} مجلدات و ${childSeps.length} فواصل`
  });

  return filteredChapters;
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

  await safeFirestoreWrite("binders", binderId, item, false, `إضافة مجلد: ${item.name}`);
  if (newBinder.chapterId) {
    const cTarget = updatedChapters.find(c => c.id === newBinder.chapterId);
    if (cTarget) {
      await safeFirestoreWrite("chapters", newBinder.chapterId, cTarget, false, `تحديث عدد مجلدات الموضوع`);
    }
  }

  return { updatedBinders: updated, newBinder: item };
};

export const updateBinder = async (id, updatedFields) => {
  notifySyncStatus("saving");
  const binders = getBinders();
  const existing = binders.find(b => b.id === id);
  if (!existing) return binders;

  const item = {
    ...existing,
    ...updatedFields,
    updatedAt: new Date().toISOString()
  };

  const updatedBinders = binders.map(b => b.id === id ? item : b);
  setLocal(STORAGE_BINDERS, updatedBinders);

  // If cabinet, shelf, name, code, or chapter changed, cascade to child separators
  const seps = getSeparators();
  const childSeps = seps.filter(s => s.binderId === id);
  if (childSeps.length > 0) {
    const updatedSeps = seps.map(s => {
      if (s.binderId === id) {
        return {
          ...s,
          binderName: item.name,
          binderCode: item.code,
          cabinet: item.cabinet,
          shelf: item.shelf,
          location: `${item.cabinet} - ${item.shelf}`,
          chapterId: item.chapterId || s.chapterId,
          chapterName: item.chapterName || s.chapterName,
          chapterCode: item.chapterCode || s.chapterCode
        };
      }
      return s;
    });
    setLocal(STORAGE_SEPARATORS, updatedSeps);

    for (const s of updatedSeps.filter(s => s.binderId === id)) {
      await safeFirestoreWrite("separators", s.id, s, false, `تحديث فاصل تابع للمجلد`);
    }
  }

  // If chapter changed, update bindersCount on both old and new chapters
  if (updatedFields.chapterId && updatedFields.chapterId !== existing.chapterId) {
    const chapters = getChapters();
    const updatedChapters = chapters.map(c => {
      if (c.id === existing.chapterId) {
        return { ...c, bindersCount: Math.max(0, (c.bindersCount || 1) - 1) };
      }
      if (c.id === updatedFields.chapterId) {
        return { ...c, bindersCount: (c.bindersCount || 0) + 1 };
      }
      return c;
    });
    setLocal(STORAGE_CHAPTERS, updatedChapters);
    
    const oldC = updatedChapters.find(c => c.id === existing.chapterId);
    const newC = updatedChapters.find(c => c.id === updatedFields.chapterId);
    if (oldC) await safeFirestoreWrite("chapters", oldC.id, oldC, false, `تحديث سعة موضوع قديم`);
    if (newC) await safeFirestoreWrite("chapters", newC.id, newC, false, `تحديث سعة موضوع جديد`);
  }

  await safeFirestoreWrite("binders", id, item, false, `تعديل بيانات مجلد: ${item.name}`);

  await addAuditLog({
    docId: id,
    docTitle: `مجلد: ${item.name} (${item.code})`,
    action: "update",
    actionName: "تعديل بيانات مجلد",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم تعديل بيانات المجلد والموقع الميداني (${item.cabinet} • ${item.shelf})`
  });

  return updatedBinders;
};

export const deleteBinder = async (id) => {
  notifySyncStatus("saving");
  const binders = getBinders();
  const target = binders.find(b => b.id === id);
  if (!target) return binders;

  const filteredBinders = binders.filter(b => b.id !== id);
  setLocal(STORAGE_BINDERS, filteredBinders);

  // Cascade delete all separators inside this binder
  const seps = getSeparators();
  const childSeps = seps.filter(s => s.binderId === id);
  const remainingSeps = seps.filter(s => s.binderId !== id);
  setLocal(STORAGE_SEPARATORS, remainingSeps);

  // Decrement chapter's bindersCount
  if (target.chapterId) {
    const chapters = getChapters();
    const updatedChapters = chapters.map(c => 
      c.id === target.chapterId ? { ...c, bindersCount: Math.max(0, (c.bindersCount || 1) - 1) } : c
    );
    setLocal(STORAGE_CHAPTERS, updatedChapters);
    const cTarget = updatedChapters.find(c => c.id === target.chapterId);
    if (cTarget) await safeFirestoreWrite("chapters", target.chapterId, cTarget, false, `تحديث سعة موضوع`);
  }

  await safeFirestoreWrite("binders", id, null, true, `حذف مجلد: ${target.name}`);
  for (const s of childSeps) {
    await safeFirestoreWrite("separators", s.id, null, true, `حذف فاصل تابع: ${s.name}`);
  }

  await addAuditLog({
    docId: id,
    docTitle: `مجلد: ${target.name} (${target.code})`,
    action: "delete",
    actionName: "حذف مجلد فيزيائي وفواصله",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم حذف المجلد (${target.name}) مع عدد ${childSeps.length} فواصل تابعة له`
  });

  return filteredBinders;
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

  await safeFirestoreWrite("separators", sepId, fullSep, false, `إيداع فاصل كرتوني: ${fullSep.name}`);
  if (fullSep.binderId) {
    const bTarget = updatedBinders.find(b => b.id === fullSep.binderId);
    if (bTarget) {
      await safeFirestoreWrite("binders", fullSep.binderId, bTarget, false, `تحديث سعة المجلد: ${bTarget.name}`);
    }
  }

  return fullSep;
};

export const bulkAddSeparators = async (items) => {
  if (!items || items.length === 0) return { updatedSeparators: getSeparators(), updatedBinders: getBinders(), count: 0 };
  notifySyncStatus("saving");

  const existingSeps = getSeparators();
  const binders = getBinders();
  const binderCounts = {};

  // Track counts per binder
  binders.forEach(b => {
    const countInBinder = existingSeps.filter(s => s.binderId === b.id || s.binderCode === b.code).length;
    binderCounts[b.id] = countInBinder;
  });

  const formattedNewSeps = [];

  for (let i = 0; i < items.length; i++) {
    const raw = items[i];
    const binder = raw.matchedBinder || binders.find(b => b.id === raw.binderId) || binders[0];
    const currentCount = (binderCounts[binder?.id] || 0) + 1;
    binderCounts[binder?.id] = currentCount;

    const formattedNum = currentCount.toString().padStart(2, '0');
    const code = raw.code || `${binder?.code || 'BIN-01'}-S${formattedNum}`;
    const sepId = raw.id || `sep-excel-${Date.now()}-${i}`;

    const newSep = {
      id: sepId,
      code: code,
      name: raw.name || `فاصل ${currentCount}`,
      chapterId: binder?.chapterId || '',
      chapterName: binder?.chapterName || '',
      chapterCode: binder?.chapterCode || '',
      binderId: binder?.id || '',
      binderName: binder?.name || '',
      binderCode: binder?.code || '',
      cabinet: binder?.cabinet || 'الخزانة الرئيسية',
      shelf: binder?.shelf || 'رف 1',
      location: `${binder?.cabinet || 'الخزانة الرئيسية'} - ${binder?.shelf || 'رف 1'}`,
      color: raw.color || '#38bdf8',
      papersCount: parseInt(raw.papersCount) || 20,
      date: raw.date || new Date().toISOString().split('T')[0].replace(/-/g, '/'),
      status: "available",
      client: raw.client || "عام",
      description: raw.description || `فاصل كرتوني مودع من ملف إكسل داخل مجلد ${binder?.name}`,
      qrCode: `ARC-${code}`,
      barcode: `${Math.floor(100000000000 + Math.random() * 900000000000)}`,
      createdAt: new Date().toISOString()
    };

    formattedNewSeps.push(newSep);
  }

  const updatedSeparators = [...formattedNewSeps, ...existingSeps];
  setLocal(STORAGE_SEPARATORS, updatedSeparators);

  // Update affected binders counts
  const updatedBinders = binders.map(b => {
    if (binderCounts[b.id] !== undefined) {
      return { ...b, currentSeparatorsCount: binderCounts[b.id] };
    }
    return b;
  });
  setLocal(STORAGE_BINDERS, updatedBinders);

  // Record bulk deposit in audit logs
  await addAuditLog({
    docId: `bulk-${Date.now()}`,
    docTitle: `إيداع مجمع لعدد ${formattedNewSeps.length} فاصل من ملف إكسل`,
    action: "create",
    actionName: "إيداع مجمع من إكسل (Bulk Import)",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم إيداع عدد ${formattedNewSeps.length} فاصل كرتوني وتوزيعها على المجلدات عبر ملف إكسل`
  });

  // Safe batch write for bulk separators
  for (const sep of formattedNewSeps) {
    await safeFirestoreWrite("separators", sep.id, sep, false, `إيداع فاصل إكسل: ${sep.name}`);
  }
  for (const b of updatedBinders) {
    if (binderCounts[b.id] !== undefined) {
      await safeFirestoreWrite("binders", b.id, b, false, `تحديث سعة المجلد: ${b.name}`);
    }
  }

  return { updatedSeparators, updatedBinders, count: formattedNewSeps.length };
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

  const updatedTarget = { ...target, ...changes };
  const updatedSeps = seps.map(s => s.id === id ? updatedTarget : s);
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

  await safeFirestoreWrite(
    "separators", 
    id, 
    updatedTarget, 
    false, 
    isCheckingOut ? `إعارة فاصل: ${target.name}` : `إرجاع فاصل: ${target.name}`
  );

  return updatedSeps;
};

export const updateSeparator = async (id, updatedFields) => {
  notifySyncStatus("saving");
  const seps = getSeparators();
  const existing = seps.find(s => s.id === id);
  if (!existing) return seps;

  let targetBinder = null;
  if (updatedFields.binderId && updatedFields.binderId !== existing.binderId) {
    const binders = getBinders();
    targetBinder = binders.find(b => b.id === updatedFields.binderId);
  }

  const item = {
    ...existing,
    ...updatedFields,
    ...(targetBinder ? {
      binderId: targetBinder.id,
      binderName: targetBinder.name,
      binderCode: targetBinder.code,
      chapterId: targetBinder.chapterId,
      chapterName: targetBinder.chapterName,
      chapterCode: targetBinder.chapterCode,
      cabinet: targetBinder.cabinet,
      shelf: targetBinder.shelf,
      location: `${targetBinder.cabinet} - ${targetBinder.shelf}`
    } : {}),
    updatedAt: new Date().toISOString()
  };

  const updatedSeps = seps.map(s => s.id === id ? item : s);
  setLocal(STORAGE_SEPARATORS, updatedSeps);

  // If binder was changed, update counts on old and new binders
  if (targetBinder && existing.binderId !== targetBinder.id) {
    const binders = getBinders();
    const updatedBinders = binders.map(b => {
      if (b.id === existing.binderId) {
        return { ...b, currentSeparatorsCount: Math.max(0, (b.currentSeparatorsCount || 1) - 1) };
      }
      if (b.id === targetBinder.id) {
        return { ...b, currentSeparatorsCount: (b.currentSeparatorsCount || 0) + 1 };
      }
      return b;
    });
    setLocal(STORAGE_BINDERS, updatedBinders);

    const oldB = updatedBinders.find(b => b.id === existing.binderId);
    const newB = updatedBinders.find(b => b.id === targetBinder.id);
    if (oldB) await safeFirestoreWrite("binders", oldB.id, oldB, false, `تحديث سعة المجلد القديم`);
    if (newB) await safeFirestoreWrite("binders", newB.id, newB, false, `تحديث سعة المجلد الجديد`);
  }

  await safeFirestoreWrite("separators", id, item, false, `تعديل فاصل كرتوني: ${item.name}`);

  await addAuditLog({
    docId: id,
    docTitle: `${item.name} (${item.code})`,
    action: "update",
    actionName: "تعديل بيانات فاصل كرتوني",
    performedBy: "أحمد",
    borrower: null,
    date: new Date().toISOString().replace('T', ' ').substring(0, 16),
    reason: `تم تحديث بيانات الفاصل (عدد الأوراق: ${item.papersCount}، المجلد: ${item.binderName})`
  });

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

    const bTarget = updatedBinders.find(b => b.id === target.binderId);
    if (bTarget) {
      await safeFirestoreWrite("binders", target.binderId, bTarget, false, `تحديث سعة المجلد`);
    }
  }

  await safeFirestoreWrite("separators", id, null, true, `حذف فاصل كرتوني: ${target?.name}`);
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

  await safeFirestoreWrite("audit_logs", entry.id, entry, false, `حركة تدقيق: ${entry.actionName}`);
  return updated;
};

export { 
  app, 
  db,
  getOfflineQueue,
  getIsOnline,
  subscribeToNetworkStatus,
  subscribeToOfflineQueue
};
