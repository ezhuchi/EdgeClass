import { useSyncStatus } from '../sync/useSyncStatus';

const OfflineBadge = () => {
  const { isOnline, isSyncing, syncStats } = useSyncStatus();

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        text: 'Offline',
        badge: 'badge-warning',
        description: 'Working offline - data saved locally'
      };
    }
    if (isSyncing) {
      return {
        text: 'Syncing',
        badge: 'badge-neutral',
        description: 'Syncing data to server...'
      };
    }
    if (syncStats.pending > 0) {
      return {
        text: `${syncStats.pending} Pending`,
        badge: 'badge-neutral',
        description: `${syncStats.pending} items waiting to sync`
      };
    }
    return {
      text: 'Synced',
      badge: 'badge-success',
      description: 'All data synced'
    };
  };

  const config = getStatusConfig();

  return (
    <div 
      className={`badge ${config.badge}`}
      title={config.description}
    >
      {config.text}
    </div>
  );
};

export default OfflineBadge;
