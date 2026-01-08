import db, { getDeviceId, getCurrentUser } from './index';

// Quiz Operations - All Offline First

export const createQuiz = async (quizData) => {
  const user = getCurrentUser();
  const deviceId = getDeviceId();
  
  const quiz = {
    id: `quiz_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: quizData.title,
    description: quizData.description || '',
    createdBy: user?.id || 'anonymous',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
    deviceId
  };
  
  await db.quizzes.add(quiz);
  
  // Add questions
  let questions = [];
  if (quizData.questions && quizData.questions.length > 0) {
    questions = quizData.questions.map((q, index) => ({
      id: `question_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
      quizId: quiz.id,
      question: q.question,
      options: JSON.stringify(q.options),
      correctAnswer: q.correctAnswer,
      order: index
    }));
    
    await db.questions.bulkAdd(questions);
  }
  
  // Queue quiz for sync
  await queueSync('POST', '/api/sync/quizzes', quiz);
  
  // Queue questions for sync (critical fix)
  if (questions.length > 0) {
    await queueSync('POST', '/api/sync/questions', { 
      questions,
      deviceId: quiz.deviceId 
    });
  }
  
  return quiz;
};

export const getQuizzes = async () => {
  return await db.quizzes.toArray();
};

export const getQuizById = async (id) => {
  const quiz = await db.quizzes.get(id);
  if (!quiz) return null;
  
  const questions = await db.questions
    .where('quizId')
    .equals(id)
    .sortBy('order');
  
  return {
    ...quiz,
    questions: questions.map(q => ({
      ...q,
      options: JSON.parse(q.options)
    }))
  };
};

export const deleteQuiz = async (id) => {
  await db.quizzes.delete(id);
  await db.questions.where('quizId').equals(id).delete();
  await queueSync('DELETE', `/api/sync/quizzes/${id}`, { id });
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
