import SyncStatus from '../components/SyncStatus';

const SyncPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Synchronization Status</h1>
        <p className="text-gray-600">
          Monitor your offline data and sync progress
        </p>
      </div>

      <SyncStatus />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            📱 How Offline Mode Works
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>All data is saved locally on your device</li>
            <li>Works 100% without internet connection</li>
            <li>Auto-syncs when connection is detected</li>
            <li>No data loss even if offline for days</li>
          </ul>
        </div>

        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            Sync Features
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>Exponential backoff retry strategy</li>
            <li>Batch processing for efficiency</li>
            <li>Conflict resolution (latest wins)</li>
            <li>Real-time sync status updates</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          💡 Pro Tips
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>Manual Sync:</strong> Use the "Sync Now" button to trigger immediate sync
          </li>
          <li>
            <strong>Auto Sync:</strong> Happens automatically when you reconnect to the internet
          </li>
          <li>
            <strong>Pending Items:</strong> Yellow badge shows items waiting to sync
          </li>
          <li>
            <strong>Failed Items:</strong> Will retry automatically with exponential backoff
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncPage;
