import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';
import { errorResponse } from '../utils/response';
import { ERROR_CODES } from '@kuraxx/constants';
import { config } from '../config';

export function errorMiddleware(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', error);

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const details: Record<string, string[]> = {};
    error.errors.forEach((err) => {
      const path = err.path.join('.');
      if (!details[path]) {
        details[path] = [];
      }
      details[path].push(err.message);
    });

    res.status(400).json(
      errorResponse(ERROR_CODES.VALIDATION_ERROR, 'Validation failed', details)
    );
    return;
  }

  // Handle custom app errors
  if (error instanceof AppError) {
    res.status(error.statusCode).json(
      errorResponse(error.code, error.message, error.details)
    );
    return;
  }

  // Handle Prisma errors
  if (error.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = error as unknown as { code: string; meta?: { target?: string[] } };
    
    switch (prismaError.code) {
      case 'P2002': // Unique constraint violation
        const field = prismaError.meta?.target?.[0] || 'field';
        res.status(409).json(
          errorResponse(ERROR_CODES.RESOURCE_EXISTS, `${field} already exists`)
        );
        return;
      case 'P2025': // Record not found
        res.status(404).json(
          errorResponse(ERROR_CODES.RESOURCE_NOT_FOUND, 'Resource not found')
        );
        return;
      default:
        break;
    }
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    res.status(401).json(
      errorResponse(ERROR_CODES.AUTH_TOKEN_INVALID, 'Invalid token')
    );
    return;
  }

  if (error.name === 'TokenExpiredError') {
    res.status(401).json(
      errorResponse(ERROR_CODES.AUTH_TOKEN_EXPIRED, 'Token has expired')
    );
    return;
  }

  // Generic error handler
  const statusCode = 500;
  const message = config.nodeEnv === 'production' 
    ? 'Internal server error' 
    : error.message;

  res.status(statusCode).json(
    errorResponse(ERROR_CODES.INTERNAL_ERROR, message)
  );
}

// Not found handler
export function notFoundMiddleware(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json(
    errorResponse(
      ERROR_CODES.RESOURCE_NOT_FOUND,
      `Route ${req.method} ${req.path} not found`
    )
  );
}
