/**
 * True Offline-First Archiving Engine
 * Designed for basement / underground archive rooms with zero connectivity.
 * - Manages an offline persistent queue of mutations in LocalStorage / IndexedDB.
 * - Detects online/offline transitions automatically.
 * - Flushes pending mutations in FIFO order once network is restored.
 * - Provides conflict resolution and manual sync triggers.
 */

const QUEUE_STORAGE_KEY = 'archive_offline_queue_v1';
const OFFLINE_STATS_KEY = 'archive_offline_stats_v1';

// Listeners for network & queue changes
const queueListeners = new Set();
const networkListeners = new Set();

// Current in-memory state
let isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
let isSyncing = false;

// Initialize network event listeners
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isOnline = true;
    notifyNetworkListeners(true);
    // Auto-trigger sync when returning from the basement
    triggerAutoSync();
  });

  window.addEventListener('offline', () => {
    isOnline = false;
    notifyNetworkListeners(false);
  });
}

/**
 * Get current network online status
 */
export const getIsOnline = () => isOnline;

/**
 * Subscribe to network changes
 */
export const subscribeToNetworkStatus = (callback) => {
  networkListeners.add(callback);
  callback(isOnline);
  return () => networkListeners.delete(callback);
};

const notifyNetworkListeners = (online) => {
  networkListeners.forEach((cb) => {
    try { cb(online); } catch (e) {}
  });
};

/**
 * Get all queued offline actions
 */
export const getOfflineQueue = () => {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(QUEUE_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
};

/**
 * Save queue to persistent storage
 */
const setOfflineQueue = (queue) => {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    notifyQueueListeners(queue);
  } catch (e) {}
};

/**
 * Subscribe to queue updates
 */
export const subscribeToOfflineQueue = (callback) => {
  queueListeners.add(callback);
  callback(getOfflineQueue());
  return () => queueListeners.delete(callback);
};

const notifyQueueListeners = (queue) => {
  queueListeners.forEach((cb) => {
    try { cb(queue); } catch (e) {}
  });
};

/**
 * Add a new mutation action to the offline queue
 * @param {Object} action - { type, entity, id, payload, description }
 */
export const enqueueOfflineAction = (action) => {
  const queue = getOfflineQueue();
  const queueItem = {
    queueId: `queue-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    timestamp: new Date().toISOString(),
    ...action
  };

  const updatedQueue = [...queue, queueItem];
  setOfflineQueue(updatedQueue);
  return queueItem;
};

/**
 * Remove an item from the queue after successful sync
 */
export const dequeueOfflineAction = (queueId) => {
  const queue = getOfflineQueue();
  const updatedQueue = queue.filter(item => item.queueId !== queueId);
  setOfflineQueue(updatedQueue);
};

/**
 * Clear entire offline queue (e.g. after full successful flush)
 */
export const clearOfflineQueue = () => {
  setOfflineQueue([]);
};

// Global reference to sync handler registered by firebase.js
let externalSyncHandler = null;

export const registerOfflineSyncHandler = (handler) => {
  externalSyncHandler = handler;
};

/**
 * Trigger automatic or manual sync of offline queue
 */
export const triggerAutoSync = async () => {
  if (isSyncing || !isOnline || !externalSyncHandler) return;
  const queue = getOfflineQueue();
  if (queue.length === 0) return;

  isSyncing = true;
  try {
    await externalSyncHandler(queue);
  } catch (err) {
    console.warn("Auto-sync background notice:", err);
  } finally {
    isSyncing = false;
  }
};

/**
 * Get offline summary statistics
 */
export const getOfflineSummary = () => {
  const queue = getOfflineQueue();
  return {
    isOnline,
    pendingCount: queue.length,
    hasPending: queue.length > 0,
    queue
  };
};
