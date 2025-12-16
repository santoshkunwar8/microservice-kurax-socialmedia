import { getFirebaseBucket } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { FILE_UPLOAD } from '@kuraxx/constants';
import { FileUploadError, FileTooLargeError, FileTypeNotAllowedError } from './errors';
import type { FileUploadResult, SignedUploadUrl } from '@kuraxx/types';

/**
 * Upload a file buffer to Firebase Cloud Storage
 */
export async function uploadFileToFirebase(
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  userId: string,
  mediaType: string // e.g., 'image', 'video', 'audio', etc.
): Promise<FileUploadResult> {
  try {
    const bucket = getFirebaseBucket();
    const fileExtension = originalFileName.split('.').pop() || '';
    const fileName = `${uuidv4()}.${fileExtension}`;
    // Store in kurax/{mediaType}/filename
    const storagePath = `kurax/${mediaType}/${fileName}`;

    const file = bucket.file(storagePath);

    await file.save(fileBuffer, {
      metadata: {
        contentType: mimeType,
        metadata: {
          originalFileName,
          uploadedBy: userId,
          uploadedAt: new Date().toISOString(),
        },
      },
    });

    // Make the file publicly accessible
    await file.makePublic();

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return {
      url: publicUrl,
      fileName: originalFileName,
      fileSize: fileBuffer.length,
      mimeType,
    };
  } catch (error) {
    console.error('Firebase upload error:', error);
    throw new FileUploadError('Failed to upload file to storage');
  }
}

/**
 * Upload an image to Firebase with optional thumbnail generation
 */
export async function uploadImageToFirebase(
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  purpose: 'avatar' | 'message' | 'room' = 'message',
  userId: string
): Promise<FileUploadResult> {
  // Validate image type
  if (!FILE_UPLOAD.ALLOWED_IMAGE_TYPES.includes(mimeType as any)) {
    throw new FileTypeNotAllowedError(mimeType);
  }

  // Validate file size
  if (fileBuffer.length > FILE_UPLOAD.MAX_IMAGE_SIZE) {
    throw new FileTooLargeError(FILE_UPLOAD.MAX_IMAGE_SIZE);
  }

  const result = await uploadFileToFirebase(
    fileBuffer,
    originalFileName,
    mimeType,
    purpose,
    userId
  );

  // For now, we'll use the same URL as thumbnail
  // In production, you'd want to generate an actual thumbnail
  return {
    ...result,
    thumbnailUrl: result.url,
  };
}

/**
 * Generate a signed URL for client-side upload
 */
export async function generateSignedUploadUrl(
  fileName: string,
  mimeType: string,
  purpose: 'avatar' | 'message' | 'room' = 'message',
  userId: string
): Promise<SignedUploadUrl> {
  try {
    const bucket = getFirebaseBucket();
    const fileExtension = fileName.split('.').pop() || '';
    const uniqueFileName = `${uuidv4()}.${fileExtension}`;
    const storagePath = `${FILE_UPLOAD.STORAGE_PATHS[purpose.toUpperCase() as keyof typeof FILE_UPLOAD.STORAGE_PATHS] || 'attachments'}/${userId}/${uniqueFileName}`;

    const file = bucket.file(storagePath);

    const expiresAt = new Date(Date.now() + FILE_UPLOAD.SIGNED_URL_EXPIRY * 1000);

    const [signedUrl] = await file.getSignedUrl({
      version: 'v4',
      action: 'write',
      expires: expiresAt,
      contentType: mimeType,
    });

    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${storagePath}`;

    return {
      uploadUrl: signedUrl,
      publicUrl,
      expiresAt,
    };
  } catch (error) {
    console.error('Failed to generate signed URL:', error);
    throw new FileUploadError('Failed to generate upload URL');
  }
}

/**
 * Get the public URL for a file
 */
export function getPublicFileURL(storagePath: string): string {
  const bucket = getFirebaseBucket();
  return `https://storage.googleapis.com/${bucket.name}/${storagePath}`;
}

/**
 * Delete a file from Firebase Cloud Storage
 */
export async function deleteFile(storagePath: string): Promise<void> {
  try {
    const bucket = getFirebaseBucket();
    const file = bucket.file(storagePath);
    
    const [exists] = await file.exists();
    if (exists) {
      await file.delete();
    }
  } catch (error) {
    console.error('Failed to delete file:', error);
    throw new FileUploadError('Failed to delete file');
  }
}

/**
 * Delete a file by its public URL
 */
export async function deleteFileByUrl(url: string): Promise<void> {
  const bucket = getFirebaseBucket();
  const bucketName = bucket.name;
  const prefix = `https://storage.googleapis.com/${bucketName}/`;
  
  if (url.startsWith(prefix)) {
    const storagePath = url.substring(prefix.length);
    await deleteFile(storagePath);
  }
}

/**
 * Validate file for upload
 */
export function validateFile(
  fileSize: number,
  mimeType: string,
  isImage: boolean = false
): void {
  const maxSize = isImage ? FILE_UPLOAD.MAX_IMAGE_SIZE : FILE_UPLOAD.MAX_FILE_SIZE;
  const allowedTypes = isImage ? FILE_UPLOAD.ALLOWED_IMAGE_TYPES : FILE_UPLOAD.ALLOWED_FILE_TYPES;

  if (fileSize > maxSize) {
    throw new FileTooLargeError(maxSize);
  }

  if (!allowedTypes.includes(mimeType as any)) {
    throw new FileTypeNotAllowedError(mimeType);
  }
}
