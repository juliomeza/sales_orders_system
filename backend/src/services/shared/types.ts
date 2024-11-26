// backend/src/services/shared/types.ts
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
  }
  
  export interface ServiceResult<T> {
    success: boolean;
    data?: T;
    error?: string;
    errors?: string[];
    message?: string;
  }