import { prisma } from '../config/database';
import { publish } from '../config/redis';
import { PAGINATION, ROOM_CONFIG, REDIS_CHANNELS } from '@kuraxx/constants';
import {
  RoomNotFoundError,
  RoomAccessDeniedError,
  ConflictError,
  ForbiddenError,
} from '../utils/errors';
import type { CreateRoomInput, UpdateRoomInput, PaginationInput } from '@kuraxx/contracts';
import type { RoomWithMembers, RoomRole, MessageWithSender } from '@kuraxx/types';

// Helper to create and publish a system message
async function createSystemMessage(
  roomId: string,
  content: string,
  senderId: string
): Promise<MessageWithSender> {
  const message = await prisma.message.create({
    data: {
      content,
      type: 'SYSTEM',
      roomId,
      senderId,
      status: 'SENT',
    },
    include: {
      sender: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
      attachments: true,
    },
  });

  const transformedMessage: MessageWithSender = {
    id: message.id,
    content: message.content,
    type: message.type as any,
    status: message.status as any,
    roomId: message.roomId,
    senderId: message.senderId,
    replyToId: message.replyToId,
    editedAt: message.editedAt,
    deletedAt: message.deletedAt,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
    sender: {
      id: message.sender.id,
      username: message.sender.username,
      displayName: message.sender.displayName,
      avatarUrl: message.sender.avatarUrl,
      isOnline: message.sender.isOnline,
      lastSeenAt: message.sender.lastSeenAt,
    },
    attachments: message.attachments,
    replyTo: null,
  };

  // Publish to Redis for real-time delivery
  await publish(REDIS_CHANNELS.MESSAGES.SAVED, {
    message: transformedMessage,
    roomId,
  });

  return transformedMessage;
}

// Helper to transform Prisma result
function transformRoom(room: any): RoomWithMembers {
  return {
    id: room.id,
    name: room.name,
    description: room.description,
    type: room.type,
    avatarUrl: room.avatarUrl,
    createdById: room.createdById,
    createdAt: room.createdAt,
    updatedAt: room.updatedAt,
    topics: room.topics || [],
    _count: room._count,
    members: room.members?.map((m: any) => ({
      id: m.id,
      userId: m.userId,
      roomId: m.roomId,
      role: m.role,
      joinedAt: m.joinedAt,
      user: m.user ? {
        id: m.user.id,
        username: m.user.username,
        displayName: m.user.displayName,
        avatarUrl: m.user.avatarUrl,
        isOnline: m.user.isOnline,
        lastSeenAt: m.user.lastSeenAt,
      } : undefined,
    })) || [],
  };
}

export async function createRoom(
  userId: string,
  input: CreateRoomInput
): Promise<RoomWithMembers> {
  const { name, description, type, memberIds, topics } = input;

  // For direct messages, we need exactly one other member
  if (type === 'DIRECT') {
    if (!memberIds || memberIds.length !== 1) {
      throw new ConflictError('Direct messages require exactly one other member');
    }

    // Check if a direct room already exists between these users
    const existingRoom = await prisma.room.findFirst({
      where: {
        type: 'DIRECT',
        AND: [
          { members: { some: { userId } } },
          { members: { some: { userId: memberIds[0] } } },
        ],
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
      },
    });

    if (existingRoom) {
      return transformRoom(existingRoom);
    }
  }

  // Create room
  const room = await prisma.room.create({
    data: {
      name: type !== 'DIRECT' ? name : null,
      description,
      type,
      topics: topics || [],
      createdById: userId,
      members: {
        create: [
          { userId, role: 'OWNER' },
          ...(memberIds?.map((id) => ({ userId: id, role: 'MEMBER' as const })) || []),
        ],
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
    },
  });

  return transformRoom(room);
}

export async function listRooms(
  userId: string,
  pagination: PaginationInput
): Promise<{ rooms: RoomWithMembers[]; total: number }> {
  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = pagination;
  const skip = (page - 1) * limit;

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where: {
        members: { some: { userId } },
      },
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
    }),
    prisma.room.count({
      where: {
        members: { some: { userId } },
      },
    }),
  ]);

  return {
    rooms: rooms.map(transformRoom),
    total,
  };
}

export async function discoverRooms(
  userId: string,
  pagination: PaginationInput
): Promise<{ rooms: RoomWithMembers[]; total: number }> {
  const { page = 1, limit = 20 } = pagination;
  const skip = (page - 1) * limit;

  const where = {
    type: { in: ['GROUP', 'CHANNEL'] as any },
    members: {
      none: {
        userId,
      },
    },
  };

  const [rooms, total] = await Promise.all([
    prisma.room.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        members: {
          take: 5,
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                isOnline: true,
                lastSeenAt: true,
              },
            },
          },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
    }),
    prisma.room.count({ where }),
  ]);

  return {
    rooms: rooms.map(transformRoom),
    total,
  };
}

export async function getRoomById(
  userId: string,
  roomId: string
): Promise<RoomWithMembers> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
      _count: {
        select: {
          messages: true,
          members: true,
          posts: true,
          resources: true,
        },
      },
    },
  });

  if (!room) {
    throw new RoomNotFoundError();
  }

  // Check if user is a member
  const isMember = room.members.some((m: any) => m.userId === userId);
  if (!isMember) {
    throw new RoomAccessDeniedError();
  }

  return transformRoom(room);
}

export async function updateRoom(
  userId: string,
  roomId: string,
  input: UpdateRoomInput
): Promise<RoomWithMembers> {
  // Check if user has permission to update
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }

  if (!['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Only room owners and admins can update the room');
  }

  const room = await prisma.room.update({
    where: { id: roomId },
    data: input,
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              isOnline: true,
              lastSeenAt: true,
            },
          },
        },
      },
    },
  });

  return transformRoom(room);
}

export async function deleteRoom(userId: string, roomId: string): Promise<void> {
  // Check if user is the owner
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }

  if (member.role !== 'OWNER') {
    throw new ForbiddenError('Only the room owner can delete the room');
  }

  await prisma.room.delete({
    where: { id: roomId },
  });
}

export async function getRoomMembers(
  userId: string,
  roomId: string,
  pagination: PaginationInput
) {
  // Check if user is a member
  const isMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (!isMember) {
    throw new RoomAccessDeniedError();
  }

  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = pagination;
  const skip = (page - 1) * limit;

  const [members, total] = await Promise.all([
    prisma.roomMember.findMany({
      where: { roomId },
      skip,
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isOnline: true,
            lastSeenAt: true,
          },
        },
      },
    }),
    prisma.roomMember.count({ where: { roomId } }),
  ]);

  return { members, total };
}

export async function addRoomMember(
  userId: string,
  roomId: string,
  targetUserId: string,
  role: 'ADMIN' | 'MEMBER' = 'MEMBER'
) {
  // Check if user has permission
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
    include: { room: true },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }

  if (!['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Only room owners and admins can add members');
  }

  // Check if target is already a member
  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId: targetUserId, roomId },
    },
  });

  if (existingMember) {
    throw new ConflictError('User is already a member of this room');
  }

  // Check room member limit
  const memberCount = await prisma.roomMember.count({ where: { roomId } });
  const maxMembers = member.room.type === 'CHANNEL' 
    ? ROOM_CONFIG.MAX_CHANNEL_MEMBERS 
    : ROOM_CONFIG.MAX_GROUP_MEMBERS;

  if (memberCount >= maxMembers) {
    throw new ConflictError(`Room has reached maximum member limit of ${maxMembers}`);
  }

  const newMember = await prisma.roomMember.create({
    data: {
      userId: targetUserId,
      roomId,
      role,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          isOnline: true,
          lastSeenAt: true,
        },
      },
    },
  });

  return newMember;
}

export async function removeRoomMember(
  userId: string,
  roomId: string,
  targetUserId: string
): Promise<void> {
  // Check if user has permission
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }

  // Users can remove themselves, or admins/owners can remove others
  if (userId !== targetUserId && !['OWNER', 'ADMIN'].includes(member.role)) {
    throw new ForbiddenError('Only room owners and admins can remove members');
  }

  // Check if target is a member
  const targetMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId: targetUserId, roomId },
    },
  });

  if (!targetMember) {
    throw new RoomNotFoundError();
  }

  // Cannot remove the owner unless they're removing themselves
  if (targetMember.role === 'OWNER' && userId !== targetUserId) {
    throw new ForbiddenError('Cannot remove the room owner');
  }

  await prisma.roomMember.delete({
    where: {
      userId_roomId: { userId: targetUserId, roomId },
    },
  });
}

export async function joinRoom(
  userId: string,
  roomId: string
): Promise<RoomWithMembers> {
  const room = await prisma.room.findUnique({
    where: { id: roomId },
  });

  if (!room) {
    throw new RoomNotFoundError();
  }

  // Allow joining both CHANNEL and GROUP rooms
  if (room.type !== 'CHANNEL' && room.type !== 'GROUP') {
    throw new ForbiddenError('You can only join channel or group rooms directly');
  }

  // Check if already a member
  const existingMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (existingMember) {
    throw new ConflictError('You are already a member of this room');
  }

  // Get user info for the system message
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { username: true, displayName: true },
  });

  // Add as member
  await prisma.roomMember.create({
    data: {
      userId,
      roomId,
      role: 'MEMBER',
    },
  });

  // Create system message for join event
  const displayName = user?.displayName || user?.username || 'Someone';
  await createSystemMessage(roomId, `${displayName} joined the room`, userId);

  // Publish join event to Redis
  await publish(REDIS_CHANNELS.ROOM.JOIN, {
    roomId,
    userId,
    username: user?.username,
    displayName,
  });

  return getRoomById(userId, roomId);
}

export async function leaveRoom(userId: string, roomId: string): Promise<void> {
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
    include: { 
      room: true,
      user: {
        select: { username: true, displayName: true },
      },
    },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }

  // If owner is leaving, they should transfer ownership or delete the room
  if (member.role === 'OWNER') {
    const otherMembers = await prisma.roomMember.count({
      where: { roomId, userId: { not: userId } },
    });

    if (otherMembers > 0) {
      throw new ForbiddenError('Transfer ownership before leaving, or delete the room');
    }

    // If no other members, delete the room
    await prisma.room.delete({
      where: { id: roomId },
    });
    return;
  }

  // Create system message for leave event before removing membership
  const displayName = member.user?.displayName || member.user?.username || 'Someone';
  await createSystemMessage(roomId, `${displayName} left the room`, userId);

  // Publish leave event to Redis
  await publish(REDIS_CHANNELS.ROOM.LEAVE, {
    roomId,
    userId,
    username: member.user?.username,
    displayName,
  });

  await prisma.roomMember.delete({
    where: {
      userId_roomId: { userId, roomId },
    },
  });
}
