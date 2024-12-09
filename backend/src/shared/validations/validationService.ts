// backend/src/shared/validations/validationService.ts
import { ValidationResult, Status } from '../types';
import { rules } from './rules';
import { ERROR_MESSAGES } from '../constants';
import { ValidationError } from '../errors';

export interface ValidationRule {
  condition: boolean;
  message: string;
}

export class ValidationService {
  static validate(validationRules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of validationRules) {
      if (!rule.condition) {
        errors.push(rule.message);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  static validateRequired(field: string, value: any): void {
    if (!rules.isRequired(value)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME(field)
      );
    }
  }

  static validateEmail(email: string): void {
    if (!rules.isValidEmail(email)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.INVALID_EMAIL
      );
    }
  }

  static validateLookupCode(code: string): void {
    if (!rules.isValidLookupCode(code)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.INVALID_CODE
      );
    }
  }

  static validateStatus(status: Status): void {
    if (!rules.isValidStatus(status)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.INVALID_STATUS
      );
    }
  }

  static validateRole(role: string): void {
    if (!rules.isValidRole(role)) {
      throw new ValidationError(
        ERROR_MESSAGES.VALIDATION.INVALID_ROLE
      );
    }
  }
}