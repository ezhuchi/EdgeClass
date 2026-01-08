import db, { getDeviceId, getCurrentUser } from './index';

// Submit quiz attempt (works offline)
export const submitAttempt = async (quizId, answers) => {
  const user = getCurrentUser();
  const deviceId = getDeviceId();
  
  // Calculate score
  const quiz = await db.quizzes.get(quizId);
  const questions = await db.questions
    .where('quizId')
    .equals(quizId)
    .toArray();
  
  let score = 0;
  questions.forEach((q, index) => {
    if (answers[index] === q.correctAnswer) {
      score++;
    }
  });
  
  const attempt = {
    id: `attempt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    quizId,
    userId: user?.id || 'anonymous',
    answers: JSON.stringify(answers),
    score,
    totalQuestions: questions.length,
    completedAt: new Date().toISOString(),
    syncStatus: 'pending',
    updatedAt: new Date().toISOString(),
    deviceId
  };
  
  await db.attempts.add(attempt);
  
  // Queue for sync
  await queueSync('POST', '/api/sync/attempts', attempt);
  
  return attempt;
};

export const getAttemptsByQuiz = async (quizId) => {
  return await db.attempts
    .where('quizId')
    .equals(quizId)
    .reverse()
    .sortBy('completedAt');
};

export const getAttemptsByUser = async (userId) => {
  return await db.attempts
    .where('userId')
    .equals(userId)
    .reverse()
    .sortBy('completedAt');
};

export const getAllAttempts = async () => {
  return await db.attempts
    .reverse()
    .sortBy('completedAt');
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
