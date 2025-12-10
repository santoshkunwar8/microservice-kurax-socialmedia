import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { TokenPayload } from '@kuraxx/types';

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwtSecret) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}
