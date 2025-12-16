import { prisma } from '../config/database';
import { RoomAccessDeniedError, NotFoundError } from '../utils/errors';

export interface CreateResourceInput {
  title: string;
  type: string;
  fileUrl?: string;
  roomId: string;
}

export interface ResourceWithAuthor {
  id: string;
  title: string;
  type: string;
  fileUrl: string | null;
  roomId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
}

// Check if user is member of room
async function checkRoomMembership(userId: string, roomId: string): Promise<void> {
  const member = await prisma.roomMember.findUnique({
    where: {
      userId_roomId: { userId, roomId },
    },
  });

  if (!member) {
    throw new RoomAccessDeniedError();
  }
}

export async function createResource(
  userId: string,
  input: CreateResourceInput
): Promise<ResourceWithAuthor> {
  await checkRoomMembership(userId, input.roomId);

  const resource = await prisma.resource.create({
    data: {
      title: input.title,
      type: input.type,
      fileUrl: input.fileUrl,
      roomId: input.roomId,
      authorId: userId,
    },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });

  return resource as ResourceWithAuthor;
}

export async function getResources(
  userId: string,
  roomId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ resources: ResourceWithAuthor[]; total: number }> {
  await checkRoomMembership(userId, roomId);

  const skip = (page - 1) * limit;

  const [resources, total] = await Promise.all([
    prisma.resource.findMany({
      where: { roomId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
          },
        },
      },
    }),
    prisma.resource.count({ where: { roomId } }),
  ]);

  return { resources: resources as ResourceWithAuthor[], total };
}

export async function deleteResource(userId: string, resourceId: string): Promise<void> {
  const resource = await prisma.resource.findUnique({
    where: { id: resourceId },
    select: { authorId: true },
  });

  if (!resource) {
    throw new NotFoundError('Resource not found');
  }

  if (resource.authorId !== userId) {
    throw new RoomAccessDeniedError('You can only delete your own resources');
  }

  await prisma.resource.delete({
    where: { id: resourceId },
  });
}
