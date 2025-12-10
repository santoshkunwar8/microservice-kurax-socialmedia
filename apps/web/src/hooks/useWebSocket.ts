import { useEffect, useRef } from 'react';
import { useChatStore } from '../store';
import type { WSEventType } from '@kuraxx/types';

class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private token: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  constructor(url: string) {
    this.url = url;
  }

  connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.token = token;
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.authenticate();
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event.data);
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

        this.ws.onclose = () => {
          console.log('WebSocket closed');
          this.attemptReconnect();
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  private authenticate(): void {
    if (!this.token) return;
    this.send('authenticate', { token: this.token });
  }

  private handleMessage(data: string): void {
    try {
      const message = JSON.parse(data);
      const { type, payload } = message;

      console.log('WS Message:', type, payload);

      switch (type) {
        case 'authenticated':
          console.log('Authenticated:', payload);
          break;
        case 'message:saved':
          useChatStore.setState((state) => ({
            messages: [...state.messages, payload.message],
          }));
          break;
        case 'typing:start':
          useChatStore.getState().setTypingUser(payload.userId, true);
          break;
        case 'typing:stop':
          useChatStore.getState().setTypingUser(payload.userId, false);
          break;
        default:
          console.log('Unhandled message type:', type);
      }
    } catch (error) {
      console.error('Error handling WebSocket message:', error);
    }
  }

  send(type: WSEventType | string, payload: unknown): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('WebSocket not connected');
      return;
    }
    this.ws.send(JSON.stringify({ type, payload }));
  }

  joinRoom(roomId: string): void {
    this.send('room:join', { roomId });
  }

  leaveRoom(roomId: string): void {
    this.send('room:leave', { roomId });
  }

  sendMessage(roomId: string, content: string, tempId?: string): void {
    this.send('message:new', {
      roomId,
      content,
      type: 'TEXT',
      tempId,
    });
  }

  startTyping(roomId: string): void {
    this.send('typing:start', { roomId });
  }

  stopTyping(roomId: string): void {
    this.send('typing:stop', { roomId });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts && this.token) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... Attempt ${this.reconnectAttempts}`);
        this.connect(this.token!).catch(console.error);
      }, 1000 * Math.pow(2, this.reconnectAttempts));
    }
  }
}

export const wsManager = new WebSocketManager(
  import.meta.env.VITE_WS_URL || `ws://${window.location.hostname}:3002`
);

export function useWebSocket(token: string | null) {
  useEffect(() => {
    if (!token) return;

    wsManager.connect(token).catch(console.error);

    return () => {
      wsManager.disconnect();
    };
  }, [token]);
}
