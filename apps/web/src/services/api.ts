import axios from "axios";
import { useAuthStore } from "../store";
import type { AuthResponse, ApiResponse, Room } from "@kuraxx/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = useAuthStore.getState().refreshToken;
        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        const response = await api.post<ApiResponse<AuthResponse>>("/auth/refresh", {
          refreshToken,
        });

        if (!response.data.success || !response.data.data) {
          throw new Error('Refresh failed');
        }

        const {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
          user,
        } = response.data.data;
        useAuthStore.getState().setAuth(user, {
          accessToken,
          refreshToken: newRefreshToken,
          expiresIn,
        });

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (err) {
        useAuthStore.getState().logout();
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

export const apiClient = {
  // Auth endpoints
  auth: {
    login: (email: string, password: string) =>
      api.post<ApiResponse<AuthResponse>>("/auth/login", { email, password }),
    register: (
      email: string,
      password: string,
      username: string,
      displayName: string
    ) => {
      const registerPayload = {
        email,
        password,
        username,
        displayName,
      };
      console.log(`regsiter payload`, registerPayload);

      return api.post<ApiResponse<AuthResponse>>("/auth/register", registerPayload);
    },
    refresh: (refreshToken: string) =>
      api.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }),
    logout: () => api.post("/auth/logout"),
  },

  // Room endpoints
  rooms: {
    listRooms: () =>
      api.get<{
        success: boolean;
        data: { rooms: Room[] };
      }>("/rooms/list"),
    discoverRooms: () =>
      api.get<{
        success: boolean;
        data: { rooms: Room[] };
      }>("/rooms/discover"),
    createRoom: (name: string, type: string = "GROUP", topics: string[] = []) =>
      api.post("/rooms/create", { name, type, topics }),
    joinRoom: (roomId: string) => api.post(`/rooms/${roomId}/join`),
    leaveRoom: (roomId: string) => api.post(`/rooms/${roomId}/leave`),
    getRoomById: (roomId: string) =>
      api.get(`/rooms/${roomId}`),
    getRoomMembers: (roomId: string, page = 1, limit = 50) =>
      api.get(`/rooms/${roomId}/members`, {
        params: { page, limit }
      }),
    getRoomMessages: (roomId: string, skip = 0, take = 50) =>
      api.get(`/messages/history`, {
        params: { roomId, limit: take }
      }),
    updateRoom: (roomId: string, data: any) =>
      api.patch(`/rooms/${roomId}`, data),
    deleteRoom: (roomId: string) => api.delete(`/rooms/${roomId}`),
  },

  // Message endpoints
  messages: {
    sendMessage: (roomId: string, content: string, tempId?: string) =>
      api.post(`/messages/send`, { roomId, content, tempId }),
    updateMessage: (messageId: string, content: string) =>
      api.patch(`/messages/${messageId}`, { content }),
    deleteMessage: (messageId: string) => api.delete(`/messages/${messageId}`),
  },

  // User endpoints
  users: {
    searchUsers: (query: string) =>
      api.get(`/users/search?q=${encodeURIComponent(query)}`),
    getProfile: () => api.get("/auth/me"),
    updateProfile: (displayName: string, avatar?: string) =>
      api.patch("/users/me", { displayName, avatar }),
  },

  // Stats endpoints
  stats: {
    getStats: () =>
      api.get<{
        success: boolean;
        data: {
          onlineUsers: number;
          totalUsers: number;
          activeRooms: number;
          totalRooms: number;
          messagesToday: number;
          messagesTotal: number;
        };
      }>("/stats"),
  },

  // Upload endpoints
  upload: {
    uploadFile: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return api.post("/upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    uploadImage: (file: File, purpose: string = 'message') => {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("purpose", purpose);
      return api.post("/upload/image", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
    },
    deleteFile: (fileId: string) => api.delete(`/upload/${fileId}`),
  },

  // Posts endpoints
  posts: {
    createPost: (roomId: string, content: string, attachments?: string[]) =>
      api.post("/posts", { roomId, content, attachments }),
    getPosts: (roomId: string, page: number = 1, limit: number = 20) =>
      api.get(`/posts/room/${roomId}`, { params: { page, limit } }),
    getComments: (postId: string, page: number = 1, limit: number = 50) =>
      api.get(`/posts/${postId}/comments`, { params: { page, limit } }),
    addComment: (postId: string, content: string) =>
      api.post(`/posts/${postId}/comments`, { content }),
    likePost: (postId: string) => api.post(`/posts/${postId}/like`),
    deletePost: (postId: string) => api.delete(`/posts/${postId}`),
  },

  // Resources endpoints
  resources: {
    createResource: (roomId: string, title: string, type: string, fileUrl?: string) =>
      api.post("/resources", { roomId, title, type, fileUrl }),
    getResources: (roomId: string, page: number = 1, limit: number = 20) =>
      api.get(`/resources/room/${roomId}`, { params: { page, limit } }),
    deleteResource: (resourceId: string) => api.delete(`/resources/${resourceId}`),
  },
};

export type ApiClient = typeof apiClient;
