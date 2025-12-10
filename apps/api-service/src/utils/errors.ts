import { ERROR_CODES } from '@kuraxx/constants';

export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: Record<string, string[]>;
  public readonly isOperational: boolean;

  constructor(
    message: string,
    code: string = ERROR_CODES.INTERNAL_ERROR,
    statusCode: number = 500,
    details?: Record<string, string[]>
  ) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// Specific error classes
export class ValidationError extends AppError {
  constructor(message: string, details?: Record<string, string[]>) {
    super(message, ERROR_CODES.VALIDATION_ERROR, 400, details);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, ERROR_CODES.AUTH_UNAUTHORIZED, 401);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, ERROR_CODES.ROOM_ACCESS_DENIED, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(message, ERROR_CODES.RESOURCE_NOT_FOUND, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(message, ERROR_CODES.RESOURCE_EXISTS, 409);
  }
}

export class TokenExpiredError extends AppError {
  constructor() {
    super('Token has expired', ERROR_CODES.AUTH_TOKEN_EXPIRED, 401);
  }
}

export class InvalidTokenError extends AppError {
  constructor() {
    super('Invalid token', ERROR_CODES.AUTH_TOKEN_INVALID, 401);
  }
}

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid email or password', ERROR_CODES.AUTH_INVALID_CREDENTIALS, 401);
  }
}

export class UserExistsError extends AppError {
  constructor(field: string = 'email') {
    super(`User with this ${field} already exists`, ERROR_CODES.AUTH_USER_EXISTS, 409);
  }
}

export class UserNotFoundError extends AppError {
  constructor() {
    super('User not found', ERROR_CODES.AUTH_USER_NOT_FOUND, 404);
  }
}

export class RoomNotFoundError extends AppError {
  constructor() {
    super('Room not found', ERROR_CODES.ROOM_NOT_FOUND, 404);
  }
}

export class RoomAccessDeniedError extends AppError {
  constructor() {
    super('Access to this room is denied', ERROR_CODES.ROOM_ACCESS_DENIED, 403);
  }
}

export class MessageNotFoundError extends AppError {
  constructor() {
    super('Message not found', ERROR_CODES.MESSAGE_NOT_FOUND, 404);
  }
}

export class FileTooLargeError extends AppError {
  constructor(maxSize: number) {
    super(
      `File size exceeds the maximum limit of ${maxSize / (1024 * 1024)}MB`,
      ERROR_CODES.FILE_TOO_LARGE,
      413
    );
  }
}

export class FileTypeNotAllowedError extends AppError {
  constructor(mimeType: string) {
    super(
      `File type "${mimeType}" is not allowed`,
      ERROR_CODES.FILE_TYPE_NOT_ALLOWED,
      400
    );
  }
}

export class FileUploadError extends AppError {
  constructor(message: string = 'File upload failed') {
    super(message, ERROR_CODES.FILE_UPLOAD_FAILED, 500);
  }
}
