import { initServer } from '@ts-rest/express';
import { roomsContract } from '@kuraxx/contracts';
import * as roomService from '../services/room.service';
import { authMiddleware } from '../middlewares';
import { paginationMeta } from '../utils/response';

const s = initServer();

export const roomsRouter = s.router(roomsContract, {
  create: {
    middleware: [authMiddleware as any],
    handler: async ({ body, req }) => {
      const room = await roomService.createRoom(req.userId!, body);
      return {
        status: 201,
        body: {
          success: true as const,
          data: {
            room,
          },
        },
      };
    },
  },

  list: {
    middleware: [authMiddleware as any],
    handler: async ({ query, req }) => {
      const { rooms, total } = await roomService.listRooms(req.userId!, query);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            rooms,
          },
          meta: paginationMeta(query.page || 1, query.limit || 20, total),
        },
      };
    },
  },

  discover: {
    middleware: [authMiddleware as any],
    handler: async ({ query, req }) => {
      const { rooms, total } = await roomService.discoverRooms(req.userId!, query);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            rooms,
          },
          meta: paginationMeta(query.page || 1, query.limit || 20, total),
        },
      };
    },
  },

  getById: {
    middleware: [authMiddleware as any],
    handler: async ({ params, req }) => {
      const room = await roomService.getRoomById(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            room,
          },
        },
      };
    },
  },

  update: {
    middleware: [authMiddleware as any],
    handler: async ({ params, body, req }) => {
      const room = await roomService.updateRoom(req.userId!, params.id, body);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            room,
          },
        },
      };
    },
  },

  delete: {
    middleware: [authMiddleware as any],
    handler: async ({ params, req }) => {
      await roomService.deleteRoom(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message: 'Room deleted successfully',
          },
        },
      };
    },
  },

  getMembers: {
    middleware: [authMiddleware as any],
    handler: async ({ params, query, req }) => {
      const { members, total } = await roomService.getRoomMembers(
        req.userId!,
        params.id,
        query
      );
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            members: members.map((m: any) => ({
              ...m,
              user: m.user,
            })),
          },
          meta: paginationMeta(query.page || 1, query.limit || 20, total),
        },
      };
    },
  },

  addMember: {
    middleware: [authMiddleware as any],
    handler: async ({ params, body, req }) => {
      const member = await roomService.addRoomMember(
        req.userId!,
        params.id,
        body.userId,
        body.role
      );
      return {
        status: 201,
        body: {
          success: true as const,
          data: {
            member: {
              id: member.id,
              userId: member.userId,
              roomId: member.roomId,
              role: member.role,
              joinedAt: member.joinedAt,
              user: member.user,
            },
          },
        },
      };
    },
  },

  removeMember: {
    middleware: [authMiddleware as any],
    handler: async ({ params, req }) => {
      await roomService.removeRoomMember(req.userId!, params.id, params.userId);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message: 'Member removed successfully',
          },
        },
      };
    },
  },

  join: {
    middleware: [authMiddleware as any],
    handler: async ({ params, req }) => {
      const room = await roomService.joinRoom(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            room,
          },
        },
      };
    },
  },

  leave: {
    middleware: [authMiddleware as any],
    handler: async ({ params, req }) => {
      await roomService.leaveRoom(req.userId!, params.id);
      return {
        status: 200,
        body: {
          success: true as const,
          data: {
            message: 'Left room successfully',
          },
        },
      };
    },
  },
});
