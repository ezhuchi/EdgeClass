import SyncStatus from '../components/SyncStatus';
import { copy } from '../constants/copy';

const SyncPage = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{copy.syncPage.title}</h1>
        <p className="text-gray-600">
          {copy.syncPage.description}
        </p>
      </div>

      <SyncStatus />

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="card bg-blue-50 border-blue-200">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            {copy.syncPage.howItWorks.title}
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>{copy.syncPage.howItWorks.local}</li>
            <li>{copy.syncPage.howItWorks.offline}</li>
            <li>{copy.syncPage.howItWorks.autoSync}</li>
            <li>{copy.syncPage.howItWorks.noLoss}</li>
          </ul>
        </div>

        <div className="card bg-green-50 border-green-200">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            {copy.syncPage.features.title}
          </h3>
          <ul className="space-y-2 text-sm text-green-800">
            <li>{copy.syncPage.features.retry}</li>
            <li>{copy.syncPage.features.batch}</li>
            <li>{copy.syncPage.features.conflict}</li>
            <li>{copy.syncPage.features.realtime}</li>
          </ul>
        </div>
      </div>

      <div className="mt-6 card bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {copy.syncPage.tips.title}
        </h3>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>
            <strong>{copy.syncPage.tips.manual.title}</strong> {copy.syncPage.tips.manual.description}
          </li>
          <li>
            <strong>{copy.syncPage.tips.auto.title}</strong> {copy.syncPage.tips.auto.description}
          </li>
          <li>
            <strong>{copy.syncPage.tips.pending.title}</strong> {copy.syncPage.tips.pending.description}
          </li>
          <li>
            <strong>{copy.syncPage.tips.failed.title}</strong> {copy.syncPage.tips.failed.description}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SyncPage;
