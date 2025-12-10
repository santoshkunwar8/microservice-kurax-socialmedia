import { prisma } from '../config/database';
import { publish } from '../config/redis';
import { REDIS_CHANNELS, PAGINATION } from '@kuraxx/constants';
import {
  RoomNotFoundError,
  RoomAccessDeniedError,
  MessageNotFoundError,
  ForbiddenError,
} from '../utils/errors';
import type { SendMessageInput, MessageHistoryQuery } from '@kuraxx/contracts';
import type { MessageWithSender } from '@kuraxx/types';

// Helper to transform Prisma result to MessageWithSender
function transformMessage(message: any): MessageWithSender {
  return {
    id: message.id,
    content: message.content,
    type: message.type,
    status: message.status,
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
    replyTo: message.replyTo || null,
  };
}

export async function sendMessage(
  userId: string,
  input: SendMessageInput
): Promise<{ message: MessageWithSender; tempId?: string }> {
  // Verify room exists and user is a member
  const roomMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId: input.roomId,
      },
    },
    include: {
      room: true,
    },
  });

  if (!roomMember) {
    throw new RoomAccessDeniedError();
  }

  // Create message
  const message = await prisma.message.create({
    data: {
      content: input.content,
      type: input.type,
      roomId: input.roomId,
      senderId: userId,
      replyToId: input.replyToId,
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
      replyTo: true,
    },
  });

  const transformedMessage = transformMessage(message);

  // Publish to Redis for real-time delivery
  await publish(REDIS_CHANNELS.MESSAGES.SAVED, {
    message: transformedMessage,
    roomId: input.roomId,
    tempId: input.tempId,
  });

  return {
    message: transformedMessage,
    tempId: input.tempId,
  };
}

export async function getMessageHistory(
  userId: string,
  query: MessageHistoryQuery
): Promise<{
  messages: MessageWithSender[];
  hasMore: boolean;
  nextCursor: string | null;
}> {
  const { roomId, cursor, limit = PAGINATION.DEFAULT_MESSAGE_LIMIT, before } = query;

  // Verify user is a member of the room
  const roomMember = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: {
        userId,
        roomId,
      },
    },
  });

  if (!roomMember) {
    throw new RoomAccessDeniedError();
  }

  // Build query conditions
  const whereConditions: any = {
    roomId,
    deletedAt: null,
  };

  if (cursor) {
    const cursorMessage = await prisma.message.findUnique({
      where: { id: cursor },
      select: { createdAt: true },
    });
    if (cursorMessage) {
      whereConditions.createdAt = { lt: cursorMessage.createdAt };
    }
  } else if (before) {
    whereConditions.createdAt = { lt: before };
  }

  // Fetch messages (one extra to determine if there are more)
  const messages = await prisma.message.findMany({
    where: whereConditions,
    take: limit + 1,
    orderBy: { createdAt: 'desc' },
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
      replyTo: true,
    },
  });

  const hasMore = messages.length > limit;
  const resultMessages = hasMore ? messages.slice(0, limit) : messages;
  const nextCursor = hasMore ? resultMessages[resultMessages.length - 1]?.id : null;

  return {
    messages: resultMessages.map(transformMessage),
    hasMore,
    nextCursor,
  };
}

export async function getMessageById(
  userId: string,
  messageId: string
): Promise<MessageWithSender> {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
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
      replyTo: true,
      room: {
        include: {
          members: {
            where: { userId },
          },
        },
      },
    },
  });

  if (!message) {
    throw new MessageNotFoundError();
  }

  // Check if user has access to this message
  if (message.room.members.length === 0) {
    throw new RoomAccessDeniedError();
  }

  return transformMessage(message);
}

export async function updateMessage(
  userId: string,
  messageId: string,
  content: string
): Promise<MessageWithSender> {
  // Find message and verify ownership
  const existingMessage = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!existingMessage) {
    throw new MessageNotFoundError();
  }

  if (existingMessage.senderId !== userId) {
    throw new ForbiddenError('You can only edit your own messages');
  }

  // Update message
  const message = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      editedAt: new Date(),
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
      replyTo: true,
    },
  });

  const transformedMessage = transformMessage(message);

  // Publish update to Redis
  await publish(REDIS_CHANNELS.MESSAGES.UPDATE, {
    message: transformedMessage,
    roomId: message.roomId,
  });

  return transformedMessage;
}

export async function deleteMessage(
  userId: string,
  messageId: string
): Promise<void> {
  // Find message and verify ownership
  const existingMessage = await prisma.message.findUnique({
    where: { id: messageId },
    include: {
      room: {
        include: {
          members: {
            where: { userId, role: { in: ['OWNER', 'ADMIN'] } },
          },
        },
      },
    },
  });

  if (!existingMessage) {
    throw new MessageNotFoundError();
  }

  // User can delete if they're the sender or an admin/owner of the room
  const canDelete =
    existingMessage.senderId === userId ||
    existingMessage.room.members.length > 0;

  if (!canDelete) {
    throw new ForbiddenError('You cannot delete this message');
  }

  // Soft delete
  await prisma.message.update({
    where: { id: messageId },
    data: { deletedAt: new Date() },
  });

  // Publish deletion to Redis
  await publish(REDIS_CHANNELS.MESSAGES.DELETE, {
    messageId,
    roomId: existingMessage.roomId,
  });
}
