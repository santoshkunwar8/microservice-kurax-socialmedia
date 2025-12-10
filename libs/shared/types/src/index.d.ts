export interface User {
    id: string;
    email: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface UserPublic {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    isOnline: boolean;
    lastSeenAt: Date | null;
}
export interface AuthUser {
    id: string;
    email: string;
    username: string;
}
export declare enum RoomType {
    DIRECT = "DIRECT",
    GROUP = "GROUP",
    CHANNEL = "CHANNEL"
}
export interface Room {
    id: string;
    name: string | null;
    description: string | null;
    type: RoomType;
    avatarUrl: string | null;
    createdById: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface RoomWithMembers extends Room {
    members: RoomMember[];
}
export interface RoomMember {
    id: string;
    userId: string;
    roomId: string;
    role: RoomRole;
    joinedAt: Date;
    user?: UserPublic;
}
export declare enum RoomRole {
    OWNER = "OWNER",
    ADMIN = "ADMIN",
    MEMBER = "MEMBER"
}
export declare enum MessageType {
    TEXT = "TEXT",
    IMAGE = "IMAGE",
    FILE = "FILE",
    SYSTEM = "SYSTEM"
}
export declare enum MessageStatus {
    SENDING = "SENDING",
    SENT = "SENT",
    DELIVERED = "DELIVERED",
    READ = "READ",
    FAILED = "FAILED"
}
export interface Message {
    id: string;
    content: string;
    type: MessageType;
    status: MessageStatus;
    roomId: string;
    senderId: string;
    replyToId: string | null;
    editedAt: Date | null;
    deletedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface MessageWithSender extends Message {
    sender: UserPublic;
    attachments?: MessageAttachment[];
    replyTo?: Message | null;
}
export interface MessageAttachment {
    id: string;
    messageId: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    url: string;
    thumbnailUrl: string | null;
    createdAt: Date;
}
export interface TokenPayload {
    userId: string;
    email: string;
    username: string;
    iat?: number;
    exp?: number;
}
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
}
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: ApiError;
    meta?: ApiMeta;
}
export interface ApiError {
    code: string;
    message: string;
    details?: Record<string, string[]>;
}
export interface ApiMeta {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
}
export interface PaginationParams {
    page?: number;
    limit?: number;
}
export declare enum WSEventType {
    CONNECT = "connect",
    DISCONNECT = "disconnect",
    ERROR = "error",
    AUTHENTICATE = "authenticate",
    AUTHENTICATED = "authenticated",
    MESSAGE_NEW = "message:new",
    MESSAGE_SAVED = "message:saved",
    MESSAGE_UPDATE = "message:update",
    MESSAGE_DELETE = "message:delete",
    PRESENCE_ONLINE = "presence:online",
    PRESENCE_OFFLINE = "presence:offline",
    PRESENCE_SYNC = "presence:sync",
    TYPING_START = "typing:start",
    TYPING_STOP = "typing:stop",
    ROOM_JOIN = "room:join",
    ROOM_LEAVE = "room:leave",
    ROOM_UPDATE = "room:update"
}
export interface WSMessage<T = unknown> {
    type: WSEventType;
    payload: T;
    timestamp: number;
    requestId?: string;
}
export interface WSAuthPayload {
    token: string;
}
export interface WSMessagePayload {
    roomId: string;
    content: string;
    type: MessageType;
    tempId?: string;
    replyToId?: string;
}
export interface WSTypingPayload {
    roomId: string;
    userId: string;
    username: string;
}
export interface WSPresencePayload {
    userId: string;
    username: string;
    isOnline: boolean;
    lastSeenAt?: Date;
}
export interface WSRoomJoinPayload {
    roomId: string;
}
export interface RedisMessagePayload {
    channel: string;
    data: unknown;
    timestamp: number;
}
export interface RedisNewMessagePayload {
    message: MessageWithSender;
    roomId: string;
    senderId: string;
}
export interface RedisSavedMessagePayload {
    message: MessageWithSender;
    roomId: string;
    tempId?: string;
}
export interface RedisPresencePayload {
    userId: string;
    username: string;
    isOnline: boolean;
    timestamp: number;
}
export interface RedisTypingPayload {
    userId: string;
    username: string;
    roomId: string;
    isTyping: boolean;
}
export interface FileUploadResult {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    thumbnailUrl?: string;
}
export interface SignedUploadUrl {
    uploadUrl: string;
    publicUrl: string;
    expiresAt: Date;
}
//# sourceMappingURL=index.d.ts.map