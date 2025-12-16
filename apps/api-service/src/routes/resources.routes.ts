import { Router, Request, Response, NextFunction } from 'express';
import * as resourceService from '../services/resource.service';
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

// Create a resource
router.post(
  '/',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { title, type, fileUrl, roomId } = req.body;
    
    if (!title || !type || !roomId) {
      res.status(400).json(errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'Title, type, and roomId are required'
      ));
      return;
    }

    const resource = await resourceService.createResource(req.userId!, {
      title,
      type,
      fileUrl,
      roomId,
    });

    res.status(201).json(successResponse({ resource }));
  })
);

// Get resources for a room
router.get(
  '/room/:roomId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { roomId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await resourceService.getResources(req.userId!, roomId, page, limit);

    res.json(successResponse({
      resources: result.resources,
      meta: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    }));
  })
);

// Delete a resource
router.delete(
  '/:resourceId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const { resourceId } = req.params;

    await resourceService.deleteResource(req.userId!, resourceId);

    res.json(successResponse({ message: 'Resource deleted successfully' }));
  })
);

export const resourcesRouter = router;
