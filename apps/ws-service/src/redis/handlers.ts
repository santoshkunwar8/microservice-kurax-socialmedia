import { connectionManager } from '../ws/connection-manager';
import { WSEventType } from '@kuraxx/types';
import { REDIS_CHANNELS } from '@kuraxx/constants';

interface RedisMessagePayload {
  message: unknown;
  roomId: string;
  tempId?: string;
}

interface RedisPresencePayload {
  userId: string;
  username: string;
  isOnline: boolean;
  timestamp: number;
}

interface RedisTypingPayload {
  roomId: string;
  userId: string;
  username: string;
  isTyping: boolean;
}

interface RedisRoomEventPayload {
  roomId: string;
  userId: string;
  username: string;
}

interface RedisPostPayload {
  post: unknown;
  roomId: string;
}

interface RedisResourcePayload {
  resource: unknown;
  roomId: string;
}

/**
 * Handle incoming Redis messages and broadcast to appropriate clients
 */
export function handleRedisMessage(channel: string, data: unknown): void {
  console.log(`Redis message on channel: ${channel}`);

  switch (channel) {
    case REDIS_CHANNELS.MESSAGES.SAVED:
      handleMessageSaved(data as RedisMessagePayload);
      break;

    case REDIS_CHANNELS.MESSAGES.UPDATE:
      handleMessageUpdate(data as RedisMessagePayload);
      break;

    case REDIS_CHANNELS.MESSAGES.DELETE:
      handleMessageDelete(data as { messageId: string; roomId: string });
      break;

    case REDIS_CHANNELS.PRESENCE.ONLINE:
      handlePresenceOnline(data as RedisPresencePayload);
      break;

    case REDIS_CHANNELS.PRESENCE.OFFLINE:
      handlePresenceOffline(data as RedisPresencePayload);
      break;

    case REDIS_CHANNELS.TYPING.START:
    case REDIS_CHANNELS.TYPING.STOP:
      handleTyping(data as RedisTypingPayload);
      break;

    case REDIS_CHANNELS.ROOM.JOIN:
      handleRoomJoin(data as RedisRoomEventPayload);
      break;

    case REDIS_CHANNELS.ROOM.LEAVE:
      handleRoomLeave(data as RedisRoomEventPayload);
      break;

    // Post events
    case REDIS_CHANNELS.POSTS.NEW:
      handlePostNew(data as RedisPostPayload);
      break;

    case REDIS_CHANNELS.POSTS.DELETE:
      handlePostDelete(data as { postId: string; roomId: string });
      break;

    case REDIS_CHANNELS.POSTS.COMMENT:
      handlePostComment(data as { comment: unknown; postId: string; roomId: string });
      break;

    case REDIS_CHANNELS.POSTS.LIKE:
      handlePostLike(data as { postId: string; roomId: string; likes: number });
      break;

    // Resource events
    case REDIS_CHANNELS.RESOURCES.NEW:
      handleResourceNew(data as RedisResourcePayload);
      break;

    case REDIS_CHANNELS.RESOURCES.DELETE:
      handleResourceDelete(data as { resourceId: string; roomId: string });
      break;

    default:
      console.log(`Unhandled Redis channel: ${channel}`);
  }
}

/**
 * Handle saved message - broadcast to room members
 */
function handleMessageSaved(data: RedisMessagePayload): void {
  const { message, roomId, tempId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.MESSAGE_SAVED, {
    message,
    tempId,
  });

  console.log(`Broadcasted saved message to room ${roomId}`);
}

/**
 * Handle message update - broadcast to room members
 */
function handleMessageUpdate(data: RedisMessagePayload): void {
  const { message, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.MESSAGE_UPDATE, {
    message,
  });

  console.log(`Broadcasted message update to room ${roomId}`);
}

/**
 * Handle message delete - broadcast to room members
 */
function handleMessageDelete(data: { messageId: string; roomId: string }): void {
  const { messageId, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.MESSAGE_DELETE, {
    messageId,
  });

  console.log(`Broadcasted message delete to room ${roomId}`);
}

/**
 * Handle user coming online
 */
function handlePresenceOnline(data: RedisPresencePayload): void {
  const { userId, username, isOnline, timestamp } = data;

  // Broadcast to all connected users
  connectionManager.broadcast(
    WSEventType.PRESENCE_ONLINE,
    { userId, username, isOnline, lastSeenAt: null },
    userId // Exclude the user themselves
  );

  console.log(`User ${username} is now online`);
}

/**
 * Handle user going offline
 */
function handlePresenceOffline(data: RedisPresencePayload): void {
  const { userId, username, isOnline, timestamp } = data;

  // Broadcast to all connected users
  connectionManager.broadcast(
    WSEventType.PRESENCE_OFFLINE,
    { userId, username, isOnline, lastSeenAt: new Date(timestamp) },
    userId
  );

  console.log(`User ${username} is now offline`);
}

/**
 * Handle typing indicator
 */
function handleTyping(data: RedisTypingPayload): void {
  const { roomId, userId, username, isTyping } = data;

  const eventType = isTyping ? WSEventType.TYPING_START : WSEventType.TYPING_STOP;

  connectionManager.sendToRoom(
    roomId,
    eventType,
    { userId, username, roomId, isTyping },
    userId // Exclude the typing user
  );
}

/**
 * Handle room join notification
 */
function handleRoomJoin(data: RedisRoomEventPayload): void {
  const { roomId, userId, username } = data;

  connectionManager.sendToRoom(
    roomId,
    WSEventType.ROOM_JOIN,
    { roomId, userId, username },
    userId
  );

  console.log(`Notified room ${roomId} that ${username} joined`);
}

/**
 * Handle room leave notification
 */
function handleRoomLeave(data: RedisRoomEventPayload): void {
  const { roomId, userId, username } = data;

  connectionManager.sendToRoom(
    roomId,
    WSEventType.ROOM_LEAVE,
    { roomId, userId, username },
    userId
  );

  console.log(`Notified room ${roomId} that ${username} left`);
}

/**
 * Handle new post - broadcast to room members
 */
function handlePostNew(data: RedisPostPayload): void {
  const { post, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.POST_NEW, { post });

  console.log(`Broadcasted new post to room ${roomId}`);
}

/**
 * Handle post delete - broadcast to room members
 */
function handlePostDelete(data: { postId: string; roomId: string }): void {
  const { postId, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.POST_DELETE, { postId });

  console.log(`Broadcasted post delete to room ${roomId}`);
}

/**
 * Handle post comment - broadcast to room members
 */
function handlePostComment(data: { comment: unknown; postId: string; roomId: string }): void {
  const { comment, postId, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.POST_COMMENT, { comment, postId });

  console.log(`Broadcasted new comment on post ${postId} to room ${roomId}`);
}

/**
 * Handle post like - broadcast to room members
 */
function handlePostLike(data: { postId: string; roomId: string; likes: number }): void {
  const { postId, roomId, likes } = data;

  connectionManager.sendToRoom(roomId, WSEventType.POST_LIKE, { postId, likes });

  console.log(`Broadcasted like update on post ${postId} to room ${roomId}`);
}

/**
 * Handle new resource - broadcast to room members
 */
function handleResourceNew(data: RedisResourcePayload): void {
  const { resource, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.RESOURCE_NEW, { resource });

  console.log(`Broadcasted new resource to room ${roomId}`);
}

/**
 * Handle resource delete - broadcast to room members
 */
function handleResourceDelete(data: { resourceId: string; roomId: string }): void {
  const { resourceId, roomId } = data;

  connectionManager.sendToRoom(roomId, WSEventType.RESOURCE_DELETE, { resourceId });

  console.log(`Broadcasted resource delete to room ${roomId}`);
}
