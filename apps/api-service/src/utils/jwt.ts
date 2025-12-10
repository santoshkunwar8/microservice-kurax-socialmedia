import jwt from 'jsonwebtoken';
import { config } from '../config';
import type { TokenPayload, AuthTokens } from '@kuraxx/types';

const ACCESS_TOKEN_EXPIRY = config.jwt.accessExpiry;
const REFRESH_TOKEN_EXPIRY = config.jwt.refreshExpiry;

export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload as object, config.jwt.secret, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  } as jwt.SignOptions);
}

export function generateTokens(payload: Omit<TokenPayload, 'iat' | 'exp'>): AuthTokens {
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  return {
    accessToken,
    refreshToken,
    expiresIn: parseExpiryToMs(ACCESS_TOKEN_EXPIRY),
  };
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload;
  } catch {
    return null;
  }
}

export function parseExpiryToMs(expiry: string): number {
  const match = expiry.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 15 * 60 * 1000; // Default 15 minutes
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  switch (unit) {
    case 's':
      return value * 1000;
    case 'm':
      return value * 60 * 1000;
    case 'h':
      return value * 60 * 60 * 1000;
    case 'd':
      return value * 24 * 60 * 60 * 1000;
    default:
      return 15 * 60 * 1000;
  }
}

export function getRefreshTokenExpiry(): Date {
  return new Date(Date.now() + parseExpiryToMs(REFRESH_TOKEN_EXPIRY));
}
