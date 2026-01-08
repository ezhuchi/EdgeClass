import { useNavigate } from 'react-router-dom';
import { useSyncStatus } from '../sync/useSyncStatus';
import { copy } from '../constants/copy';

const SyncStatusIndicator = () => {
  const navigate = useNavigate();
  const { syncStats, isSyncing } = useSyncStatus();
  const isOnline = navigator.onLine;
  const pendingCount = syncStats?.pending || 0;

  // Determine status
  let status;
  if (!isOnline && pendingCount > 0) {
    status = {
      ...copy.statusIndicators.offlineQueued,
      label: copy.statusIndicators.offlineQueued.label(pendingCount),
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800'
    };
  } else if (isOnline && pendingCount > 0) {
    status = {
      ...copy.statusIndicators.onlinePending,
      label: copy.statusIndicators.onlinePending.label(pendingCount),
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-800'
    };
  } else {
    status = {
      ...copy.statusIndicators.onlineSynced,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800'
    };
  }

  if (isSyncing) {
    status = {
      icon: '🔄',
      label: 'Syncing...',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800'
    };
  }

  return (
    <button
      onClick={() => navigate('/sync')}
      className={`
        flex items-center gap-2 px-3 py-2 rounded-lg border-2 
        ${status.bgColor} ${status.borderColor} ${status.textColor}
        hover:opacity-80 transition-all text-sm font-medium
        ${isSyncing ? 'animate-pulse' : ''}
      `}
      title="Click to view sync details"
    >
      <span className="text-base">{status.icon}</span>
      <span className="hidden sm:inline">{status.label}</span>
      <span className="sm:hidden">{pendingCount > 0 ? pendingCount : status.icon}</span>
    </button>
  );
};

export default SyncStatusIndicator;
