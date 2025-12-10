import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  userPublicSchema,
  userSchema,
  updateUserSchema,
  searchUsersSchema,
  paginationSchema,
  apiErrorSchema,
  apiMetaSchema,
  idParamSchema,
} from './schemas';

const c = initContract();

// ============= Users Contract =============
export const usersContract = c.router({
  search: {
    method: 'GET',
    path: '/users/search',
    query: searchUsersSchema.merge(paginationSchema),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          users: z.array(userPublicSchema),
        }),
        meta: apiMetaSchema.optional(),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Search users by username or display name',
  },

  getById: {
    method: 'GET',
    path: '/users/:id',
    pathParams: idParamSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          user: userPublicSchema,
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      404: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Get a user by ID',
  },

  updateMe: {
    method: 'PATCH',
    path: '/users/me',
    body: updateUserSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          user: userSchema,
        }),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Update current user profile',
  },
});

export type UsersContract = typeof usersContract;
