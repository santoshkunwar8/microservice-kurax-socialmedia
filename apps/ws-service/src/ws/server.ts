import WebSocket, { WebSocketServer } from 'ws';
import http from 'http';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { connectionManager } from './connection-manager';
import { handleMessage, handleClose } from './message-handlers';
import type { ExtendedWebSocket } from '../types';

let wss: WebSocketServer;

/**
 * Create and configure WebSocket server
 */
export function createWebSocketServer(server: http.Server): WebSocketServer {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    const socket = ws as ExtendedWebSocket;
    
    // Initialize socket properties
    socket.id = uuidv4();
    socket.isAlive = true;
    socket.rooms = new Set();
    socket.lastActivity = Date.now();

    console.log(`New connection: ${socket.id}`);

    // Add to connection manager
    connectionManager.addConnection(socket);

    // Handle pong for heartbeat
    socket.on('pong', () => {
      socket.isAlive = true;
      socket.lastActivity = Date.now();
    });

    // Handle incoming messages
    socket.on('message', async (data: WebSocket.RawData) => {
      try {
        socket.lastActivity = Date.now();
        const message = data.toString();
        await handleMessage(socket, message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    // Handle connection close
    socket.on('close', async () => {
      console.log(`Connection closed: ${socket.id}`);
      await handleClose(socket);
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  // Start heartbeat interval
  startHeartbeat();

  console.log('WebSocket server created');
  return wss;
}

/**
 * Start heartbeat to detect dead connections
 */
function startHeartbeat(): void {
  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      const socket = ws as ExtendedWebSocket;

      if (!socket.isAlive) {
        console.log(`Terminating dead connection: ${socket.id}`);
        return socket.terminate();
      }

      socket.isAlive = false;
      socket.ping();
    });

    // Log stats periodically
    const stats = connectionManager.getStats();
    console.log(
      `WS Stats - Connections: ${stats.totalConnections}, Users: ${stats.uniqueUsers}, Rooms: ${stats.activeRooms}`
    );
  }, config.heartbeatInterval);

  // Clean up on server close
  wss.on('close', () => {
    clearInterval(interval);
  });
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer(): WebSocketServer {
  if (!wss) {
    throw new Error('WebSocket server not initialized');
  }
  return wss;
}

/**
 * Close WebSocket server
 */
export async function closeWebSocketServer(): Promise<void> {
  return new Promise((resolve) => {
    if (!wss) {
      resolve();
      return;
    }

    // Close all connections
    wss.clients.forEach((client) => {
      client.close(1000, 'Server shutting down');
    });

    wss.close(() => {
      console.log('WebSocket server closed');
      resolve();
    });
  });
}
