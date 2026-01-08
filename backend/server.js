import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { initDatabase } from './db/init.js';
import syncRoutes from './routes/sync.js';
import statsRoutes from './routes/stats.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files in production
if (isProduction) {
  const frontendPath = path.join(__dirname, 'public');
  app.use(express.static(frontendPath));
  console.log(`📦 Serving static files from: ${frontendPath}`);
}

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

// Serve frontend for all non-API routes in production
if (isProduction) {
  app.get('*', (req, res) => {
    if (!req.path.startsWith('/api') && !req.path.startsWith('/health')) {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    }
  });
} else {
  // 404 handler for development
  app.use((req, res) => {
    res.status(404).json({ 
      error: 'Not found',
      path: req.path 
    });
  });
}

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
