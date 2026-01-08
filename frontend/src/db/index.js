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
      
      // Doubts (student questions)
      doubts: 'id, studentId, topic, chapter, question, createdAt, syncStatus, updatedAt, deviceId, status',
      
      // Doubt replies (teacher/student responses)
      doubtReplies: 'id, doubtId, userId, message, createdAt, syncStatus, updatedAt, deviceId',
      
      // Sync queue for offline requests
      syncQueue: '++id, endpoint, method, data, timestamp, retryCount, status, deviceId'
    });
  }
}

// Initialize database
export const db = new EdgeClassDB();

console.log('💾 [DATABASE] EdgeClassDB initialized');

// Log database open
db.on('ready', () => {
  console.log('✅ [DATABASE] EdgeClassDB ready');
});

// Log database errors  
db.on('blocked', () => {
  console.warn('⚠️ [DATABASE] EdgeClassDB blocked - close other tabs');
});

// Generate device ID (persists across sessions)
export const getDeviceId = () => {
  let deviceId = localStorage.getItem('ghostclass_device_id');
  if (!deviceId) {
    deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('ghostclass_device_id', deviceId);
    console.log('🆔 [DATABASE] New device ID generated:', deviceId);
  }
  return deviceId;
};

// Get current user from local storage
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('ghostclass_current_user');
  const user = userStr ? JSON.parse(userStr) : null;
  if (user) {
    console.log('👤 [AUTH] Current user:', user.username, `(${user.role})`);
  }
  return user;
};

// Set current user
export const setCurrentUser = (user) => {
  localStorage.setItem('ghostclass_current_user', JSON.stringify(user));
  console.log('✅ [AUTH] User logged in:', user.username, `(${user.role})`);
};

// Clear current user (logout)
export const clearCurrentUser = () => {
  const user = getCurrentUser();
  localStorage.removeItem('ghostclass_current_user');
  console.log('👋 [AUTH] User logged out:', user?.username);
};

export default db;
