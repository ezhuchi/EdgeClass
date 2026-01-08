import db, { getDeviceId, getCurrentUser } from './index';

// Create a new doubt
export const createDoubt = async (doubtData) => {
  const user = getCurrentUser();
  const deviceId = getDeviceId();
  
  if (!user || user.role !== 'student') {
    throw new Error('Only students can create doubts');
  }
  
  const doubt = {
    id: `doubt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    studentId: user.id,
    topic: doubtData.topic || '',
    chapter: doubtData.chapter || '',
    question: doubtData.question,
    attachments: doubtData.attachments || [], // Array of base64 encoded files
    status: 'open', // open, answered, resolved
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
    deviceId
  };
  
  await db.doubts.add(doubt);
  await queueSync('POST', '/api/sync/doubts', { doubts: [doubt] });
  
  return doubt;
};

// Add reply to a doubt
export const addDoubtReply = async (doubtId, replyData) => {
  const user = getCurrentUser();
  const deviceId = getDeviceId();
  
  if (!user) {
    throw new Error('User must be logged in to reply');
  }
  
  const reply = {
    id: `reply_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    doubtId,
    userId: user.id,
    message: replyData.message,
    attachments: replyData.attachments || [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
    deviceId
  };
  
  await db.doubtReplies.add(reply);
  
  // Update doubt status and timestamp
  const newStatus = user.role === 'teacher' ? 'answered' : 'open';
  const updatedAt = new Date().toISOString();
  await db.doubts.update(doubtId, {
    updatedAt,
    status: newStatus
  });
  
  await queueSync('POST', '/api/sync/doubt-replies', { replies: [reply] });
  
  return reply;
};

// Get all doubts
export const getAllDoubts = async () => {
  return await db.doubts.reverse().sortBy('updatedAt');
};

// Get doubts by student
export const getDoubtsByStudent = async (studentId) => {
  return await db.doubts
    .where('studentId')
    .equals(studentId)
    .reverse()
    .sortBy('updatedAt');
};

// Get doubt by ID
export const getDoubtById = async (doubtId) => {
  return await db.doubts.get(doubtId);
};

// Get replies for a doubt
export const getDoubtReplies = async (doubtId) => {
  return await db.doubtReplies
    .where('doubtId')
    .equals(doubtId)
    .sortBy('createdAt');
};

// Update doubt status
export const updateDoubtStatus = async (doubtId, status) => {
  const updatedAt = new Date().toISOString();
  await db.doubts.update(doubtId, {
    status,
    updatedAt
  });
  await queueSync('POST', '/api/sync/doubt-status', { doubtId, status, updatedAt });
};

// Delete doubt
export const deleteDoubt = async (doubtId) => {
  await db.doubts.delete(doubtId);
  await db.doubtReplies.where('doubtId').equals(doubtId).delete();
  await queueSync('DELETE', `/api/sync/doubts/${doubtId}`, { id: doubtId });
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
