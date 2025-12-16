// Shared Constants for KuraXX Chat Application

// ============= Redis Channels =============
export const REDIS_CHANNELS = {
  MESSAGES: {
    NEW: 'messages:new',
    SAVED: 'messages:saved',
    UPDATE: 'messages:update',
    DELETE: 'messages:delete',
  },
  PRESENCE: {
    ONLINE: 'presence:online',
    OFFLINE: 'presence:offline',
    SYNC: 'presence:sync',
  },
  TYPING: {
    START: 'typing:start',
    STOP: 'typing:stop',
  },
  ROOM: {
    JOIN: 'room:join',
    LEAVE: 'room:leave',
    UPDATE: 'room:update',
    CREATED: 'room:created',
  },
  POSTS: {
    NEW: 'posts:new',
    UPDATE: 'posts:update',
    DELETE: 'posts:delete',
    COMMENT: 'posts:comment',
    LIKE: 'posts:like',
  },
  RESOURCES: {
    NEW: 'resources:new',
    DELETE: 'resources:delete',
  },
} as const;

// ============= API Routes =============
export const API_ROUTES = {
  AUTH: {
    BASE: '/auth',
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
  },
  MESSAGES: {
    BASE: '/messages',
    SEND: '/messages/send',
    HISTORY: '/messages/history',
    BY_ID: '/messages/:id',
  },
  ROOMS: {
    BASE: '/rooms',
    CREATE: '/rooms/create',
    LIST: '/rooms/list',
    BY_ID: '/rooms/:id',
    MEMBERS: '/rooms/:id/members',
    JOIN: '/rooms/:id/join',
    LEAVE: '/rooms/:id/leave',
  },
  UPLOAD: {
    BASE: '/upload',
    FILE: '/upload/file',
    IMAGE: '/upload/image',
    SIGNED_URL: '/upload/signed-url',
  },
  USERS: {
    BASE: '/users',
    BY_ID: '/users/:id',
    SEARCH: '/users/search',
  },
} as const;

// ============= Auth Constants =============
export const AUTH_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '15m',
  REFRESH_TOKEN_EXPIRY: '7d',
  ACCESS_TOKEN_EXPIRY_MS: 15 * 60 * 1000, // 15 minutes
  REFRESH_TOKEN_EXPIRY_MS: 7 * 24 * 60 * 60 * 1000, // 7 days
  SALT_ROUNDS: 12,
  TOKEN_COOKIE_NAME: 'refresh_token',
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 128,
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 30,
} as const;

// ============= Pagination Constants =============
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
  DEFAULT_MESSAGE_LIMIT: 50,
  MAX_MESSAGE_LIMIT: 100,
} as const;

// ============= File Upload Constants =============
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  MAX_IMAGE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'audio/webm', // allow voice message uploads
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'application/zip',
    'application/x-rar-compressed',
  ],
  SIGNED_URL_EXPIRY: 15 * 60, // 15 minutes in seconds
  STORAGE_PATHS: {
    AVATARS: 'avatars',
    MESSAGES: 'messages',
    ROOMS: 'rooms',
    ATTACHMENTS: 'attachments',
  },
} as const;

// ============= WebSocket Constants =============
export const WS_CONFIG = {
  HEARTBEAT_INTERVAL: 30000, // 30 seconds
  HEARTBEAT_TIMEOUT: 10000, // 10 seconds
  RECONNECT_INTERVAL: 5000, // 5 seconds
  MAX_RECONNECT_ATTEMPTS: 5,
  MESSAGE_QUEUE_SIZE: 100,
  TYPING_TIMEOUT: 3000, // 3 seconds
} as const;

// ============= Error Codes =============
export const ERROR_CODES = {
  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'AUTH_INVALID_CREDENTIALS',
  AUTH_TOKEN_EXPIRED: 'AUTH_TOKEN_EXPIRED',
  AUTH_TOKEN_INVALID: 'AUTH_TOKEN_INVALID',
  AUTH_UNAUTHORIZED: 'AUTH_UNAUTHORIZED',
  AUTH_USER_EXISTS: 'AUTH_USER_EXISTS',
  AUTH_USER_NOT_FOUND: 'AUTH_USER_NOT_FOUND',
  
  // Validation errors
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  
  // Resource errors
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  RESOURCE_EXISTS: 'RESOURCE_EXISTS',
  
  // Room errors
  ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
  ROOM_ACCESS_DENIED: 'ROOM_ACCESS_DENIED',
  ROOM_MEMBER_EXISTS: 'ROOM_MEMBER_EXISTS',
  
  // Message errors
  MESSAGE_NOT_FOUND: 'MESSAGE_NOT_FOUND',
  MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
  
  // File errors
  FILE_TOO_LARGE: 'FILE_TOO_LARGE',
  FILE_TYPE_NOT_ALLOWED: 'FILE_TYPE_NOT_ALLOWED',
  FILE_UPLOAD_FAILED: 'FILE_UPLOAD_FAILED',
  
  // Server errors
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// ============= Room Constants =============
export const ROOM_CONFIG = {
  MAX_GROUP_MEMBERS: 100,
  MAX_CHANNEL_MEMBERS: 1000,
  MAX_NAME_LENGTH: 100,
  MAX_DESCRIPTION_LENGTH: 500,
} as const;

// ============= Message Constants =============
export const MESSAGE_CONFIG = {
  MAX_CONTENT_LENGTH: 5000,
  MAX_ATTACHMENTS_PER_MESSAGE: 10,
} as const;
