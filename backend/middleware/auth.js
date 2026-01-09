import jwt from 'jsonwebtoken';
import { getDB } from '../db/init.js';

// Secret key for JWT - in production this should be from environment variable
const JWT_SECRET = process.env.JWT_SECRET || 'edge-class-secret-key-change-in-production';
const JWT_EXPIRY = '24h';

/**
 * Generate JWT token for authenticated user
 */
export const generateToken = (userId, username, role, deviceId) => {
  return jwt.sign(
    { userId, username, role, deviceId },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
};

/**
 * Verify JWT token and attach user to request
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Access denied. No token provided.'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verify user still exists in database
    const db = getDB();
    const user = db.prepare('SELECT id, username, role, deviceId FROM users WHERE id = ?').get(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token. User not found.'
      });
    }

    // Attach user info to request
    req.user = {
      userId: user.id,
      username: user.username,
      role: user.role,
      deviceId: user.deviceId
    };
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: 'Token expired. Please login again.'
      });
    }
    
    return res.status(403).json({
      success: false,
      error: 'Invalid token.'
    });
  }
};

/**
 * Authorize based on user role
 */
export const authorizeRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. ${allowedRoles.join(' or ')} role required.`
      });
    }

    next();
  };
};

/**
 * Verify resource ownership or teacher role
 */
export const authorizeOwnerOrTeacher = (getOwnerId) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required.'
      });
    }

    const ownerId = getOwnerId(req);
    
    // Teachers can access all resources, owners can access their own
    if (req.user.role === 'teacher' || req.user.userId === ownerId) {
      next();
    } else {
      res.status(403).json({
        success: false,
        error: 'Access denied. You can only access your own resources.'
      });
    }
  };
};
