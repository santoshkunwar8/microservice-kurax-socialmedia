import { initServer } from '@ts-rest/express';
import { statsContract } from '@kuraxx/contracts';
import * as statsService from '../services/stats.service';
import { authMiddleware } from '../middlewares/auth.middleware';

const s = initServer();

export const statsRouter = s.router(statsContract, {
  getStats: {
    middleware: [authMiddleware],
    handler: async () => {
      try {
        const stats = await statsService.getPlatformStats();

        return {
          status: 200 as const,
          body: {
            success: true as const,
            data: stats,
          },
        };
      } catch (error) {
        console.error('Failed to get stats:', error);
        return {
          status: 500 as const,
          body: {
            success: false as const,
            error: {
              code: 'STATS_ERROR',
              message: 'Failed to retrieve statistics',
            },
          },
        };
      }
    },
  },
});
