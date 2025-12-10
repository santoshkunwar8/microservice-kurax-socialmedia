import type { ApiResponse, ApiError, ApiMeta } from '@kuraxx/types';

export function successResponse<T>(
  data: T,
  meta?: ApiMeta
): ApiResponse<T> {
  const response: ApiResponse<T> = {
    success: true,
    data,
  };

  if (meta) {
    response.meta = meta;
  }

  return response;
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, string[]>
): { success: false; error: ApiError } {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
  };
}

export function paginationMeta(
  page: number,
  limit: number,
  total: number
): ApiMeta {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}
