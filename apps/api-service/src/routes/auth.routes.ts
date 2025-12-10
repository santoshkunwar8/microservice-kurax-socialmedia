import { initServer } from '@ts-rest/express';
import { authContract } from '@kuraxx/contracts';
import * as authService from '../services/auth.service';
import { authMiddleware } from '../middlewares';

const s = initServer();

export const authRouter = s.router(authContract, {
  register: async ({ body }) => {
    const result = await authService.registerUser(body);
    return {
      status: 201,
      body: {
        success: true as const,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
        },
      },
    };
  },

  login: async ({ body }) => {
    const result = await authService.loginUser(body);
    return {
      status: 200,
      body: {
        success: true as const,
        data: {
          user: result.user,
          accessToken: result.tokens.accessToken,
          refreshToken: result.tokens.refreshToken,
          expiresIn: result.tokens.expiresIn,
        },
      },
    };
  },

  logout: {
    middleware: [authMiddleware],
    handler: async ({ req }) => {
      await authService.logoutUser(req.userId!);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message: 'Logged out successfully',
          },
        },
      };
    },
  },

  refresh: async ({ body }) => {
    const tokens = await authService.refreshTokens(body.refreshToken);
    return {
      status: 200,
      body: {
        success: true as const,
        data: {
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          expiresIn: tokens.expiresIn,
        },
      },
    };
  },

  me: {
    middleware: [authMiddleware],
    handler: async ({ req }) => {
      const user = await authService.getCurrentUser(req.userId!);
      if (!user) {
        return {
          status: 401,
          body: {
            success: false as const,
            error: {
              code: 'AUTH_USER_NOT_FOUND',
              message: 'User not found',
            },
          },
        };
      }
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
