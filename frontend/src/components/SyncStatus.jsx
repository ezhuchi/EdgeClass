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

      switch (lastSyncEvent.type) {
        case 'sync_started':
          message = '🚀 Sync started';
          break;
        case 'sync_completed':
          message = `✅ Sync completed (${lastSyncEvent.successCount || 0} items)`;
          break;
        case 'item_synced':
          message = '✅ Item synced successfully';
          break;
        case 'item_failed':
          message = `❌ Sync failed: ${lastSyncEvent.error}`;
          break;
        case 'sync_error':
          message = `❌ Sync error: ${lastSyncEvent.error}`;
          break;
        case 'sync_progress':
          message = `⏳ Syncing: ${lastSyncEvent.current}/${lastSyncEvent.total}`;
          break;
        default:
          message = `${lastSyncEvent.type}`;
      }

      setLogs(prev => [{
        id: Date.now(),
        timestamp,
        message,
        type: lastSyncEvent.type
      }, ...prev].slice(0, 20)); // Keep last 20 logs
    }
  }, [lastSyncEvent]);

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Sync Status</h3>
          <p className="text-sm text-gray-600">Real-time synchronization activity</p>
        </div>
        <button
          onClick={triggerSync}
          disabled={!isOnline || isSyncing}
          className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSyncing ? (
            <>
              <span className="animate-spin mr-2">⟳</span>
              Syncing...
            </>
          ) : (
            <>🔄 Sync Now</>
          )}
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-blue-600">{syncStats.pending}</div>
          <div className="text-xs text-blue-800">Pending</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-green-600">{syncStats.synced}</div>
          <div className="text-xs text-green-800">Synced</div>
        </div>
        <div className="bg-red-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-red-600">{syncStats.failed}</div>
          <div className="text-xs text-red-800">Failed</div>
        </div>
        <div className="bg-gray-50 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold text-gray-600">{syncStats.total}</div>
          <div className="text-xs text-gray-800">Total</div>
        </div>
      </div>

      {/* Activity Log */}
      <div>
        <div 
          className="flex items-center justify-between cursor-pointer mb-2"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <h4 className="text-sm font-semibold text-gray-700">Activity Log</h4>
          <span className="text-gray-500">{isExpanded ? '▼' : '▶'}</span>
        </div>

        {isExpanded && (
          <div className="space-y-1 max-h-64 overflow-y-auto bg-gray-50 rounded-lg p-3">
            {logs.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No sync activity yet
              </p>
            ) : (
              logs.map(log => (
                <div key={log.id} className="text-xs font-mono text-gray-700 py-1 border-b border-gray-200 last:border-0">
                  <span className="text-gray-500">[{log.timestamp}]</span>{' '}
                  <span>{log.message}</span>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Network Status */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Network Status:</span>
          <span className={`font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
            {isOnline ? '✅ Online' : '❌ Offline'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SyncStatus;
