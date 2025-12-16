import { Router, Request, Response, NextFunction } from 'express';
import * as postService from '../services/post.service';
import { authMiddleware } from '../middlewares';
import { successResponse, errorResponse } from '../utils/response';
import { ERROR_CODES } from '@kuraxx/constants';

const router = Router();

// Helper for async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Create a post
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { content, roomId, attachments } = req.body;
    
    if (!content || !roomId) {
      res.status(400).json(errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Content and roomId are required'
      ));
      return;
    }

    const post = await postService.createPost(req.userId!, {
      content,
      roomId,
      attachments,
    });

    res.status(201).json(successResponse({ post }));
  })
);

// Get posts for a room
router.get(
  '/room/:roomId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await postService.getPosts(req.userId!, roomId, page, limit);

    res.json(successResponse({
      posts: result.posts,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    }));
  })
);

// Get comments for a post
router.get(
  '/:postId/comments',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    const result = await postService.getPostComments(req.userId!, postId, page, limit);

    res.json(successResponse({
      comments: result.comments,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    }));
  })
);

// Add a comment to a post
router.post(
  '/:postId/comments',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      res.status(400).json(errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Content is required'
      ));
      return;
    }

    const comment = await postService.addComment(req.userId!, postId, content);

    res.status(201).json(successResponse({ comment }));
  })
);

// Like a post
router.post(
  '/:postId/like',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;

    const post = await postService.likePost(req.userId!, postId);

    res.json(successResponse({ post }));
  })
);

// Delete a post
router.delete(
  '/:postId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { postId } = req.params;

    await postService.deletePost(req.userId!, postId);

    res.json(successResponse({ message: 'Post deleted successfully' }));
  })
);

export const postsRouter = router;
