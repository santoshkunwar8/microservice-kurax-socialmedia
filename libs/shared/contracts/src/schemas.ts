import { z } from 'zod';
import { AUTH_CONFIG, MESSAGE_CONFIG, ROOM_CONFIG } from '@kuraxx/constants';

// ============= Common Schemas =============
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(20),
});

export const idParamSchema = z.object({
  id: z.string().uuid(),
});

// ============= Auth Schemas =============
export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  username: z
    .string()
    .min(AUTH_CONFIG.MIN_USERNAME_LENGTH, `Username must be at least ${AUTH_CONFIG.MIN_USERNAME_LENGTH} characters`)
    .max(AUTH_CONFIG.MAX_USERNAME_LENGTH, `Username must be at most ${AUTH_CONFIG.MAX_USERNAME_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  password: z
    .string()
    .min(AUTH_CONFIG.MIN_PASSWORD_LENGTH, `Password must be at least ${AUTH_CONFIG.MIN_PASSWORD_LENGTH} characters`)
    .max(AUTH_CONFIG.MAX_PASSWORD_LENGTH, `Password must be at most ${AUTH_CONFIG.MAX_PASSWORD_LENGTH} characters`),
  displayName: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

// ============= User Schemas =============
export const userPublicSchema = z.object({
  id: z.string().uuid(),
  username: z.string(),
  displayName: z.string().nullable(),
  avatarUrl: z.string().url().nullable(),
  isOnline: z.boolean(),
  lastSeenAt: z.date().nullable(),
});

export const userSchema = userPublicSchema.extend({
  email: z.string().email(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const updateUserSchema = z.object({
  displayName: z.string().max(50).optional(),
  avatarUrl: z.string().url().optional(),
});

export const searchUsersSchema = z.object({
  query: z.string().min(1).max(50),
});

// ============= Room Schemas =============
export const roomTypeSchema = z.enum(['DIRECT', 'GROUP', 'CHANNEL']);

export const createRoomSchema = z.object({
  name: z
    .string()
    .max(ROOM_CONFIG.MAX_NAME_LENGTH)
    .optional(),
  description: z
    .string()
    .max(ROOM_CONFIG.MAX_DESCRIPTION_LENGTH)
    .optional(),
  type: roomTypeSchema.default('GROUP'),
  memberIds: z.array(z.string().uuid()).optional(),
  topics: z.array(z.string()).optional(),
});

export const updateRoomSchema = z.object({
  name: z.string().max(ROOM_CONFIG.MAX_NAME_LENGTH).optional(),
  description: z.string().max(ROOM_CONFIG.MAX_DESCRIPTION_LENGTH).optional(),
  avatarUrl: z.string().url().optional(),
});

export const roomMemberSchema = z.object({
  userId: z.string().uuid(),
  roomId: z.string().uuid(),
  role: z.enum(['OWNER', 'ADMIN', 'MEMBER']),
  joinedAt: z.date(),
});

export const addRoomMemberSchema = z.object({
  userId: z.string().uuid(),
  role: z.enum(['ADMIN', 'MEMBER']).optional().default('MEMBER'),
});

export const roomIdParamSchema = z.object({
  roomId: z.string().uuid(),
});

// ============= Message Schemas =============
export const messageTypeSchema = z.enum(['TEXT', 'IMAGE', 'FILE', 'SYSTEM']);
export const messageStatusSchema = z.enum(['SENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED']);

export const sendMessageSchema = z.object({
  roomId: z.string().uuid(),
  content: z.string().max(MESSAGE_CONFIG.MAX_CONTENT_LENGTH),
  type: messageTypeSchema.default('TEXT'),
  replyToId: z.string().uuid().optional(),
  tempId: z.string().optional(), // Client-side temporary ID
});

export const messageHistoryQuerySchema = z.object({
  roomId: z.string().uuid(),
  cursor: z.string().uuid().optional(), // Last message ID for cursor pagination
  limit: z.coerce.number().int().positive().max(100).optional().default(50),
  before: z.coerce.date().optional(), // Get messages before this date
});

export const updateMessageSchema = z.object({
  content: z.string().max(MESSAGE_CONFIG.MAX_CONTENT_LENGTH),
});

export const messageAttachmentSchema = z.object({
  id: z.string().uuid(),
  messageId: z.string().uuid(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
  createdAt: z.date(),
});

export const messageSchema = z.object({
  id: z.string().uuid(),
  content: z.string(),
  type: messageTypeSchema,
  status: messageStatusSchema,
  roomId: z.string().uuid(),
  senderId: z.string().uuid(),
  replyToId: z.string().uuid().nullable(),
  editedAt: z.date().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============= File Upload Schemas =============
export const requestSignedUrlSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string(),
  fileSize: z.number().positive(),
  purpose: z.enum(['avatar', 'message', 'room']).default('message'),
});

export const fileMetadataSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  fileSize: z.number(),
  mimeType: z.string(),
  thumbnailUrl: z.string().url().optional(),
});

// ============= Response Schemas =============
export const apiErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.array(z.string())).optional(),
});

export const apiMetaSchema = z.object({
  page: z.number().optional(),
  limit: z.number().optional(),
  total: z.number().optional(),
  totalPages: z.number().optional(),
});

// ============= Type Exports =============
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type SearchUsersInput = z.infer<typeof searchUsersSchema>;
export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
export type AddRoomMemberInput = z.infer<typeof addRoomMemberSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type MessageHistoryQuery = z.infer<typeof messageHistoryQuerySchema>;
export type UpdateMessageInput = z.infer<typeof updateMessageSchema>;
export type RequestSignedUrlInput = z.infer<typeof requestSignedUrlSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
