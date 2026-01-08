import SyncStatus from '../components/SyncStatus';

const SyncPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[--text-primary] mb-2">Synchronization</h1>
        <p className="text-[--text-secondary]">
          Monitor and manage data synchronization across devices
        </p>
      </div>

      <SyncStatus />

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-[--bg-tertiary] border border-[--border-color]">
          <h3 className="text-lg font-semibold text-[--text-primary] mb-4">
            How Offline Mode Works
          </h3>
          <ul className="space-y-3 text-sm text-[--text-secondary]">
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>All data stored locally on your device</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Works completely offline</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Automatically syncs when online</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>No data loss, even during long offline periods</span>
            </li>
          </ul>
        </div>

        <div className="card bg-[--bg-tertiary] border border-[--border-color]">
          <h3 className="text-lg font-semibold text-[--text-primary] mb-4">
            Sync Features
          </h3>
          <ul className="space-y-3 text-sm text-[--text-secondary]">
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Intelligent retry with exponential backoff</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Efficient batch processing</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Automatic conflict resolution</span>
            </li>
            <li className="flex gap-3">
              <span className="text-[--accent-color] font-bold">✓</span>
              <span>Real-time status updates</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="mt-8 card bg-[--bg-tertiary] border border-[--border-color]">
        <h3 className="text-lg font-semibold text-[--text-primary] mb-4">
          Tips for Best Results
        </h3>
        <ul className="space-y-3 text-sm text-[--text-secondary]">
          <li>
            <span className="font-semibold text-[--text-primary]">Manual Sync:</span>
            <span className="ml-2">Use the sync button in the header to trigger immediate synchronization</span>
          </li>
          <li>
            <span className="font-semibold text-[--text-primary]">Auto Sync:</span>
            <span className="ml-2">Happens automatically when you regain internet connectivity</span>
          </li>
          <li>
            <span className="font-semibold text-[--text-primary]">Pending Status:</span>
            <span className="ml-2">Shows items waiting to be synchronized</span>
          </li>
          <li>
            <span className="font-semibold text-[--text-primary]">Failed Sync:</span>
            <span className="ml-2">Automatic retries happen with intelligent backoff strategy</span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncPage;
