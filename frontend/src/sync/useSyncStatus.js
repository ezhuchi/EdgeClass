import { useState, useEffect } from 'react';
import syncManager from './syncManager';

// Hook to use sync status in components
export const useSyncStatus = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStats, setSyncStats] = useState({
    pending: 0,
    synced: 0,
    failed: 0,
    total: 0
  });
  const [lastSyncEvent, setLastSyncEvent] = useState(null);

  useEffect(() => {
    // Update online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to sync events
    const unsubscribe = syncManager.subscribe((event) => {
      setLastSyncEvent(event);

      if (event.type === 'sync_started') {
        setIsSyncing(true);
      } else if (event.type === 'sync_completed' || event.type === 'sync_error') {
        setIsSyncing(false);
      }
    });

    // Load initial stats
    syncManager.getStats().then(setSyncStats);

    // Update stats periodically
    const interval = setInterval(() => {
      syncManager.getStats().then(setSyncStats);
    }, 5000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribe();
      clearInterval(interval);
    };
  }, []);

  const triggerSync = () => {
    syncManager.syncAll();
  };

  return {
    isOnline,
    isSyncing,
    syncStats,
    lastSyncEvent,
    triggerSync
  };
};

export default useSyncStatus;
