// Migration script to fix sync queue endpoints
// Run this in browser console after endpoint path changes

import db from '../db/index';

export const clearSyncQueue = async () => {
  console.log('🗑️ Clearing sync queue...');
  try {
    const count = await db.syncQueue.count();
    await db.syncQueue.clear();
    console.log(`✅ Cleared ${count} items from sync queue`);
  } catch (error) {
    console.error('❌ Failed to clear sync queue:', error);
  }
};

export const migrateSyncQueueEndpoints = async () => {
  console.log('🔄 Migrating sync queue endpoints...');
  
  const endpointMapping = {
    '/api/users': '/api/sync/users',
    '/api/quizzes': '/api/sync/quizzes',
    '/api/questions': '/api/sync/questions',
    '/api/attempts': '/api/sync/attempts'
  };
  
  try {
    const allItems = await db.syncQueue.toArray();
    console.log(`Found ${allItems.length} items in sync queue`);
    
    let updatedCount = 0;
    
    for (const item of allItems) {
      const oldEndpoint = item.endpoint;
      const newEndpoint = endpointMapping[oldEndpoint];
      
      if (newEndpoint && newEndpoint !== oldEndpoint) {
        await db.syncQueue.update(item.id, { endpoint: newEndpoint });
        updatedCount++;
        console.log(`✅ Updated ${oldEndpoint} → ${newEndpoint}`);
      }
    }
    
    console.log(`🎉 Migration complete! Updated ${updatedCount} items`);
    
    // Show updated queue
    const updated = await db.syncQueue.toArray();
    console.table(updated.map(item => ({
      id: item.id,
      endpoint: item.endpoint,
      status: item.status,
      retryCount: item.retryCount
    })));
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
  }
};

// Auto-expose in dev mode
if (import.meta.env.DEV) {
  window.migrateSyncQueueEndpoints = migrateSyncQueueEndpoints;
  window.clearSyncQueue = clearSyncQueue;
  console.log('💡 Migration utils available:');
  console.log('  - migrateSyncQueueEndpoints() - Update old endpoint paths');
  console.log('  - clearSyncQueue() - Clear all sync queue items');
}

export default migrateSyncQueueEndpoints;
