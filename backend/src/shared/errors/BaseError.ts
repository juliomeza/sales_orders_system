// backend/src/shared/errors/BaseError.ts
export abstract class BaseError extends Error {
    constructor(
      message: string,
      public readonly code: string,
      public readonly statusCode: number = 500,
      public readonly details?: string | string[]
    ) {
      super(message);
      this.name = this.constructor.name;
      Error.captureStackTrace(this, this.constructor);
    }
  
    public toJSON() {
      return {
        error: {
          code: this.code,
          message: this.message,
          ...(this.details && { details: this.details })
        }
      };
    }
  }