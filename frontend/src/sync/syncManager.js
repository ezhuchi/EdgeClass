import db from '../db';
import { networkDetector } from '../utils/networkDetector';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const MAX_RETRY_COUNT = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds

// Sync manager class
class SyncManager {
  constructor() {
    this.isSyncing = false;
    this.listeners = [];
    this.retryScheduler = null;
    this.startRetryScheduler();
  }

  // Subscribe to sync events
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Start retry scheduler (critical fix: execute scheduled retries)
  startRetryScheduler() {
    // Check for items needing retry every 10 seconds
    this.retryScheduler = setInterval(async () => {
      if (this.isSyncing || !navigator.onLine) return;
      
      const now = Date.now();
      const itemsToRetry = await db.syncQueue
        .where('status')
        .equals('pending')
        .filter(item => {
          if (!item.nextRetryAt) return false;
          return new Date(item.nextRetryAt).getTime() <= now;
        })
        .toArray();
      
      if (itemsToRetry.length > 0) {
        console.log(`🔄 Retry scheduler: ${itemsToRetry.length} items ready for retry`);
        this.syncAll();
      }
    }, 10000); // Check every 10 seconds
  }

  // Stop retry scheduler
  stopRetryScheduler() {
    if (this.retryScheduler) {
      clearInterval(this.retryScheduler);
      this.retryScheduler = null;
    }
  }

  // Notify all listeners
  notify(event) {
    this.listeners.forEach(listener => listener(event));
  }

  // Check if online
  isOnline() {
    return navigator.onLine;
  }

  // Get pending sync items
  async getPendingSyncItems() {
    return await db.syncQueue
      .where('status')
      .equals('pending')
      .or('status')
      .equals('failed')
      .toArray();
  }

  // Sync single item with exponential backoff
  async syncItem(item) {
    const { endpoint, method, data, retryCount } = item;
    
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Mark as synced
      await db.syncQueue.update(item.id, {
        status: 'synced',
        syncedAt: new Date().toISOString()
      });

      // Update original record's sync status
      await this.updateRecordSyncStatus(endpoint, JSON.parse(data));

      this.notify({
        type: 'item_synced',
        item,
        success: true
      });

      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      
      const newRetryCount = retryCount + 1;
      
      if (newRetryCount >= MAX_RETRY_COUNT) {
        // Max retries reached
        await db.syncQueue.update(item.id, {
          status: 'failed',
          retryCount: newRetryCount,
          lastError: error.message
        });

        this.notify({
          type: 'item_failed',
          item,
          error: error.message
        });

        return false;
      }

      // Schedule retry with exponential backoff
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, newRetryCount);
      
      await db.syncQueue.update(item.id, {
        status: 'pending',
        retryCount: newRetryCount,
        nextRetryAt: new Date(Date.now() + delay).toISOString()
      });

      this.notify({
        type: 'item_retry_scheduled',
        item,
        retryCount: newRetryCount,
        delay
      });

      return false;
    }
  }

  // Update original record's sync status
  async updateRecordSyncStatus(endpoint, data) {
    try {
      if (endpoint.includes('/quizzes')) {
        await db.quizzes
          .where('id')
          .equals(data.id)
          .modify({ syncStatus: 'synced' });
      } else if (endpoint.includes('/attempts')) {
        await db.attempts
          .where('id')
          .equals(data.id)
          .modify({ syncStatus: 'synced' });
      } else if (endpoint.includes('/users')) {
        await db.users
          .where('id')
          .equals(data.id)
          .modify({ syncStatus: 'synced' });
      }
    } catch (error) {
      console.error('Error updating record sync status:', error);
    }
  }

  // Sync all pending items (burst sync)
  async syncAll() {
    if (this.isSyncing) {
      console.log('Sync already in progress');
      return;
    }

    if (!this.isOnline()) {
      console.log('Device is offline, skipping sync');
      this.notify({ type: 'sync_skipped', reason: 'offline' });
      return;
    }

    this.isSyncing = true;
    this.notify({ type: 'sync_started' });

    try {
      const pendingItems = await this.getPendingSyncItems();
      
      if (pendingItems.length === 0) {
        this.notify({ type: 'sync_completed', itemsCount: 0 });
        return;
      }

      this.notify({ 
        type: 'sync_progress', 
        total: pendingItems.length,
        current: 0
      });

      let successCount = 0;
      let failCount = 0;

      // Use adaptive batch size based on connection
      const networkInfo = networkDetector.getNetworkInfo();
      const BATCH_SIZE = networkInfo.batchSize; // 2 for 2G, 5 for 4G
      const BATCH_DELAY = networkInfo.isSlow ? 2000 : 1000; // Longer delay for slow connections
      
      console.log(`🌐 Network: ${networkInfo.effectiveType}, Batch: ${BATCH_SIZE}, Delay: ${BATCH_DELAY}ms`);
      
      for (let i = 0; i < pendingItems.length; i += BATCH_SIZE) {
        const batch = pendingItems.slice(i, i + BATCH_SIZE);
        
        const results = await Promise.all(
          batch.map(item => this.syncItem(item))
        );

        successCount += results.filter(r => r).length;
        failCount += results.filter(r => !r).length;

        this.notify({
          type: 'sync_progress',
          total: pendingItems.length,
          current: Math.min(i + BATCH_SIZE, pendingItems.length),
          successCount,
          failCount
        });

        // Adaptive delay between batches
        if (i + BATCH_SIZE < pendingItems.length) {
          await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
        }
      }

      this.notify({
        type: 'sync_completed',
        itemsCount: pendingItems.length,
        successCount,
        failCount
      });

    } catch (error) {
      console.error('Sync error:', error);
      this.notify({
        type: 'sync_error',
        error: error.message
      });
    } finally {
      this.isSyncing = false;
    }
  }

  // Get sync statistics
  async getStats() {
    const pending = await db.syncQueue
      .where('status')
      .equals('pending')
      .count();

    const synced = await db.syncQueue
      .where('status')
      .equals('synced')
      .count();

    const failed = await db.syncQueue
      .where('status')
      .equals('failed')
      .count();

    return { pending, synced, failed, total: pending + synced + failed };
  }

  // Clear synced items (cleanup)
  async clearSyncedItems() {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    await db.syncQueue
      .where('status')
      .equals('synced')
      .and(item => new Date(item.syncedAt) < sevenDaysAgo)
      .delete();
  }
}

// Singleton instance
export const syncManager = new SyncManager();

// Auto-sync on network reconnection
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('Network reconnected, starting auto-sync...');
    syncManager.syncAll();
  });

  window.addEventListener('offline', () => {
    console.log('Network disconnected');
  });

  // Adaptive periodic sync based on connection type
  const getSyncInterval = () => {
    const networkInfo = networkDetector.getNetworkInfo();
    return networkInfo.syncDelay || (5 * 60 * 1000); // Default 5 minutes
  };

  // Initial sync
  let syncIntervalId = setInterval(() => {
    if (navigator.onLine) {
      syncManager.syncAll();
    }
  }, getSyncInterval());
  
  // Update sync interval when network changes
  networkDetector.subscribe((networkInfo) => {
    clearInterval(syncIntervalId);
    const newInterval = networkInfo.syncDelay || (5 * 60 * 1000);
    console.log(`🔄 Updated sync interval: ${newInterval / 1000}s (${networkInfo.effectiveType})`);
    syncIntervalId = setInterval(() => {
      if (navigator.onLine) {
        syncManager.syncAll();
      }
    }, newInterval);
  });
}

export default syncManager;
