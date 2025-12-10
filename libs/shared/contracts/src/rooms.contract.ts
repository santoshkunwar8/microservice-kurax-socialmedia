import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  createRoomSchema,
  updateRoomSchema,
  addRoomMemberSchema,
  roomTypeSchema,
  roomMemberSchema,
  userPublicSchema,
  paginationSchema,
  apiErrorSchema,
  apiMetaSchema,
  idParamSchema,
} from './schemas';

const c = initContract();

// Room schema
const roomSchema = z.object({
  id: z.string().uuid(),
  name: z.string().nullable(),
  description: z.string().nullable(),
  type: roomTypeSchema,
  avatarUrl: z.string().url().nullable(),
  createdById: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Room with members schema
const roomWithMembersSchema = roomSchema.extend({
  members: z.array(
    roomMemberSchema.extend({
      user: userPublicSchema.optional(),
    })
  ),
  _count: z.object({
    members: z.number(),
    messages: z.number(),
  }).optional(),
});

// ============= Rooms Contract =============
export const roomsContract = c.router({
  create: {
    method: 'POST',
    path: '/rooms/create',
    body: createRoomSchema,
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          room: roomWithMembersSchema,
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
    summary: 'Create a new room',
  },

  list: {
    method: 'GET',
    path: '/rooms/list',
    query: paginationSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          rooms: z.array(roomWithMembersSchema),
        }),
        meta: apiMetaSchema.optional(),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'List rooms for current user',
  },

  discover: {
    method: 'GET',
    path: '/rooms/discover',
    query: paginationSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          rooms: z.array(roomWithMembersSchema),
        }),
        meta: apiMetaSchema.optional(),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Discover public rooms',
  },

  getById: {
    method: 'GET',
    path: '/rooms/:id',
    pathParams: idParamSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          room: roomWithMembersSchema,
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
    summary: 'Get a room by ID',
  },

  update: {
    method: 'PATCH',
    path: '/rooms/:id',
    pathParams: idParamSchema,
    body: updateRoomSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          room: roomWithMembersSchema,
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
    summary: 'Update a room',
  },

  delete: {
    method: 'DELETE',
    path: '/rooms/:id',
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
    summary: 'Delete a room',
  },

  getMembers: {
    method: 'GET',
    path: '/rooms/:id/members',
    pathParams: idParamSchema,
    query: paginationSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          members: z.array(
            roomMemberSchema.extend({
              user: userPublicSchema,
            })
          ),
        }),
        meta: apiMetaSchema.optional(),
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
    summary: 'Get members of a room',
  },

  addMember: {
    method: 'POST',
    path: '/rooms/:id/members',
    pathParams: idParamSchema,
    body: addRoomMemberSchema,
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          member: roomMemberSchema.extend({
            user: userPublicSchema,
          }),
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
      409: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Add a member to a room',
  },

  removeMember: {
    method: 'DELETE',
    path: '/rooms/:id/members/:userId',
    pathParams: z.object({
      id: z.string().uuid(),
      userId: z.string().uuid(),
    }),
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
    summary: 'Remove a member from a room',
  },

  join: {
    method: 'POST',
    path: '/rooms/:id/join',
    pathParams: idParamSchema,
    body: z.object({}),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          room: roomWithMembersSchema,
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
      409: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Join a room',
  },

  leave: {
    method: 'POST',
    path: '/rooms/:id/leave',
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
    summary: 'Leave a room',
  },
});

export type RoomsContract = typeof roomsContract;
