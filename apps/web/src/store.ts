import { create } from 'zustand';
import type { User, AuthTokens } from '@kuraxx/types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  
  setAuth: (user: User, tokens: AuthTokens) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => {
  // Initialize from localStorage
  const accessToken = localStorage.getItem('access_token');
  const refreshToken = localStorage.getItem('refresh_token');

  return {
    user: null,
    accessToken,
    refreshToken,
    isAuthenticated: !!accessToken,

    setAuth: (user, tokens) => {
      localStorage.setItem('access_token', tokens.accessToken);
      localStorage.setItem('refresh_token', tokens.refreshToken);
      set({
        user,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        isAuthenticated: true,
      });
    },

    logout: () => {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
      });
    },

    setUser: (user) => {
      set({ user });
    },
  };
});

interface ChatStore {
  selectedRoomId: string | null;
  messages: any[];
  rooms: any[];
  typingUsers: Map<string, boolean>;

  setSelectedRoom: (roomId: string | null) => void;
  addMessage: (message: any) => void;
  replaceMessage: (tempId: string, realMessage: any) => void;
  setMessages: (messages: any[]) => void;
  setRooms: (rooms: any[]) => void;
  setTypingUser: (userId: string, isTyping: boolean) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  selectedRoomId: null,
  messages: [],
  rooms: [],
  typingUsers: new Map(),

  setSelectedRoom: (roomId) => set({ selectedRoomId: roomId }),
  addMessage: (message) =>
    set((state) => {
      // Prevent duplicates
      if (state.messages.some((m) => m.id === message.id)) {
        return state;
      }
      return { messages: [...state.messages, message] };
    }),
  replaceMessage: (tempId, realMessage) =>
    set((state) => {
      // If the real message already exists (e.g. from WS), just remove the temp one
      if (state.messages.some((m) => m.id === realMessage.id)) {
        return {
          messages: state.messages.filter((m) => m.id !== tempId),
        };
      }
      // Otherwise replace temp with real
      return {
        messages: state.messages.map((m) =>
          m.id === tempId ? realMessage : m
        ),
      };
    }),
  setMessages: (messages) => set({ messages }),
  setRooms: (rooms) => set({ rooms }),
  setTypingUser: (userId, isTyping) =>
    set((state) => {
      const newTypingUsers = new Map(state.typingUsers);
      if (isTyping) {
        newTypingUsers.set(userId, true);
      } else {
        newTypingUsers.delete(userId);
      }
      return { typingUsers: newTypingUsers };
    }),
}));
