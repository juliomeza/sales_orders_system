// backend/src/shared/utils/response.ts
import { Request } from 'express';
import { ApiResponse, ApiError, ApiErrorCode, ResponseMetadata, PaginatedApiResponse } from '../types/responses';

// Función para crear metadata consistente
const createMetadata = (req?: Request): ResponseMetadata => ({
  timestamp: new Date().toISOString(),
  requestId: req?.headers['x-request-id'] as string,
  path: req?.originalUrl
});

// Función para crear respuesta exitosa
export const createSuccessResponse = <T>(data: T, req?: Request): ApiResponse<T> => ({
  success: true,
  data,
  metadata: createMetadata(req)
});

// Función para crear respuesta paginada
export const createPaginatedResponse = <T>(
  data: T,
  page: number,
  limit: number,
  total: number,
  req?: Request
): PaginatedApiResponse<T> => ({
  success: true,
  data,
  metadata: createMetadata(req),
  pagination: {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit)
  }
});

// Función para crear respuesta de error
export const createErrorResponse = (
  code: ApiErrorCode,
  message: string,
  details?: string[],
  req?: Request
): ApiResponse => ({
  success: false,
  error: {
    code,
    message,
    details,
    ...(process.env.NODE_ENV === 'development' && {
      stack: new Error().stack
    })
  },
  metadata: createMetadata(req)
});

// Función para manejar errores comunes
export const handleCommonErrors = (error: unknown, req?: Request): ApiResponse => {
  if (error instanceof Error) {
    // Mapeo de errores conocidos
    if (error.name === 'ValidationError') {
      return createErrorResponse(
        ApiErrorCode.VALIDATION_ERROR,
        'Validation failed',
        [error.message],
        req
      );
    }
    if (error.name === 'PrismaClientKnownRequestError') {
      return createErrorResponse(
        ApiErrorCode.DATABASE_ERROR,
        'Database operation failed',
        [error.message],
        req
      );
    }
    // Error genérico
    return createErrorResponse(
      ApiErrorCode.INTERNAL_ERROR,
      error.message,
      undefined,
      req
    );
  }
  // Error desconocido
  return createErrorResponse(
    ApiErrorCode.INTERNAL_ERROR,
    'An unexpected error occurred',
    undefined,
    req
  );
};