import express from 'express';
import { getDB } from '../db/init.js';

const router = express.Router();

// Get overall statistics
router.get('/', (req, res) => {
  try {
    const db = getDB();

    const stats = {
      users: db.prepare('SELECT COUNT(*) as count FROM users').get(),
      quizzes: db.prepare('SELECT COUNT(*) as count FROM quizzes').get(),
      attempts: db.prepare('SELECT COUNT(*) as count FROM attempts').get(),
      syncLogs: db.prepare('SELECT COUNT(*) as count FROM sync_logs').get(),
      devices: db.prepare('SELECT COUNT(DISTINCT deviceId) as count FROM users').get(),
      recentSyncs: db.prepare(`
        SELECT * FROM sync_logs 
        ORDER BY timestamp DESC 
        LIMIT 10
      `).all()
    };

    res.json({ 
      success: true, 
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

// Get device-specific statistics
router.get('/device/:deviceId', (req, res) => {
  try {
    const { deviceId } = req.params;
    const db = getDB();

    const stats = {
      quizzes: db.prepare('SELECT COUNT(*) as count FROM quizzes WHERE deviceId = ?').get(deviceId),
      attempts: db.prepare('SELECT COUNT(*) as count FROM attempts WHERE deviceId = ?').get(deviceId),
      lastSync: db.prepare(`
        SELECT * FROM sync_logs 
        WHERE deviceId = ? 
        ORDER BY timestamp DESC 
        LIMIT 1
      `).get(deviceId),
      syncHistory: db.prepare(`
        SELECT * FROM sync_logs 
        WHERE deviceId = ? 
        ORDER BY timestamp DESC 
        LIMIT 20
      `).all(deviceId)
    };

    res.json({ 
      success: true, 
      deviceId,
      stats,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error fetching device stats:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

export default router;
