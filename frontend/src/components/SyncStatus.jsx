import { useState, useEffect } from 'react';
import { useSyncStatus } from '../sync/useSyncStatus';

const SyncStatus = () => {
  const { isOnline, isSyncing, syncStats, lastSyncEvent, triggerSync } = useSyncStatus();
  const [logs, setLogs] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    if (lastSyncEvent) {
      const timestamp = new Date().toLocaleTimeString();
      let message = '';
      let type = lastSyncEvent.type;

      switch (lastSyncEvent.type) {
        case 'sync_started':
          message = 'Sync started';
          break;
        case 'sync_completed':
          message = `Completed (${lastSyncEvent.successCount || 0} items)`;
          break;
        case 'item_synced':
          message = 'Item synced';
          break;
        case 'item_failed':
          message = `Failed: ${lastSyncEvent.error}`;
          break;
        case 'sync_error':
          message = `Error: ${lastSyncEvent.error}`;
          break;
        case 'sync_progress':
          message = `Progress: ${lastSyncEvent.current}/${lastSyncEvent.total}`;
          break;
        default:
          message = lastSyncEvent.type;
      }

      setLogs(prev => [{
        id: Date.now(),
        timestamp,
        message,
        type
      }, ...prev].slice(0, 20));
    }
  }, [lastSyncEvent]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-[--text-primary]">Sync Status</h3>
          <p className="text-sm text-[--text-secondary]">Real-time synchronization activity</p>
        </div>
        <button
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? 'Syncing...' : 'Sync Now'}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-[--accent-color]">{syncStats.pending}</div>
          <div className="text-xs text-[--text-tertiary] mt-1">Pending</div>
        </div>
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-[--success-color]">{syncStats.synced}</div>
          <div className="text-xs text-[--text-tertiary] mt-1">Synced</div>
        </div>
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-[--danger-color]">{syncStats.failed}</div>
          <div className="text-xs text-[--text-tertiary] mt-1">Failed</div>
        </div>
        <div className="card-sm text-center">
          <div className="text-2xl font-bold text-[--text-primary]">{syncStats.total}</div>
          <div className="text-xs text-[--text-tertiary] mt-1">Total</div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="mb-6">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center justify-between w-full p-3 bg-[--bg-tertiary] rounded-lg hover:bg-[--border-color] transition-colors"
        >
          <h4 className="text-sm font-semibold text-[--text-primary]">Activity Log</h4>
          <span className="text-[--text-secondary]">{isExpanded ? '▼' : '▶'}</span>
        </button>

        {isExpanded && (
          <div className="mt-3 space-y-1 max-h-64 overflow-y-auto bg-[--bg-tertiary] rounded-lg p-3 border border-[--border-color]">
            {logs.length === 0 ? (
              <p className="text-sm text-[--text-tertiary] text-center py-4">
                No sync activity yet
              </p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-xs font-mono text-[--text-secondary] py-1 border-b border-[--border-color] last:border-0">
                  <span className="text-[--text-tertiary]">[{log.timestamp}]</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Network Status */}
      <div className="p-3 bg-[--bg-tertiary] rounded-lg border border-[--border-color]">
        <div className="flex items-center justify-between">
          <span className="text-sm text-[--text-secondary]">Connection:</span>
          <span className={`text-sm font-medium ${
            isOnline 
              ? 'text-[--success-color]' 
              : 'text-[--warning-color]'
          }`}>
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;
