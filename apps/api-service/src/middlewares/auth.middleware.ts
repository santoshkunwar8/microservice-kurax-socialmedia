import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { UnauthorizedError, InvalidTokenError, TokenExpiredError } from '../utils/errors';
import { prisma } from '../config/database';
import type { TokenPayload } from '@kuraxx/types';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string;
    }
  }
}

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedError('No authorization header provided');
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      throw new UnauthorizedError('Invalid authorization header format');
    }

    try {
      const payload = verifyAccessToken(token);
      
      // Verify user still exists
      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true },
      });

      if (!user) {
        throw new UnauthorizedError('User not found');
      }

      req.user = payload;
      req.userId = payload.userId;
      next();
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new TokenExpiredError();
        }
        if (error.name === 'JsonWebTokenError') {
          throw new InvalidTokenError();
        }
      }
      throw error;
    }
  } catch (error) {
    next(error);
  }
}

// Optional auth middleware - doesn't throw if no token
export async function optionalAuthMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return next();
    }

    const [bearer, token] = authHeader.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next();
    }

    try {
      const payload = verifyAccessToken(token);
      req.user = payload;
      req.userId = payload.userId;
    } catch {
      // Ignore token errors for optional auth
    }

    next();
  } catch (error) {
    next(error);
  }
}
