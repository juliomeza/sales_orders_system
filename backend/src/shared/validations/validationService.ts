// backend/src/shared/validations/validationService.ts
import { ValidationResult } from '../types';

export interface ValidationRule {
    condition: boolean;
    message: string;
  }
  
export class ValidationService {
static validate(rules: ValidationRule[]): ValidationResult {
    const errors: string[] = [];
    
    for (const rule of rules) {
    if (!rule.condition) {
        errors.push(rule.message);
    }
    }
    
    return {
    isValid: errors.length === 0,
    errors
    };
}
}