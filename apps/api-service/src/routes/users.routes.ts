import { initServer } from '@ts-rest/express';
import { usersContract } from '@kuraxx/contracts';
import * as userService from '../services/user.service';
import { authMiddleware } from '../middlewares';
import { paginationMeta } from '../utils/response';

const s = initServer();

export const usersRouter = s.router(usersContract, {
  search: {
    middleware: [authMiddleware as any],
    handler: async ({ query, req }) => {
      const { query: searchQuery, page, limit } = query;
      const { users, total } = await userService.searchUsers(
        req.userId!,
        { query: searchQuery },
        { page, limit }
      );
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            users,
          },
          meta: paginationMeta(page || 1, limit || 20, total),
        },
      };
    },
  },

  getById: {
    middleware: [authMiddleware as any],
    handler: async ({ params }) => {
      const user = await userService.getUserById(params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            user,
          },
        },
      };
    },
  },

  updateMe: {
    middleware: [authMiddleware as any],
    handler: async ({ body, req }) => {
      const user = await userService.updateUser(req.userId!, body);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            user,
          },
        },
      };
    },
  },
});
