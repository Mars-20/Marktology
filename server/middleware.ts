import { Request, Response, NextFunction } from 'express';
import type { User } from '@shared/schema';
import rateLimit from 'express-rate-limit';

// Check if user is authenticated
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
  next();
}

// Check if user has required role
export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = req.user as User;
    if (!roles.includes(user.role)) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    next();
  };
}

// Check if user has access to clinic data
export function requireClinicAccess(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const user = req.user as User;
  
  // System admins have access to all clinics
  if (user.role === 'system_admin') {
    return next();
  }

  // Get clinic_id from params, query, or body
  const clinicId = req.params.clinic_id || req.query.clinic_id || req.body.clinic_id;

  if (!clinicId) {
    return res.status(400).json({ message: 'Clinic ID is required' });
  }

  if (user.clinic_id !== clinicId) {
    return res.status(403).json({ message: 'Access denied to this clinic' });
  }

  next();
}

/**
 * Rate limiter for login attempts
 * 5 attempts per 15 minutes
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts, please try again after 15 minutes',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // Don't count successful logins
});

/**
 * Rate limiter for general API requests
 * 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === '/health' || req.path === '/api/health';
  },
});

/**
 * Strict rate limiter for sensitive operations
 * 10 requests per hour
 */
export const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 requests
  message: 'Too many requests for this operation, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
 * 20 uploads per hour
 */
export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 uploads
  message: 'Too many file uploads, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});
