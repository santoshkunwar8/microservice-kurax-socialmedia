import { prisma } from '../config/database';
import { hashPassword, verifyPassword } from '../utils/password';
import { generateTokens, verifyRefreshToken, getRefreshTokenExpiry } from '../utils/jwt';
import {
  InvalidCredentialsError,
  UserExistsError,
  InvalidTokenError,
} from '../utils/errors';
import type { RegisterInput, LoginInput } from '@kuraxx/contracts';
import type { AuthTokens, UserPublic } from '@kuraxx/types';

export interface AuthResult {
  user: UserPublic;
  tokens: AuthTokens;
}

export async function registerUser(input: RegisterInput): Promise<AuthResult> {
  // Check if user exists
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: input.email }, { username: input.username }],
    },
  });

  if (existingUser) {
    if (existingUser.email === input.email) {
      throw new UserExistsError('email');
    }
    throw new UserExistsError('username');
  }

  // Hash password and create user
  const passwordHash = await hashPassword(input.password);

  const user = await prisma.user.create({
    data: {
      email: input.email,
      username: input.username,
      displayName: input.displayName || input.username,
      passwordHash,
    },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
    },
  });

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOnline: user.isOnline,
      lastSeenAt: user.lastSeenAt,
    },
    tokens,
  };
}

export async function loginUser(input: LoginInput): Promise<AuthResult> {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: input.email },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
      passwordHash: true,
    },
  });

  if (!user) {
    throw new InvalidCredentialsError();
  }

  // Verify password
  const isValidPassword = await verifyPassword(input.password, user.passwordHash);

  if (!isValidPassword) {
    throw new InvalidCredentialsError();
  }

  // Generate tokens
  const tokens = generateTokens({
    userId: user.id,
    email: user.email,
    username: user.username,
  });

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  // Update online status
  await prisma.user.update({
    where: { id: user.id },
    data: { isOnline: true },
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
      isOnline: true,
      lastSeenAt: user.lastSeenAt,
    },
    tokens,
  };
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  // Verify refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new InvalidTokenError();
  }

  // Check if token exists in database and is not revoked
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true },
  });

  if (!storedToken || storedToken.revokedAt) {
    throw new InvalidTokenError();
  }

  if (new Date() > storedToken.expiresAt) {
    throw new InvalidTokenError();
  }

  // Revoke old token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: { revokedAt: new Date() },
  });

  // Generate new tokens
  const tokens = generateTokens({
    userId: payload.userId,
    email: payload.email,
    username: payload.username,
  });

  // Store new refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: payload.userId,
      expiresAt: getRefreshTokenExpiry(),
    },
  });

  return tokens;
}

export async function logoutUser(userId: string): Promise<void> {
  // Revoke all refresh tokens for user
  await prisma.refreshToken.updateMany({
    where: {
      userId,
      revokedAt: null,
    },
    data: {
      revokedAt: new Date(),
    },
  });

  // Update online status
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline: false,
      lastSeenAt: new Date(),
    },
  });
}

export async function getCurrentUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}
