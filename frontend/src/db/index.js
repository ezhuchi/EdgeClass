import Dexie from 'dexie';

// Edge Class Database - Primary Source of Truth
export class EdgeClassDB extends Dexie {
  constructor() {
    super('EdgeClassDB');
    
    this.version(1).stores({
      // User authentication (offline-capable)
      users: 'id, deviceId, username, role, createdAt',
      
      // Quizzes stored locally
      quizzes: 'id, title, createdBy, createdAt, syncStatus, updatedAt',
      
      // Quiz questions
      questions: 'id, quizId, question, options, correctAnswer, order',
      
      // Student attempts (work offline)
      attempts: 'id, quizId, userId, answers, score, completedAt, syncStatus, updatedAt, deviceId',
      
      // Sync queue for offline requests
      syncQueue: '++id, endpoint, method, data, timestamp, retryCount, status, deviceId'
    });
  }
}

// Initialize database
export const db = new GhostClassDB();

// Generate device ID (persists across sessions)
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('ghostclass_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ghostclass_device_id', deviceId);
  }
  return deviceId;
};

// Get current user from local storage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('ghostclass_current_user');
  return userStr ? JSON.parse(userStr) : null;
};

// Set current user
export const setCurrentUser = (user) => {
  localStorage.setItem('ghostclass_current_user', JSON.stringify(user));
};

// Clear current user (logout)
export const clearCurrentUser = () => {
  localStorage.removeItem('ghostclass_current_user');
};

export default db;
