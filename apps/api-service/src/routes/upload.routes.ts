import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import * as uploadService from '../services/upload.service';
import { authMiddleware } from '../middlewares';
import { successResponse, errorResponse } from '../utils/response';
import { FILE_UPLOAD, ERROR_CODES } from '@kuraxx/constants';
import { requestSignedUrlSchema } from '@kuraxx/contracts';
import { AppError } from '../utils/errors';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: FILE_UPLOAD.MAX_FILE_SIZE,
  },
});

// Helper for async route handlers
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Get signed URL for client-side upload
router.post(
  '/signed-url',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    const validatedBody = requestSignedUrlSchema.parse(req.body);
    const signedUrl = await uploadService.getSignedUploadUrl(req.userId!, validatedBody);
    
    res.json(successResponse({
      uploadUrl: signedUrl.uploadUrl,
      publicUrl: signedUrl.publicUrl,
      expiresAt: signedUrl.expiresAt,
    }));
  })
);

// Upload file directly
router.post(
  '/file',
  authMiddleware,
  upload.single('file'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json(errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'No file provided'
      ));
      return;
    }

    const purpose = (req.body.purpose as 'avatar' | 'message' | 'room') || 'message';
    
    const result = await uploadService.uploadFile(
      req.userId!,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      purpose
    );

    res.status(201).json(successResponse({ file: result }));
  })
);

// Upload image
router.post(
  '/image',
  authMiddleware,
  upload.single('image'),
  asyncHandler(async (req: Request, res: Response) => {
    if (!req.file) {
      res.status(400).json(errorResponse(
        ERROR_CODES.VALIDATION_ERROR,
        'No image provided'
      ));
      return;
    }

    const purpose = (req.body.purpose as 'avatar' | 'message' | 'room') || 'message';
    
    const result = await uploadService.uploadImage(
      req.userId!,
      req.file.buffer,
      req.file.originalname,
      req.file.mimetype,
      purpose
    );

    res.status(201).json(successResponse({ file: result }));
  })
);

// Delete file
router.delete(
  '/:fileId',
  authMiddleware,
  asyncHandler(async (req: Request, res: Response) => {
    await uploadService.deleteFile(req.userId!, req.params.fileId);
    res.json(successResponse({ message: 'File deleted successfully' }));
  })
);

export const uploadRouter = router;
