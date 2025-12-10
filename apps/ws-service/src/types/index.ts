import WebSocket from 'ws';
import { WSEventType, MessageType } from '@kuraxx/types';

// Extended WebSocket with custom properties
export interface ExtendedWebSocket extends WebSocket {
  id: string;
  userId?: string;
  username?: string;
  isAlive: boolean;
  rooms: Set<string>;
  lastActivity: number;
}

// Client message payload types
export interface WSClientMessage {
  type: WSEventType;
  payload: unknown;
  requestId?: string;
}

export interface WSAuthenticatePayload {
  token: string;
}

export interface WSJoinRoomPayload {
  roomId: string;
}

export interface WSLeaveRoomPayload {
  roomId: string;
}

export interface WSSendMessagePayload {
  roomId: string;
  content: string;
  type: MessageType;
  tempId?: string;
  replyToId?: string;
}

export interface WSTypingPayload {
  roomId: string;
}

// Server message types
export interface WSServerMessage<T = unknown> {
  type: WSEventType | string;
  payload: T;
  timestamp: number;
  requestId?: string;
}

export interface WSErrorPayload {
  code: string;
  message: string;
}

export interface WSAuthenticatedPayload {
  userId: string;
  username: string;
}

export interface WSMessageSavedPayload {
  message: {
    id: string;
    content: string;
    type: MessageType;
    roomId: string;
    senderId: string;
    createdAt: Date;
    sender: {
      id: string;
      username: string;
      displayName: string | null;
      avatarUrl: string | null;
    };
  };
  tempId?: string;
}

export interface WSPresencePayload {
  userId: string;
  username: string;
  isOnline: boolean;
  lastSeenAt?: Date;
}

export interface WSTypingIndicatorPayload {
  userId: string;
  username: string;
  roomId: string;
  isTyping: boolean;
}

// Connection manager types
export interface ConnectionInfo {
  socket: ExtendedWebSocket;
  userId: string;
  username: string;
  connectedAt: Date;
  rooms: Set<string>;
}
