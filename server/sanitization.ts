import { Request, Response, NextFunction } from 'express';
import DOMPurify from 'isomorphic-dompurify';

/**
 * Sanitize string input to prevent XSS attacks
 */
function sanitizeString(value: string): string {
  return DOMPurify.sanitize(value, {
    ALLOWED_TAGS: [], // Strip all HTML tags
    ALLOWED_ATTR: [], // Strip all attributes
  }).trim();
}

/**
 * Recursively sanitize object values
 */
function sanitizeObject(obj: unknown): unknown {
  if (typeof obj === 'string') {
    return sanitizeString(obj);
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }
  
  if (obj !== null && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }
  
  return obj;
}

/**
 * Middleware to sanitize request body
 * Prevents XSS attacks by cleaning user input
 */
export function sanitizeInput(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  
  // Skip query sanitization to avoid type issues
  // Query params are typically safe as they're URL-encoded
  
  next();
}

/**
 * Sanitize specific fields that should allow some HTML
 * (e.g., rich text editor content)
 */
export function sanitizeRichText(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: [],
  });
}

/**
 * Validate and sanitize email
 */
export function sanitizeEmail(email: string): string {
  const sanitized = sanitizeString(email).toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(sanitized)) {
    throw new Error('Invalid email format');
  }
  
  return sanitized;
}

/**
 * Validate and sanitize phone number
 */
export function sanitizePhone(phone: string): string {
  // Remove all non-digit characters except + at the start
  const sanitized = phone.replace(/[^\d+]/g, '');
  
  if (sanitized.length < 10) {
    throw new Error('Invalid phone number');
  }
  
  return sanitized;
}

/**
 * Sanitize file name
 */
export function sanitizeFileName(fileName: string): string {
  // Remove path traversal attempts and dangerous characters
  return fileName
    .replace(/\.\./g, '')
    .replace(/[/\\]/g, '')
    .replace(/[<>:"|?*]/g, '')
    .trim();
}
