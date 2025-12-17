import { prisma } from '../config/database';
import { publish } from '../config/redis';
import { REDIS_CHANNELS } from '@kuraxx/constants';
import { RoomAccessDeniedError, NotFoundError } from '../utils/errors';

export interface CreatePostInput {
  content: string;
  roomId: string;
  attachments?: string[];
}

export interface PostWithAuthor {
  id: string;
  content: string;
  roomId: string;
  authorId: string;
  attachments: string[];
  likes: number;
  createdAt: Date;
  updatedAt: Date;
  author: {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
  };
  _count: {
    comments: number;
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

export async function createPost(
  userId: string,
  input: CreatePostInput
): Promise<PostWithAuthor> {
  await checkRoomMembership(userId, input.roomId);

  const post = await prisma.post.create({
    data: {
      content: input.content,
      roomId: input.roomId,
      authorId: userId,
      attachments: input.attachments || [],
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
      _count: {
        select: { comments: true },
      },
    },
  });

  // Publish to Redis for real-time updates
  await publish(REDIS_CHANNELS.POSTS.NEW, {
    post,
    roomId: input.roomId,
  });

  return post as PostWithAuthor;
}

export async function getPosts(
  userId: string,
  roomId: string,
  page: number = 1,
  limit: number = 20
): Promise<{ posts: PostWithAuthor[]; total: number }> {
  await checkRoomMembership(userId, roomId);

  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
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
        _count: {
          select: { comments: true },
        },
      },
    }),
    prisma.post.count({ where: { roomId } }),
  ]);

  return { posts: posts as PostWithAuthor[], total };
}

export async function getPostComments(
  userId: string,
  postId: string,
  page: number = 1,
  limit: number = 50
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { roomId: true },
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  await checkRoomMembership(userId, post.roomId);

  const skip = (page - 1) * limit;

  const [comments, total] = await Promise.all([
    prisma.postComment.findMany({
      where: { postId },
      skip,
      take: limit,
      orderBy: { createdAt: 'asc' },
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
    prisma.postComment.count({ where: { postId } }),
  ]);

  return { comments, total };
}

export async function addComment(
  userId: string,
  postId: string,
  content: string
) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { roomId: true },
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  await checkRoomMembership(userId, post.roomId);

  const comment = await prisma.postComment.create({
    data: {
      content,
      postId,
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

  return comment;
}

export async function likePost(userId: string, postId: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { roomId: true, likes: true },
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  await checkRoomMembership(userId, post.roomId);

  // Simple increment - in production, you'd track individual likes
  const updatedPost = await prisma.post.update({
    where: { id: postId },
    data: { likes: { increment: 1 } },
    include: {
      author: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
      _count: {
        select: { comments: true },
      },
    },
  });

  return updatedPost;
}

export async function deletePost(userId: string, postId: string): Promise<void> {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    select: { authorId: true },
  });

  if (!post) {
    throw new NotFoundError('Post not found');
  }

  if (post.authorId !== userId) {
    throw new RoomAccessDeniedError();
  }

  await prisma.post.delete({
    where: { id: postId },
  });
}
