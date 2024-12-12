// backend/src/middleware/error/errorHandler.ts
import { Request, Response, NextFunction } from 'express';
import { ApiErrorCode } from '../../shared/types/base/responses';
import { createErrorResponse, handleCommonErrors } from '../../shared/utils/response';
import Logger from '../../config/logger';
import { ValidationError } from '../../shared/errors/ValidationError';
import { ApiError } from '../../shared/errors/ApiError';

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Log el error
  Logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.userId || 'anonymous'
  });

  // Manejar errores específicos de la aplicación
  if (error instanceof ValidationError) {
    const response = createErrorResponse(
      ApiErrorCode.VALIDATION_ERROR,
      'Validation failed',
      error.details as string[],
      req
    );
    return res.status(400).json(response);
  }

  if (error instanceof ApiError) {
    const response = createErrorResponse(
      error.code as ApiErrorCode,
      error.message,
      error.details as string[],
      req
    );
    return res.status(error.statusCode).json(response);
  }

  // Manejar otros errores conocidos
  const response = handleCommonErrors(error, req);
  
  // Determinar el código de estado HTTP apropiado
  let statusCode = 500;
  if (response.error?.code === ApiErrorCode.VALIDATION_ERROR) statusCode = 400;
  if (response.error?.code === ApiErrorCode.NOT_FOUND) statusCode = 404;
  if (response.error?.code === ApiErrorCode.UNAUTHORIZED) statusCode = 401;
  if (response.error?.code === ApiErrorCode.FORBIDDEN) statusCode = 403;
  if (response.error?.code === ApiErrorCode.CONFLICT) statusCode = 409;

  return res.status(statusCode).json(response);
};