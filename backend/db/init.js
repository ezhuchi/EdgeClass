import Database from 'better-sqlite3';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path
const DB_DIR = process.env.DB_PATH 
  ? dirname(process.env.DB_PATH) 
  : join(__dirname, '../data');

const DB_PATH = process.env.DB_PATH || join(DB_DIR, 'ghost.db');

// Ensure data directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

// Initialize database connection
let db;

export const getDB = () => {
  if (!db) {
    db = new Database(DB_PATH, { verbose: console.log });
    db.pragma('journal_mode = WAL');
  }
  return db;
};

export const initDatabase = () => {
  const database = getDB();

  // Create tables
  const createTables = `
    -- Users table
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('teacher', 'student')),
      deviceId TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      syncedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Quizzes table
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      createdBy TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      deviceId TEXT NOT NULL,
      syncedAt TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Questions table
    CREATE TABLE IF NOT EXISTS questions (
      id TEXT PRIMARY KEY,
      quizId TEXT NOT NULL,
      question TEXT NOT NULL,
      options TEXT NOT NULL,
      correctAnswer TEXT NOT NULL,
      \`order\` INTEGER NOT NULL,
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    -- Attempts table
    CREATE TABLE IF NOT EXISTS attempts (
      id TEXT PRIMARY KEY,
      quizId TEXT NOT NULL,
      userId TEXT NOT NULL,
      answers TEXT NOT NULL,
      score INTEGER NOT NULL,
      totalQuestions INTEGER NOT NULL,
      completedAt TEXT NOT NULL,
      deviceId TEXT NOT NULL,
      syncedAt TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );

    -- Sync logs table
    CREATE TABLE IF NOT EXISTS sync_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      deviceId TEXT NOT NULL,
      recordType TEXT NOT NULL,
      recordId TEXT NOT NULL,
      action TEXT NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      status TEXT DEFAULT 'success'
    );

    -- Create indexes for better query performance
    CREATE INDEX IF NOT EXISTS idx_quizzes_createdBy ON quizzes(createdBy);
    CREATE INDEX IF NOT EXISTS idx_questions_quizId ON questions(quizId);
    CREATE INDEX IF NOT EXISTS idx_attempts_quizId ON attempts(quizId);
    CREATE INDEX IF NOT EXISTS idx_attempts_userId ON attempts(userId);
    CREATE INDEX IF NOT EXISTS idx_sync_logs_deviceId ON sync_logs(deviceId);
  `;

  database.exec(createTables);

  console.log('✅ Database initialized successfully');
  console.log(`📁 Database location: ${DB_PATH}`);

  return database;
};

export default getDB;
