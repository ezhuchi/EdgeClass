import express from 'express';
import { getDB } from '../db/init.js';
import { authenticateToken, authorizeRole, generateToken } from '../middleware/auth.js';
import { 
  validateBody, 
  userSchema, 
  quizSchema, 
  questionsBatchSchema, 
  attemptSchema 
} from '../validation/schemas.js';

const router = express.Router();

// Login endpoint - no auth required, returns JWT token
router.post('/login', validateBody(userSchema), (req, res) => {
  try {
    const { id, username, role, deviceId, createdAt } = req.validatedBody;
    const db = getDB();

    // Create or update user
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, username, role, deviceId, createdAt, syncedAt)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, username, role, deviceId, createdAt);

    // Generate JWT token
    const token = generateToken(id, username, role, deviceId);

    // Log sync
    logSync(db, deviceId, 'user', id, 'login');

    res.json({ 
      success: true, 
      token,
      user: { id, username, role, deviceId },
      message: 'Login successful' 
    });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Login failed' 
    });
  }
});

// Sync users - requires authentication
router.post('/users', authenticateToken, validateBody(userSchema), (req, res) => {
  try {
    const { id, username, role, deviceId, createdAt } = req.validatedBody;
    const db = getDB();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, username, role, deviceId, createdAt, syncedAt)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, username, role, deviceId, createdAt);

    // Log sync
    logSync(db, deviceId, 'user', id, 'sync');

    res.json({ 
      success: true, 
      id,
      message: 'User synced successfully' 
    });
  } catch (error) {
    console.error('Error syncing user:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync user' 
    });
  }
});

// Sync quizzes - requires authentication, only teachers can create
router.post('/quizzes', authenticateToken, authorizeRole('teacher'), validateBody(quizSchema), (req, res) => {
  try {
    const { id, title, description, createdBy, createdAt, updatedAt, deviceId } = req.validatedBody;
    const db = getDB();

    // Verify the authenticated user is creating their own quiz
    if (req.user.userId !== createdBy) {
      return res.status(403).json({
        success: false,
        error: 'You can only create quizzes for yourself'
      });
    }

    // Check for conflicts (latest timestamp wins)
    const existing = db.prepare('SELECT updatedAt FROM quizzes WHERE id = ?').get(id);
    
    if (existing) {
      const existingTime = new Date(existing.updatedAt).getTime();
      const incomingTime = new Date(updatedAt).getTime();
      
      if (existingTime > incomingTime) {
        // Server has newer data, reject incoming
        return res.status(409).json({
          success: false,
          conflict: true,
          message: 'Server has newer version',
          serverUpdatedAt: existing.updatedAt,
          clientUpdatedAt: updatedAt
        });
      }
    }

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO quizzes (id, title, description, createdBy, createdAt, updatedAt, deviceId, syncedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, title, description || '', createdBy, createdAt, updatedAt, deviceId);

    // Log sync
    logSync(db, deviceId, 'quiz', id, 'sync');

    res.json({ 
      success: true, 
      id,
      message: 'Quiz synced successfully' 
    });
  } catch (error) {
    console.error('Error syncing quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync quiz' 
    });
  }
});

// Sync questions - requires authentication, only teachers
router.post('/questions', authenticateToken, authorizeRole('teacher'), validateBody(questionsBatchSchema), (req, res) => {
  try {
    const { questions, deviceId } = req.validatedBody;
    const db = getDB();

    if (!questions || !Array.isArray(questions)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Questions array is required' 
      });
    }

    // Batch insert questions
    const stmt = db.prepare(`
      INSERT OR REPLACE INTO questions (id, quizId, question, options, correctAnswer, \`order\`)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const transaction = db.transaction(() => {
      questions.forEach(q => {
        stmt.run(q.id, q.quizId, q.question, q.options, q.correctAnswer, q.order);
        logSync(db, deviceId, 'question', q.id, 'sync');
      });
    });

    transaction();

    res.json({ 
      success: true, 
      count: questions.length,
      message: `${questions.length} questions synced successfully` 
    });
  } catch (error) {
    console.error('Error syncing questions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync questions' 
    });
  }
});

// Sync attempts - requires authentication
router.post('/attempts', authenticateToken, validateBody(attemptSchema), (req, res) => {
  try {
    const { id, quizId, userId, answers, totalQuestions, completedAt, deviceId } = req.validatedBody;
    const db = getDB();

    // Verify the authenticated user is submitting their own attempt
    if (req.user.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: 'You can only submit your own quiz attempts'
      });
    }

    // SECURITY: Calculate score server-side to prevent tampering
    const questions = db.prepare('SELECT correctAnswer FROM questions WHERE quizId = ? ORDER BY `order` ASC').all(quizId);
    
    if (questions.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Quiz not found or has no questions'
      });
    }

    const answersArray = JSON.parse(answers);
    let score = 0;
    
    questions.forEach((q, index) => {
      if (answersArray[index] === q.correctAnswer) {
        score++;
      }
    });

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO attempts (id, quizId, userId, answers, score, totalQuestions, completedAt, deviceId, syncedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, quizId, userId, answers, score, totalQuestions, completedAt, deviceId);

    // Log sync
    logSync(db, deviceId, 'attempt', id, 'sync');

    res.json({ 
      success: true, 
      id,
      message: 'Attempt synced successfully' 
    });
  } catch (error) {
    console.error('Error syncing attempt:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to sync attempt' 
    });
  }
});

// Delete quiz - requires authentication, only teachers or quiz creator
router.delete('/quizzes/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Check if quiz exists and get creator
    const quiz = db.prepare('SELECT createdBy FROM quizzes WHERE id = ?').get(id);
    
    if (!quiz) {
      return res.status(404).json({
        success: false,
        error: 'Quiz not found'
      });
    }

    // Only the quiz creator or teachers can delete
    if (req.user.role !== 'teacher' && req.user.userId !== quiz.createdBy) {
      return res.status(403).json({
        success: false,
        error: 'You can only delete your own quizzes'
      });
    }

    const stmt = db.prepare('DELETE FROM quizzes WHERE id = ?');
    const result = stmt.run(id);

    res.json({ 
      success: true, 
      deletedCount: result.changes,
      message: 'Quiz deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting quiz:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to delete quiz' 
    });
  }
});

// Get all quizzes - requires authentication
router.get('/quizzes', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY createdAt DESC').all();
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch quizzes' });
  }
});

// Get all attempts - requires authentication
router.get('/attempts', authenticateToken, (req, res) => {
  try {
    const db = getDB();
    
    // Students can only see their own attempts, teachers see all
    let attempts;
    if (req.user.role === 'teacher') {
      attempts = db.prepare('SELECT * FROM attempts ORDER BY completedAt DESC').all();
    } else {
      attempts = db.prepare('SELECT * FROM attempts WHERE userId = ? ORDER BY completedAt DESC').all(req.user.userId);
    }
    
    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch attempts' });
  }
});

// Helper function to log sync operations
function logSync(db, deviceId, recordType, recordId, action) {
  const stmt = db.prepare(`
    INSERT INTO sync_logs (deviceId, recordType, recordId, action)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(deviceId, recordType, recordId, action);
}

export default router;
