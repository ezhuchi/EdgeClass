import { useSyncStatus } from '../sync/useSyncStatus';

const OfflineBadge = () => {
  const { isOnline, isSyncing, syncStats } = useSyncStatus();

  const getStatusConfig = () => {
    if (!isOnline) {
      return {
        color: 'bg-red-500',
        text: '🔴 Offline',
        description: 'Working offline - data saved locally'
      };
    }
    if (isSyncing) {
      return {
        color: 'bg-yellow-500',
        text: '🟡 Syncing',
        description: 'Syncing data to server...'
      };
    }
    if (syncStats.pending > 0) {
      return {
        color: 'bg-blue-500',
        text: `🟡 ${syncStats.pending} Pending`,
        description: `${syncStats.pending} items waiting to sync`
      };
    }
    return {
      color: 'bg-green-500',
      text: '🟢 Synced',
      description: 'All data synced'
    };
  };

  const config = getStatusConfig();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white shadow-sm border border-gray-200">
      <div className={`w-2 h-2 rounded-full ${config.color} ${isSyncing ? 'animate-pulse' : ''}`} />
      <span className="text-sm font-medium text-gray-700">{config.text}</span>
      {syncStats.pending > 0 && (
        <span className="text-xs text-gray-500 ml-1">
          ({syncStats.pending})
        </span>
      )}
    </div>
  );
};

export default OfflineBadge;
