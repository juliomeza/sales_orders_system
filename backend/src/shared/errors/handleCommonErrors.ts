// backend/src/shared/errors/handleCommonErrors.ts
import { Request, Response } from 'express';
import { createErrorResponse } from '../utils/response';
import { ApiErrorCode } from '../types';

export const handleCommonErrors = (res: Response, error: any, req?: Request) => {
  if (error.name === 'ValidationError') {
    const response = createErrorResponse(
      'VALIDATION_ERROR' as ApiErrorCode,
      'Validation failed',
      error.errors,
      req
    );
    return res.status(400).json(response);
  }

  if (error.name === 'NotFoundError') {
    const response = createErrorResponse(
      'NOT_FOUND' as ApiErrorCode,
      'Resource not found',
      undefined,
      req
    );
    return res.status(404).json(response);
  }

  console.error('Unexpected error:', error);
  const response = createErrorResponse(
    'INTERNAL_ERROR' as ApiErrorCode,
    'An unexpected error occurred',
    undefined,
    req
  );
  return res.status(500).json(response);
};
