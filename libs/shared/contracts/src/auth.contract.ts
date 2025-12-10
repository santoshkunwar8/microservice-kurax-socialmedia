import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
  userPublicSchema,
  userSchema,
  apiErrorSchema,
} from './schemas';

const c = initContract();

// ============= Auth Contract =============
export const authContract = c.router({
  register: {
    method: 'POST',
    path: '/auth/register',
    body: registerSchema,
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          user: userPublicSchema,
          accessToken: z.string(),
          refreshToken: z.string(),
          expiresIn: z.number(),
        }),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      409: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Register a new user',
  },

  login: {
    method: 'POST',
    path: '/auth/login',
    body: loginSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          user: userPublicSchema,
          accessToken: z.string(),
          refreshToken: z.string(),
          expiresIn: z.number(),
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Login with email and password',
  },

  logout: {
    method: 'POST',
    path: '/auth/logout',
    body: z.object({}),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          message: z.string(),
        }),
      }),
    },
    summary: 'Logout current user',
  },

  refresh: {
    method: 'POST',
    path: '/auth/refresh',
    body: refreshTokenSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          accessToken: z.string(),
          refreshToken: z.string(),
          expiresIn: z.number(),
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Refresh access token',
  },

  me: {
    method: 'GET',
    path: '/auth/me',
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          user: userSchema,
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Get current authenticated user',
  },
});

export type AuthContract = typeof authContract;
