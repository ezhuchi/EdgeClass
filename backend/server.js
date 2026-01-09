import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
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

// Security Headers Middleware
app.use((req, res, next) => {
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline'; " +
    "style-src 'self' 'unsafe-inline'; " +
    "font-src 'self' data:; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' https://*.vercel.app https://*.onrender.com; " +
    "frame-ancestors 'none'; " +
    "base-uri 'self'; " +
    "form-action 'self';"
  );
  
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevent clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // XSS Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permissions Policy - Allow camera/microphone for same origin, block geolocation
  res.setHeader('Permissions-Policy', 'camera=(self), microphone=(self), geolocation=()');
  
  // HSTS for HTTPS
  if (isProduction) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  
  next();
});

// Middleware - CORS only (json parsing comes after rate limiting)
app.use(cors());

// Rate limiting for sync endpoints (100 requests per 15 minutes)
const syncLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many sync requests, please try again later',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// General API limiter (stricter for non-sync endpoints)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: 'Too many requests, please try again later',
});

// JSON body parser with strict size limits (AFTER rate limiters)
// Limits prevent JSON DoS attacks via massive payloads or deeply nested objects
app.use(express.json({ 
  limit: '100kb', // Maximum request body size
  strict: true,   // Only accept arrays and objects
}));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Initialize database
initDatabase();

// Routes
app.use('/api/sync', syncLimiter, syncRoutes);
app.use('/api/stats', apiLimiter, statsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Edge Class Sync Server'
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Not found',
    path: req.path,
    message: 'This is an API-only server. Frontend is deployed separately.'
  });
});

// Error handler - Sanitized to prevent information leakage
app.use((err, req, res, next) => {
  // Log full error details server-side for debugging
  console.error('Error:', err);
  
  // Send sanitized error to client (never expose stack traces, file paths, or DB errors)
  const statusCode = err.statusCode || 500;
  const response = {
    success: false,
    error: statusCode === 500 ? 'Internal server error' : err.message
  };
  
  // In development, optionally include more details (but still not full stack)
  if (process.env.NODE_ENV !== 'production' && err.code) {
    response.code = err.code;
  }
  
  res.status(statusCode).json(response);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
╔════════════════════════════════════════╗
║   Edge Class Sync Server Running   ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                         ║
║   Time: ${new Date().toLocaleString()}  
║   Mode: ${process.env.NODE_ENV || 'development'}
╚════════════════════════════════════════╝
  `);
});

export default app;
