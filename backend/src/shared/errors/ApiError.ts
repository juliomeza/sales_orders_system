// backend/src/shared/errors/ApiError.ts
import { BaseError } from './BaseError';
import { ERROR_MESSAGES } from '../constants';

export class ApiError extends BaseError {
  constructor(
    message: string,
    code: string,
    statusCode: number = 500,
    details?: string | string[]
  ) {
    super(message, code, statusCode, details);
  }

  static unauthorized(message = ERROR_MESSAGES.AUTHENTICATION.REQUIRED): ApiError {
    return new ApiError(message, 'UNAUTHORIZED', 401);
  }

  static forbidden(message = ERROR_MESSAGES.AUTHENTICATION.ACCESS_DENIED): ApiError {
    return new ApiError(message, 'FORBIDDEN', 403);
  }

  static notFound(entity: string): ApiError {
    const message = ERROR_MESSAGES.NOT_FOUND[entity as keyof typeof ERROR_MESSAGES.NOT_FOUND] || 
                   `${entity} not found`;
    return new ApiError(message, 'NOT_FOUND', 404);
  }

  static badRequest(message: string, details?: string | string[]): ApiError {
    return new ApiError(message, 'BAD_REQUEST', 400, details);
  }

  static internal(message = ERROR_MESSAGES.OPERATION.LIST_ERROR): ApiError {
    return new ApiError(message, 'INTERNAL_ERROR', 500);
  }
}