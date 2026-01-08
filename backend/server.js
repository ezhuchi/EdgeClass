import express from 'express';
import cors from 'cors';
import { initDatabase } from './db/init.js';
import syncRoutes from './routes/sync.js';
import statsRoutes from './routes/stats.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
initDatabase();

// Routes
app.use('/api/sync', syncRoutes);
app.use('/api/stats', statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'GhostClass Sync Server'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'GhostClass Sync API',
    version: '1.0.0',
    description: 'Offline-first education sync server',
    endpoints: {
      health: '/health',
      sync: '/api/sync/*',
      stats: '/api/stats'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path 
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message 
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   👻 GhostClass Sync Server Running   ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                         ║
║   Time: ${new Date().toLocaleString()}  
║   Mode: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
  `);
});

export default app;
