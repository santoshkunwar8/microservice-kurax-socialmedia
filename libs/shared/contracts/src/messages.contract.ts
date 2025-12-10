import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  sendMessageSchema,
  messageHistoryQuerySchema,
  updateMessageSchema,
  messageSchema,
  messageAttachmentSchema,
  userPublicSchema,
  apiErrorSchema,
  apiMetaSchema,
  idParamSchema,
} from './schemas';

const c = initContract();

// Extended message schema with sender info
const messageWithSenderSchema = messageSchema.extend({
  sender: userPublicSchema,
  attachments: z.array(messageAttachmentSchema).optional(),
  replyTo: messageSchema.nullable().optional(),
});

// ============= Messages Contract =============
export const messagesContract = c.router({
  send: {
    method: 'POST',
    path: '/messages/send',
    body: sendMessageSchema,
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          message: messageWithSenderSchema,
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
      403: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Send a new message to a room',
  },

  history: {
    method: 'GET',
    path: '/messages/history',
    query: messageHistoryQuerySchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          messages: z.array(messageWithSenderSchema),
          hasMore: z.boolean(),
          nextCursor: z.string().uuid().nullable(),
        }),
        meta: apiMetaSchema.optional(),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      403: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Get message history for a room',
  },

  getById: {
    method: 'GET',
    path: '/messages/:id',
    pathParams: idParamSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          message: messageWithSenderSchema,
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
    summary: 'Get a message by ID',
  },

  update: {
    method: 'PATCH',
    path: '/messages/:id',
    pathParams: idParamSchema,
    body: updateMessageSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          message: messageWithSenderSchema,
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
      403: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      404: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Update a message',
  },

  delete: {
    method: 'DELETE',
    path: '/messages/:id',
    pathParams: idParamSchema,
    body: z.object({}),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          message: z.string(),
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      403: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      404: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Delete a message (soft delete)',
  },
});

export type MessagesContract = typeof messagesContract;
