import { prisma } from '../config/database';
import { PAGINATION } from '@kuraxx/constants';
import { UserNotFoundError } from '../utils/errors';
import type { UpdateUserInput, SearchUsersInput, PaginationInput } from '@kuraxx/contracts';
import type { UserPublic } from '@kuraxx/types';

export async function searchUsers(
  userId: string,
  input: SearchUsersInput,
  pagination: PaginationInput
): Promise<{ users: UserPublic[]; total: number }> {
  const { query } = input;
  const { page = PAGINATION.DEFAULT_PAGE, limit = PAGINATION.DEFAULT_LIMIT } = pagination;
  const skip = (page - 1) * limit;

  const searchCondition = {
    OR: [
      { username: { contains: query, mode: 'insensitive' as const } },
      { displayName: { contains: query, mode: 'insensitive' as const } },
    ],
    // Exclude current user from results
    NOT: { id: userId },
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: searchCondition,
      skip,
      take: limit,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        isOnline: true,
        lastSeenAt: true,
      },
    }),
    prisma.user.count({ where: searchCondition }),
  ]);

  return { users, total };
}

export async function getUserById(userId: string): Promise<UserPublic> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
    },
  });

  if (!user) {
    throw new UserNotFoundError();
  }

  return user;
}

export async function updateUser(
  userId: string,
  input: UpdateUserInput
): Promise<{
  id: string;
  email: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  isOnline: boolean;
  lastSeenAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: input,
    select: {
      id: true,
      email: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      isOnline: true,
      lastSeenAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return user;
}

export async function updateUserOnlineStatus(
  userId: string,
  isOnline: boolean
): Promise<void> {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeenAt: isOnline ? null : new Date(),
    },
  });
}
