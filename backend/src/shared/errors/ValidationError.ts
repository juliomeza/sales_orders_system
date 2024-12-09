// backend/src/shared/errors/ValidationError.ts
import { BaseError } from './BaseError';

export class ValidationError extends BaseError {
  constructor(details: string | string[]) {
    super(
      'Validation failed',
      'VALIDATION_ERROR',
      400,
      details
    );
  }
}