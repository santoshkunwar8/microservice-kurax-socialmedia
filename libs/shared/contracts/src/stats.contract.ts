import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import { apiErrorSchema } from './schemas';

const c = initContract();

// Stats response schema
export const statsSchema = z.object({
  onlineUsers: z.number(),
  totalUsers: z.number(),
  activeRooms: z.number(),
  totalRooms: z.number(),
  messagesToday: z.number(),
  messagesTotal: z.number(),
});

export type Stats = z.infer<typeof statsSchema>;

// ============= Stats Contract =============
export const statsContract = c.router({
  getStats: {
    method: 'GET',
    path: '/stats',
    responses: {
      200: z.object({
        success: z.literal(true),
        data: statsSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      500: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Get platform statistics',
  },
});
