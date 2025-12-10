import { prisma } from '../config/database';
import {
  uploadFileToFirebase,
  uploadImageToFirebase,
  generateSignedUploadUrl,
  deleteFileByUrl,
  validateFile,
} from '../utils/firebase-storage';
import type { RequestSignedUrlInput } from '@kuraxx/contracts';
import type { FileUploadResult, SignedUploadUrl } from '@kuraxx/types';

export async function uploadFile(
  userId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  purpose: 'avatar' | 'message' | 'room' = 'message'
): Promise<FileUploadResult> {
  // Validate file
  validateFile(fileBuffer.length, mimeType, false);

  // Upload to Firebase
  const result = await uploadFileToFirebase(
    fileBuffer,
    originalFileName,
    mimeType,
    purpose,
    userId
  );

  // Store metadata in database
  await prisma.fileMetadata.create({
    data: {
      userId,
      fileName: result.fileName,
      originalName: originalFileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      storagePath: result.url.split('.com/')[1] || result.url,
      url: result.url,
      purpose,
    },
  });

  return result;
}

export async function uploadImage(
  userId: string,
  fileBuffer: Buffer,
  originalFileName: string,
  mimeType: string,
  purpose: 'avatar' | 'message' | 'room' = 'message'
): Promise<FileUploadResult> {
  // Validate image
  validateFile(fileBuffer.length, mimeType, true);

  // Upload to Firebase
  const result = await uploadImageToFirebase(
    fileBuffer,
    originalFileName,
    mimeType,
    purpose,
    userId
  );

  // Store metadata in database
  await prisma.fileMetadata.create({
    data: {
      userId,
      fileName: result.fileName,
      originalName: originalFileName,
      fileSize: result.fileSize,
      mimeType: result.mimeType,
      storagePath: result.url.split('.com/')[1] || result.url,
      url: result.url,
      thumbnailUrl: result.thumbnailUrl,
      purpose,
    },
  });

  return result;
}

export async function getSignedUploadUrl(
  userId: string,
  input: RequestSignedUrlInput
): Promise<SignedUploadUrl> {
  // Validate file type and size
  const isImage = input.mimeType.startsWith('image/');
  validateFile(input.fileSize, input.mimeType, isImage);

  // Generate signed URL
  return generateSignedUploadUrl(
    input.fileName,
    input.mimeType,
    input.purpose,
    userId
  );
}

export async function deleteFile(userId: string, fileId: string): Promise<void> {
  const file = await prisma.fileMetadata.findFirst({
    where: {
      id: fileId,
      userId, // Ensure user owns the file
    },
  });

  if (!file) {
    throw new Error('File not found');
  }

  // Delete from Firebase
  await deleteFileByUrl(file.url);

  // Delete from database
  await prisma.fileMetadata.delete({
    where: { id: fileId },
  });
}
