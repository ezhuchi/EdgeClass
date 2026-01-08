import { useNavigate } from 'react-router-dom';
import { CheckCircle, Warning, Prohibit, ArrowsClockwise } from '@phosphor-icons/react';
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
      Icon: Prohibit,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      textColor: 'text-red-800',
      iconColor: 'text-red-600'
    };
  } else if (isOnline && pendingCount > 0) {
    status = {
      ...copy.statusIndicators.onlinePending,
      label: copy.statusIndicators.onlinePending.label(pendingCount),
      Icon: Warning,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-300',
      textColor: 'text-amber-800',
      iconColor: 'text-amber-600'
    };
  } else {
    status = {
      ...copy.statusIndicators.onlineSynced,
      Icon: CheckCircle,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      textColor: 'text-green-800',
      iconColor: 'text-green-600'
    };
  }

  if (isSyncing) {
    status = {
      Icon: ArrowsClockwise,
      label: 'Syncing...',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      textColor: 'text-blue-800',
      iconColor: 'text-blue-600'
    };
  }

  const IconComponent = status.Icon;

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
      <IconComponent size={20} weight="bold" className={status.iconColor} />
      <span className="hidden sm:inline">{status.label}</span>
      <span className="sm:hidden">{pendingCount > 0 ? pendingCount : status.icon}</span>
    </button>
  );
};

export default SyncStatusIndicator;
