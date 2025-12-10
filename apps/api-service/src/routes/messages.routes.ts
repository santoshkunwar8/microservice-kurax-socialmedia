import { initServer } from '@ts-rest/express';
import { messagesContract } from '@kuraxx/contracts';
import * as messageService from '../services/message.service';
import { authMiddleware } from '../middlewares';

const s = initServer();

export const messagesRouter = s.router(messagesContract, {
  send: {
    middleware: [authMiddleware],
    handler: async ({ body, req }) => {
      const result = await messageService.sendMessage(req.userId!, body);
      return {
        status: 201,
        body: {
          success: true as const,
          data: {
            message: result.message,
          },
        },
      };
    },
  },

  history: {
    middleware: [authMiddleware as any],
    handler: async ({ query, req }) => {
      const result = await messageService.getMessageHistory(req.userId!, query);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            messages: result.messages,
            hasMore: result.hasMore,
            nextCursor: result.nextCursor,
          },
        },
      };
    },
  },

  getById: {
    middleware: [authMiddleware],
    handler: async ({ params, req }) => {
      const message = await messageService.getMessageById(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message,
          },
        },
      };
    },
  },

  update: {
    middleware: [authMiddleware],
    handler: async ({ params, body, req }) => {
      const message = await messageService.updateMessage(
        req.userId!,
        params.id,
        body.content
      );
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message,
          },
        },
      };
    },
  },

  delete: {
    middleware: [authMiddleware],
    handler: async ({ params, req }) => {
      await messageService.deleteMessage(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message: 'Message deleted successfully',
          },
        },
      };
    },
  },
});
