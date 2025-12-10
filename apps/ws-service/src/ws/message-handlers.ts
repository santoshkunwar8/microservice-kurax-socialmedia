import { z } from 'zod';
import { WSEventType, MessageType } from '@kuraxx/types';
import type { ExtendedWebSocket, WSClientMessage } from '../types';
import { connectionManager } from './connection-manager';
import { verifyToken } from '../utils/jwt';
import { publish } from '../config/redis';
import { REDIS_CHANNELS } from '@kuraxx/constants';

// Validation schemas
const authenticateSchema = z.object({
  token: z.string().min(1),
});

const joinRoomSchema = z.object({
  roomId: z.string().uuid(),
});

const leaveRoomSchema = z.object({
  roomId: z.string().uuid(),
});

const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']).default('TEXT'),
  tempId: z.string().optional(),
  replyToId: z.string().uuid().optional(),
});

const typingSchema = z.object({
  roomId: z.string().uuid(),
});

/**
 * Handle incoming WebSocket messages
 */
export async function handleMessage(
  socket: ExtendedWebSocket,
  rawMessage: string
): Promise<void> {
  let message: WSClientMessage;
  
  try {
    message = JSON.parse(rawMessage);
  } catch {
    sendError(socket, 'INVALID_MESSAGE', 'Invalid JSON message');
    return;
  }

  const { type, payload, requestId } = message;

  try {
    switch (type) {
      case WSEventType.AUTHENTICATE:
        await handleAuthenticate(socket, payload, requestId);
        break;

      case WSEventType.ROOM_JOIN:
        await handleJoinRoom(socket, payload, requestId);
        break;

      case WSEventType.ROOM_LEAVE:
        await handleLeaveRoom(socket, payload, requestId);
        break;

      case WSEventType.MESSAGE_NEW:
        await handleSendMessage(socket, payload, requestId);
        break;

      case WSEventType.TYPING_START:
        await handleTypingStart(socket, payload);
        break;

      case WSEventType.TYPING_STOP:
        await handleTypingStop(socket, payload);
        break;

      default:
        sendError(socket, 'UNKNOWN_EVENT', `Unknown event type: ${type}`, requestId);
    }
  } catch (error) {
    console.error('Message handler error:', error);
    sendError(
      socket,
      'HANDLER_ERROR',
      error instanceof Error ? error.message : 'Unknown error',
      requestId
    );
  }
}

/**
 * Handle authentication
 */
async function handleAuthenticate(
  socket: ExtendedWebSocket,
  payload: unknown,
  requestId?: string
): Promise<void> {
  const result = authenticateSchema.safeParse(payload);
  
  if (!result.success) {
    sendError(socket, 'VALIDATION_ERROR', 'Invalid authentication payload', requestId);
    return;
  }

  try {
    const tokenPayload = verifyToken(result.data.token);
    
    // Authenticate the connection
    connectionManager.authenticateConnection(
      socket,
      tokenPayload.userId,
      tokenPayload.username
    );

    // Send success response
    connectionManager.sendToSocket(socket, WSEventType.AUTHENTICATED, {
      userId: tokenPayload.userId,
      username: tokenPayload.username,
    }, requestId);

    // Publish presence online event
    await publish(REDIS_CHANNELS.PRESENCE.ONLINE, {
      userId: tokenPayload.userId,
      username: tokenPayload.username,
      isOnline: true,
      timestamp: Date.now(),
    });

    console.log(`User ${tokenPayload.username} authenticated`);
  } catch (error) {
    sendError(socket, 'AUTH_FAILED', 'Authentication failed', requestId);
  }
}

/**
 * Handle joining a room
 */
async function handleJoinRoom(
  socket: ExtendedWebSocket,
  payload: unknown,
  requestId?: string
): Promise<void> {
  if (!socket.userId) {
    sendError(socket, 'NOT_AUTHENTICATED', 'Please authenticate first', requestId);
    return;
  }

  const result = joinRoomSchema.safeParse(payload);
  
  if (!result.success) {
    sendError(socket, 'VALIDATION_ERROR', 'Invalid room ID', requestId);
    return;
  }

  const { roomId } = result.data;

  // Join the room
  connectionManager.joinRoom(socket, roomId);

  // Send confirmation
  connectionManager.sendToSocket(socket, WSEventType.ROOM_JOIN, {
    roomId,
    success: true,
  }, requestId);

  // Notify room members
  await publish(REDIS_CHANNELS.ROOM.JOIN, {
    roomId,
    userId: socket.userId,
    username: socket.username,
  });

  console.log(`User ${socket.username} joined room ${roomId}`);
}

/**
 * Handle leaving a room
 */
async function handleLeaveRoom(
  socket: ExtendedWebSocket,
  payload: unknown,
  requestId?: string
): Promise<void> {
  if (!socket.userId) {
    sendError(socket, 'NOT_AUTHENTICATED', 'Please authenticate first', requestId);
    return;
  }

  const result = leaveRoomSchema.safeParse(payload);
  
  if (!result.success) {
    sendError(socket, 'VALIDATION_ERROR', 'Invalid room ID', requestId);
    return;
  }

  const { roomId } = result.data;

  // Leave the room
  connectionManager.leaveRoom(socket, roomId);

  // Send confirmation
  connectionManager.sendToSocket(socket, WSEventType.ROOM_LEAVE, {
    roomId,
    success: true,
  }, requestId);

  // Notify room members
  await publish(REDIS_CHANNELS.ROOM.LEAVE, {
    roomId,
    userId: socket.userId,
    username: socket.username,
  });

  console.log(`User ${socket.username} left room ${roomId}`);
}

/**
 * Handle sending a message
 */
async function handleSendMessage(
  socket: ExtendedWebSocket,
  payload: unknown,
  requestId?: string
): Promise<void> {
  if (!socket.userId) {
    sendError(socket, 'NOT_AUTHENTICATED', 'Please authenticate first', requestId);
    return;
  }

  const result = sendMessageSchema.safeParse(payload);
  
  if (!result.success) {
    sendError(socket, 'VALIDATION_ERROR', 'Invalid message payload', requestId);
    return;
  }

  const { roomId, content, type, tempId, replyToId } = result.data;

  // Check if user is in the room
  if (!socket.rooms.has(roomId)) {
    sendError(socket, 'NOT_IN_ROOM', 'You are not in this room', requestId);
    return;
  }

  // Publish new message event to Redis (API service will save to DB)
  await publish(REDIS_CHANNELS.MESSAGES.NEW, {
    roomId,
    content,
    type,
    tempId,
    replyToId,
    senderId: socket.userId,
    senderUsername: socket.username,
    timestamp: Date.now(),
  });

  console.log(`Message from ${socket.username} in room ${roomId}`);
}

/**
 * Handle typing start
 */
async function handleTypingStart(
  socket: ExtendedWebSocket,
  payload: unknown
): Promise<void> {
  if (!socket.userId) return;

  const result = typingSchema.safeParse(payload);
  if (!result.success) return;

  const { roomId } = result.data;

  // Publish typing event
  await publish(REDIS_CHANNELS.TYPING.START, {
    roomId,
    userId: socket.userId,
    username: socket.username,
    isTyping: true,
  });
}

/**
 * Handle typing stop
 */
async function handleTypingStop(
  socket: ExtendedWebSocket,
  payload: unknown
): Promise<void> {
  if (!socket.userId) return;

  const result = typingSchema.safeParse(payload);
  if (!result.success) return;

  const { roomId } = result.data;

  // Publish typing stop event
  await publish(REDIS_CHANNELS.TYPING.STOP, {
    roomId,
    userId: socket.userId,
    username: socket.username,
    isTyping: false,
  });
}

/**
 * Handle connection close
 */
export async function handleClose(socket: ExtendedWebSocket): Promise<void> {
  if (socket.userId) {
    // Check if user has other active connections
    const isStillOnline = connectionManager.isUserOnline(socket.userId);

    if (!isStillOnline) {
      // Publish presence offline event
      await publish(REDIS_CHANNELS.PRESENCE.OFFLINE, {
        userId: socket.userId,
        username: socket.username,
        isOnline: false,
        timestamp: Date.now(),
      });
    }

    console.log(`User ${socket.username} disconnected`);
  }

  connectionManager.removeConnection(socket);
}

/**
 * Send error to socket
 */
function sendError(
  socket: ExtendedWebSocket,
  code: string,
  message: string,
  requestId?: string
): void {
  connectionManager.sendToSocket(
    socket,
    WSEventType.ERROR,
    { code, message },
    requestId
  );
}
