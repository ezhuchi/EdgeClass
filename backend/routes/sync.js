import express from 'express';
import { getDB } from '../db/init.js';

const router = express.Router();

// Sync users
router.post('/users', (req, res) => {
  try {
    const { id, username, deviceId, createdAt } = req.body;
    const db = getDB();

    const stmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, username, deviceId, createdAt, syncedAt)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    stmt.run(id, username, deviceId, createdAt);

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
      error: error.message 
    });
  }
});

// Sync quizzes
router.post('/quizzes', (req, res) => {
  try {
    const { id, title, description, createdBy, createdAt, updatedAt, deviceId } = req.body;
    const db = getDB();

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
      error: error.message 
    });
  }
});

// Sync attempts
router.post('/attempts', (req, res) => {
  try {
    const { id, quizId, userId, answers, score, totalQuestions, completedAt, deviceId } = req.body;
    const db = getDB();

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
      error: error.message 
    });
  }
});

// Delete quiz
router.delete('/quizzes/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

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
      error: error.message 
    });
  }
});

// Get all quizzes (for debugging)
router.get('/quizzes', (req, res) => {
  try {
    const db = getDB();
    const quizzes = db.prepare('SELECT * FROM quizzes ORDER BY createdAt DESC').all();
    res.json({ success: true, quizzes });
  } catch (error) {
    console.error('Error fetching quizzes:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Get all attempts (for debugging)
router.get('/attempts', (req, res) => {
  try {
    const db = getDB();
    const attempts = db.prepare('SELECT * FROM attempts ORDER BY completedAt DESC').all();
    res.json({ success: true, attempts });
  } catch (error) {
    console.error('Error fetching attempts:', error);
    res.status(500).json({ success: false, error: error.message });
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
