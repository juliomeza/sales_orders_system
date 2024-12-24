// frontend/src/shared/errors/AppError.ts
export enum ErrorSeverity {
    INFO = 'info',
    WARNING = 'warning',
    ERROR = 'error',
    CRITICAL = 'critical'
  }
  
  export enum ErrorCategory {
    NETWORK = 'network',
    VALIDATION = 'validation',
    AUTHENTICATION = 'authentication',
    AUTHORIZATION = 'authorization',
    BUSINESS = 'business',
    TECHNICAL = 'technical'
  }
  
  export interface ErrorMetadata {
    code: string;
    field?: string;
    timestamp: Date;
    requestId?: string;
    originalError?: unknown;
  }
  
  export class AppError extends Error {
    public readonly severity: ErrorSeverity;
    public readonly category: ErrorCategory;
    public readonly metadata: ErrorMetadata;
    public readonly userMessage: string;
  
    constructor(
      message: string,
      category: ErrorCategory,
      severity: ErrorSeverity = ErrorSeverity.ERROR,
      metadata?: Partial<ErrorMetadata>
    ) {
      super(message);
      this.name = 'AppError';
      this.severity = severity;
      this.category = category;
      this.userMessage = this.generateUserMessage();
      this.metadata = {
        code: metadata?.code || 'ERR_UNKNOWN',
        timestamp: new Date(),
        ...metadata
      };
  
      Error.captureStackTrace(this, this.constructor);
    }
  
    private generateUserMessage(): string {
      switch (this.category) {
        case ErrorCategory.NETWORK:
          return 'A network error occurred. Please check your connection and try again.';
        case ErrorCategory.VALIDATION:
          return 'Please check your input and try again.';
        case ErrorCategory.AUTHENTICATION:
          return 'Please sign in to continue.';
        case ErrorCategory.AUTHORIZATION:
          return 'You do not have permission to perform this action.';
        default:
          return 'An unexpected error occurred. Please try again later.';
      }
    }
  
    public toJSON() {
      return {
        name: this.name,
        message: this.message,
        userMessage: this.userMessage,
        category: this.category,
        severity: this.severity,
        metadata: this.metadata
      };
    }
  }
  
  // Factory methods for common errors
  export const createNetworkError = (message: string, metadata?: Partial<ErrorMetadata>) => {
    return new AppError(message, ErrorCategory.NETWORK, ErrorSeverity.ERROR, {
      code: 'ERR_NETWORK',
      ...metadata
    });
  };
  
  export const createValidationError = (message: string, field?: string, metadata?: Partial<ErrorMetadata>) => {
    return new AppError(message, ErrorCategory.VALIDATION, ErrorSeverity.WARNING, {
      code: 'ERR_VALIDATION',
      field,
      ...metadata
    });
  };