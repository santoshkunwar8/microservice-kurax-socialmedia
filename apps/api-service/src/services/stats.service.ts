import { prisma } from '../config/database';

export interface PlatformStats {
  onlineUsers: number;
  totalUsers: number;
  activeRooms: number;
  totalRooms: number;
  messagesToday: number;
  messagesTotal: number;
}

/**
 * Get platform-wide statistics
 */
export async function getPlatformStats(): Promise<PlatformStats> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    onlineUsers,
    totalUsers,
    totalRooms,
    activeRoomsData,
    messagesToday,
    messagesTotal,
  ] = await Promise.all([
    // Count online users
    prisma.user.count({
      where: { isOnline: true },
    }),
    // Count total users
    prisma.user.count(),
    // Count total rooms
    prisma.room.count(),
    // Count rooms with messages in last 24 hours (active rooms)
    prisma.room.count({
      where: {
        messages: {
          some: {
            createdAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        },
      },
    }),
    // Count messages today
    prisma.message.count({
      where: {
        createdAt: { gte: today },
        deletedAt: null,
      },
    }),
    // Count total messages
    prisma.message.count({
      where: { deletedAt: null },
    }),
  ]);

  return {
    onlineUsers,
    totalUsers,
    activeRooms: activeRoomsData,
    totalRooms,
    messagesToday,
    messagesTotal,
  };
}

/**
 * Get user-specific statistics
 */
export async function getUserStats(userId: string) {
  const [roomCount, messageCount] = await Promise.all([
    prisma.roomMember.count({
      where: { userId },
    }),
    prisma.message.count({
      where: { senderId: userId, deletedAt: null },
    }),
  ]);

  return {
    roomCount,
    messageCount,
  };
}
