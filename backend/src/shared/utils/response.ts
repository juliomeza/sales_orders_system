// backend/src/shared/utils/response.ts
import { Request } from 'express';
import { ApiResponse, ApiErrorCode, ResponseMetadata, PaginatedApiResponse } from '../types/base';

// Determina si el entorno es de desarrollo
const isDevelopment = process.env.NODE_ENV === 'development';

// Mapeo de errores conocidos a códigos de error
const KnownErrors = {
  ValidationError: ApiErrorCode.VALIDATION_ERROR,
  PrismaClientKnownRequestError: ApiErrorCode.DATABASE_ERROR,
  JsonWebTokenError: ApiErrorCode.UNAUTHORIZED,
  TokenExpiredError: ApiErrorCode.UNAUTHORIZED,
} as const;

/**
 * Crea metadata consistente para las respuestas.
 * @param req - Objeto de la petición HTTP.
 * @returns Metadata para incluir en la respuesta.
 */
const createMetadata = (req?: Request): ResponseMetadata => ({
  timestamp: new Date().toISOString(),
  requestId: req?.headers['x-request-id'] as string || 'unknown',
  path: req?.originalUrl || 'unknown',
});

/**
 * Crea una respuesta exitosa estándar.
 * @param data - Datos para incluir en la respuesta.
 * @param req - Objeto de la petición HTTP (opcional).
 * @returns Respuesta con éxito.
 */
export const createSuccessResponse = <T>(data: T, req?: Request): ApiResponse<T> => ({
  success: true,
  data,
  metadata: createMetadata(req),
});

/**
 * Crea una respuesta paginada estándar.
 * @param data - Datos para incluir en la respuesta.
 * @param page - Página actual.
 * @param limit - Límite de elementos por página.
 * @param total - Total de elementos disponibles.
 * @param req - Objeto de la petición HTTP (opcional).
 * @returns Respuesta paginada.
 */
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
    totalPages: Math.ceil(total / limit),
  },
});

/**
 * Crea una respuesta de error estándar.
 * @param code - Código de error.
 * @param message - Mensaje descriptivo del error.
 * @param details - Detalles adicionales del error (opcional).
 * @param req - Objeto de la petición HTTP (opcional).
 * @returns Respuesta con error.
 */
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
    ...(isDevelopment && { stack: new Error().stack }),
  },
  metadata: createMetadata(req),
});

/**
 * Maneja errores comunes y los convierte en respuestas estándar.
 * @param error - Error capturado.
 * @param req - Objeto de la petición HTTP (opcional).
 * @returns Respuesta de error estandarizada.
 */
export const handleCommonErrors = (error: unknown, req?: Request): ApiResponse => {
  if (error instanceof Error) {
    const errorCode = KnownErrors[error.name as keyof typeof KnownErrors] || ApiErrorCode.INTERNAL_ERROR;
    return createErrorResponse(errorCode, error.message, undefined, req);
  }
  return createErrorResponse(ApiErrorCode.INTERNAL_ERROR, 'An unexpected error occurred', undefined, req);
};
