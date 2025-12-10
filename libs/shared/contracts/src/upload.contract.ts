import { initContract } from '@ts-rest/core';
import { z } from 'zod';
import {
  requestSignedUrlSchema,
  fileMetadataSchema,
  apiErrorSchema,
} from './schemas';

const c = initContract();

// ============= Upload Contract =============
export const uploadContract = c.router({
  getSignedUrl: {
    method: 'POST',
    path: '/upload/signed-url',
    body: requestSignedUrlSchema,
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          uploadUrl: z.string().url(),
          publicUrl: z.string().url(),
          expiresAt: z.date(),
        }),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Get a signed URL for file upload',
  },

  uploadFile: {
    method: 'POST',
    path: '/upload/file',
    contentType: 'multipart/form-data',
    body: c.type<{ file: File; purpose?: string }>(),
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          file: fileMetadataSchema,
        }),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      413: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Upload a file directly',
  },

  uploadImage: {
    method: 'POST',
    path: '/upload/image',
    contentType: 'multipart/form-data',
    body: c.type<{ image: File; purpose?: string }>(),
    responses: {
      201: z.object({
        success: z.literal(true),
        data: z.object({
          file: fileMetadataSchema.extend({
            thumbnailUrl: z.string().url().optional(),
          }),
        }),
      }),
      400: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      413: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Upload an image',
  },

  deleteFile: {
    method: 'DELETE',
    path: '/upload/:fileId',
    pathParams: z.object({
      fileId: z.string(),
    }),
    body: z.object({}),
    responses: {
      200: z.object({
        success: z.literal(true),
        data: z.object({
          message: z.string(),
        }),
      }),
      401: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
      404: z.object({
        success: z.literal(false),
        error: apiErrorSchema,
      }),
    },
    summary: 'Delete a file',
  },
});

export type UploadContract = typeof uploadContract;
