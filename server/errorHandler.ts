import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { fromZodError } from 'zod-validation-error';

// Custom error class
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Handle Zod validation errors
export function handleValidationError(error: ZodError) {
  const validationError = fromZodError(error);
  return {
    statusCode: 400,
    message: 'Validation failed',
    errors: validationError.details,
  };
}

// Handle database errors
export function handleDatabaseError(error: any) {
  // PostgreSQL error codes
  if (error.code === '23505') {
    return {
      statusCode: 409,
      message: 'Duplicate entry',
      field: error.constraint,
    };
  }

  if (error.code === '23503') {
    return {
      statusCode: 400,
      message: 'Invalid reference',
      field: error.constraint,
    };
  }

  if (error.code === '23502') {
    return {
      statusCode: 400,
      message: 'Required field missing',
      field: error.column,
    };
  }

  return {
    statusCode: 500,
    message: 'Database error',
  };
}

// Global error handler middleware
export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log error with stack trace
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    body: req.body,
    user: req.user ? (req.user as any).id : 'anonymous',
    timestamp: new Date().toISOString(),
  });

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const validationError = handleValidationError(err);
    return res.status(validationError.statusCode).json(validationError);
  }

  // Handle database errors
  if (err.code && err.code.startsWith('23')) {
    const dbError = handleDatabaseError(err);
    return res.status(dbError.statusCode).json(dbError);
  }

  // Handle custom app errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      message: err.message,
    });
  }

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  // Differentiate between dev and production
  const message =
    process.env.NODE_ENV === 'production' && statusCode === 500
      ? 'Internal server error'
      : err.message || 'Internal server error';

  const response: any = { message };

  // Include stack trace in development
  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

// Async handler wrapper to catch errors in async route handlers
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
