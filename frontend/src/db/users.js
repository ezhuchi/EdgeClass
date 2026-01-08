import db, { getDeviceId, setCurrentUser } from './index';

// Offline-capable login
export const loginUser = async (username) => {
  const deviceId = getDeviceId();
  
  // Check if user exists locally
  let user = await db.users
    .where('username')
    .equals(username)
    .first();
  
  if (!user) {
    // Create new user locally
    user = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      username,
      deviceId,
      createdAt: new Date().toISOString(),
      syncStatus: 'pending'
    };
    
    await db.users.add(user);
    
    // Queue for sync
    await queueSync('POST', '/api/users', user);
  }
  
  setCurrentUser(user);
  return user;
};

export const getUsers = async () => {
  return await db.users.toArray();
};

// Queue sync operation
const queueSync = async (method, endpoint, data) => {
  await db.syncQueue.add({
    endpoint,
    method,
    data: JSON.stringify(data),
    timestamp: new Date().toISOString(),
    retryCount: 0,
    status: 'pending',
    deviceId: getDeviceId()
  });
};
