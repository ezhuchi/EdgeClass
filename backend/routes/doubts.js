import express from 'express';
import getDB from '../db/init.js';

const router = express.Router();

// Sync doubts from client
router.post('/sync/doubts', (req, res) => {
  try {
    const doubts = req.body.doubts || [];
    const db = getDB();

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO doubts (
        id, studentId, topic, chapter, question, attachments, 
        status, createdAt, updatedAt, deviceId, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const syncLog = db.prepare(`
      INSERT INTO sync_logs (deviceId, recordType, recordId, action)
      VALUES (?, 'doubt', ?, 'sync')
    `);

    const transaction = db.transaction((doubtsToSync) => {
      for (const doubt of doubtsToSync) {
        insertStmt.run(
          doubt.id,
          doubt.studentId,
          doubt.topic || null,
          doubt.chapter || null,
          doubt.question,
          JSON.stringify(doubt.attachments || []),
          doubt.status || 'open',
          doubt.createdAt,
          doubt.updatedAt,
          doubt.deviceId
        );
        syncLog.run(doubt.deviceId, doubt.id);
      }
    });

    transaction(doubts);

    res.json({
      success: true,
      synced: doubts.length,
      message: `Successfully synced ${doubts.length} doubts`
    });
  } catch (error) {
    console.error('Error syncing doubts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Sync doubt replies from client
router.post('/sync/doubt-replies', (req, res) => {
  try {
    const replies = req.body.replies || [];
    const db = getDB();

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO doubt_replies (
        id, doubtId, userId, message, attachments, 
        createdAt, deviceId, syncedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `);

    const updateDoubtStatus = db.prepare(`
      UPDATE doubts 
      SET status = 'answered', updatedAt = ? 
      WHERE id = ? AND status = 'open'
    `);

    const syncLog = db.prepare(`
      INSERT INTO sync_logs (deviceId, recordType, recordId, action)
      VALUES (?, 'doubt_reply', ?, 'sync')
    `);

    const transaction = db.transaction((repliesToSync) => {
      for (const reply of repliesToSync) {
        insertStmt.run(
          reply.id,
          reply.doubtId,
          reply.userId,
          reply.message,
          JSON.stringify(reply.attachments || []),
          reply.createdAt,
          reply.deviceId
        );
        
        // Update doubt status to 'answered' when a reply is added
        updateDoubtStatus.run(reply.createdAt, reply.doubtId);
        
        syncLog.run(reply.deviceId, reply.id);
      }
    });

    transaction(replies);

    res.json({
      success: true,
      synced: replies.length,
      message: `Successfully synced ${replies.length} replies`
    });
  } catch (error) {
    console.error('Error syncing doubt replies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update doubt status
router.post('/sync/doubt-status', (req, res) => {
  try {
    const { doubtId, status, updatedAt } = req.body;
    const db = getDB();

    const stmt = db.prepare(`
      UPDATE doubts 
      SET status = ?, updatedAt = ?
      WHERE id = ?
    `);

    const result = stmt.run(status, updatedAt, doubtId);

    res.json({
      success: true,
      updated: result.changes,
      message: 'Doubt status updated successfully'
    });
  } catch (error) {
    console.error('Error updating doubt status:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete doubt
router.delete('/sync/doubts/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDB();

    // Replies will be automatically deleted due to CASCADE
    const stmt = db.prepare('DELETE FROM doubts WHERE id = ?');
    const result = stmt.run(id);

    res.json({
      success: true,
      deleted: result.changes,
      message: 'Doubt deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting doubt:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all doubts (for initial load or pull sync)
router.get('/doubts', (req, res) => {
  try {
    const { studentId, status } = req.query;
    const db = getDB();

    let query = 'SELECT * FROM doubts';
    const params = [];

    if (studentId || status) {
      query += ' WHERE';
      const conditions = [];
      
      if (studentId) {
        conditions.push(' studentId = ?');
        params.push(studentId);
      }
      
      if (status) {
        conditions.push(' status = ?');
        params.push(status);
      }
      
      query += conditions.join(' AND');
    }

    query += ' ORDER BY updatedAt DESC';

    const stmt = db.prepare(query);
    const doubts = stmt.all(...params);

    // Parse attachments JSON
    const parsedDoubts = doubts.map(doubt => ({
      ...doubt,
      attachments: doubt.attachments ? JSON.parse(doubt.attachments) : []
    }));

    res.json({
      success: true,
      doubts: parsedDoubts
    });
  } catch (error) {
    console.error('Error fetching doubts:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get replies for a doubt
router.get('/doubts/:doubtId/replies', (req, res) => {
  try {
    const { doubtId } = req.params;
    const db = getDB();

    const stmt = db.prepare(`
      SELECT * FROM doubt_replies 
      WHERE doubtId = ? 
      ORDER BY createdAt ASC
    `);
    const replies = stmt.all(doubtId);

    // Parse attachments JSON
    const parsedReplies = replies.map(reply => ({
      ...reply,
      attachments: reply.attachments ? JSON.parse(reply.attachments) : []
    }));

    res.json({
      success: true,
      replies: parsedReplies
    });
  } catch (error) {
    console.error('Error fetching doubt replies:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
