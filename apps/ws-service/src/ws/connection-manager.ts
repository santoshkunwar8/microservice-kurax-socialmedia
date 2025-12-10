import type { ExtendedWebSocket, ConnectionInfo } from '../types';
import { WSEventType } from '@kuraxx/types';

class ConnectionManager {
  // Map of userId to array of sockets (user can have multiple connections)
  private userConnections: Map<string, Set<ExtendedWebSocket>> = new Map();
  
  // Map of socketId to socket
  private sockets: Map<string, ExtendedWebSocket> = new Map();
  
  // Map of roomId to set of user IDs
  private roomMembers: Map<string, Set<string>> = new Map();

  /**
   * Add a new connection
   */
  addConnection(socket: ExtendedWebSocket): void {
    this.sockets.set(socket.id, socket);
    
    if (socket.userId) {
      if (!this.userConnections.has(socket.userId)) {
        this.userConnections.set(socket.userId, new Set());
      }
      this.userConnections.get(socket.userId)!.add(socket);
    }
  }

  /**
   * Remove a connection
   */
  removeConnection(socket: ExtendedWebSocket): void {
    this.sockets.delete(socket.id);
    
    if (socket.userId) {
      const userSockets = this.userConnections.get(socket.userId);
      if (userSockets) {
        userSockets.delete(socket);
        if (userSockets.size === 0) {
          this.userConnections.delete(socket.userId);
        }
      }
    }

    // Remove from all rooms
    socket.rooms.forEach((roomId) => {
      this.leaveRoom(socket, roomId);
    });
  }

  /**
   * Authenticate a connection
   */
  authenticateConnection(
    socket: ExtendedWebSocket,
    userId: string,
    username: string
  ): void {
    socket.userId = userId;
    socket.username = username;
    
    if (!this.userConnections.has(userId)) {
      this.userConnections.set(userId, new Set());
    }
    this.userConnections.get(userId)!.add(socket);
  }

  /**
   * Join a room
   */
  joinRoom(socket: ExtendedWebSocket, roomId: string): void {
    socket.rooms.add(roomId);
    
    if (!this.roomMembers.has(roomId)) {
      this.roomMembers.set(roomId, new Set());
    }
    
    if (socket.userId) {
      this.roomMembers.get(roomId)!.add(socket.userId);
    }
  }

  /**
   * Leave a room
   */
  leaveRoom(socket: ExtendedWebSocket, roomId: string): void {
    socket.rooms.delete(roomId);
    
    if (socket.userId) {
      const roomUsers = this.roomMembers.get(roomId);
      if (roomUsers) {
        // Only remove if no other connections for this user are in the room
        const userSockets = this.userConnections.get(socket.userId);
        const hasOtherConnectionsInRoom = userSockets
          ? Array.from(userSockets).some(
              (s) => s.id !== socket.id && s.rooms.has(roomId)
            )
          : false;

        if (!hasOtherConnectionsInRoom) {
          roomUsers.delete(socket.userId);
        }

        if (roomUsers.size === 0) {
          this.roomMembers.delete(roomId);
        }
      }
    }
  }

  /**
   * Get a socket by ID
   */
  getSocket(socketId: string): ExtendedWebSocket | undefined {
    return this.sockets.get(socketId);
  }

  /**
   * Get all sockets for a user
   */
  getUserSockets(userId: string): ExtendedWebSocket[] {
    return Array.from(this.userConnections.get(userId) || []);
  }

  /**
   * Check if user is online
   */
  isUserOnline(userId: string): boolean {
    const sockets = this.userConnections.get(userId);
    return sockets !== undefined && sockets.size > 0;
  }

  /**
   * Get all online user IDs
   */
  getOnlineUserIds(): string[] {
    return Array.from(this.userConnections.keys());
  }

  /**
   * Get all sockets in a room
   */
  getRoomSockets(roomId: string): ExtendedWebSocket[] {
    const userIds = this.roomMembers.get(roomId);
    if (!userIds) return [];

    const sockets: ExtendedWebSocket[] = [];
    userIds.forEach((userId) => {
      const userSockets = this.getUserSockets(userId);
      userSockets.forEach((socket) => {
        if (socket.rooms.has(roomId)) {
          sockets.push(socket);
        }
      });
    });

    return sockets;
  }

  /**
   * Get user IDs in a room
   */
  getRoomUserIds(roomId: string): string[] {
    return Array.from(this.roomMembers.get(roomId) || []);
  }

  /**
   * Send message to a specific socket
   */
  sendToSocket(
    socket: ExtendedWebSocket,
    type: WSEventType | string,
    payload: unknown,
    requestId?: string
  ): void {
    if (socket.readyState === socket.OPEN) {
      const message = JSON.stringify({
        type,
        payload,
        timestamp: Date.now(),
        requestId,
      });
      socket.send(message);
    }
  }

  /**
   * Send message to a specific user (all their connections)
   */
  sendToUser(
    userId: string,
    type: WSEventType | string,
    payload: unknown
  ): void {
    const sockets = this.getUserSockets(userId);
    sockets.forEach((socket) => {
      this.sendToSocket(socket, type, payload);
    });
  }

  /**
   * Send message to all users in a room
   */
  sendToRoom(
    roomId: string,
    type: WSEventType | string,
    payload: unknown,
    excludeUserId?: string
  ): void {
    const sockets = this.getRoomSockets(roomId);
    sockets.forEach((socket) => {
      if (!excludeUserId || socket.userId !== excludeUserId) {
        this.sendToSocket(socket, type, payload);
      }
    });
  }

  /**
   * Broadcast to all connected clients
   */
  broadcast(
    type: WSEventType | string,
    payload: unknown,
    excludeUserId?: string
  ): void {
    this.sockets.forEach((socket) => {
      if (socket.userId && (!excludeUserId || socket.userId !== excludeUserId)) {
        this.sendToSocket(socket, type, payload);
      }
    });
  }

  /**
   * Get connection stats
   */
  getStats(): {
    totalConnections: number;
    uniqueUsers: number;
    activeRooms: number;
  } {
    return {
      totalConnections: this.sockets.size,
      uniqueUsers: this.userConnections.size,
      activeRooms: this.roomMembers.size,
    };
  }
}

// Export singleton instance
export const connectionManager = new ConnectionManager();
export default connectionManager;
