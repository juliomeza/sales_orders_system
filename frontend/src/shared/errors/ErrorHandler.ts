// frontend/src/shared/errors/ErrorHandler.ts
import { AppError, ErrorCategory, ErrorSeverity } from './AppError';
import { API_ERROR_CODES, getErrorCodeFromStatus } from './ErrorCodes';
import { 
  ErrorContext, 
  ErrorHandlerConfig, 
  ErrorListener, 
  ApiErrorResponse 
} from './ErrorTypes';

class ErrorHandler {
  private static instance: ErrorHandler;
  private listeners: ErrorListener[] = [];
  private config: ErrorHandlerConfig = {
    logToConsole: true,
    logToService: process.env.NODE_ENV === 'production',
    showNotifications: true,
    captureContext: true
  };

  private constructor() {
    this.setupGlobalHandlers();
  }

  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  public configure(config: Partial<ErrorHandlerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public handleError(error: unknown, context?: Partial<ErrorContext>): AppError {
    const appError = this.normalizeError(error);
    this.processError(appError, context);
    return appError;
  }

  public subscribe(listener: ErrorListener): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private normalizeError(error: unknown): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      if ('response' in error) {
        // Axios error
        const axiosError = error as any;
        const response = axiosError.response?.data as ApiErrorResponse;
        
        return new AppError(
          response?.message || error.message,
          ErrorCategory.NETWORK,
          ErrorSeverity.ERROR,
          {
            code: getErrorCodeFromStatus(axiosError.response?.status),
            originalError: error,
            ...this.extractErrorContext(error)
          }
        );
      }

      return new AppError(
        error.message,
        ErrorCategory.TECHNICAL,
        ErrorSeverity.ERROR,
        {
          code: API_ERROR_CODES.UNKNOWN_ERROR,
          originalError: error,
          ...this.extractErrorContext(error)
        }
      );
    }

    // Handle string errors or unknown types
    const message = typeof error === 'string' ? error : 'An unknown error occurred';
    return new AppError(
      message,
      ErrorCategory.TECHNICAL,
      ErrorSeverity.ERROR,
      {
        code: API_ERROR_CODES.UNKNOWN_ERROR,
        originalError: error
      }
    );
  }

  private processError(error: AppError, context?: Partial<ErrorContext>): void {
    const errorContext = this.buildErrorContext(error, context);

    // Log error if configured
    if (this.config.logToConsole) {
      this.logError(error, errorContext);
    }

    // Send to error logging service if configured
    if (this.config.logToService) {
      this.logToService(error, errorContext);
    }

    // Notify listeners
    this.notifyListeners(error, errorContext);
  }

  private buildErrorContext(error: AppError, additionalContext?: Partial<ErrorContext>): ErrorContext {
    return {
      timestamp: new Date(),
      ...this.extractErrorContext(error.metadata.originalError),
      ...additionalContext
    };
  }

  private extractErrorContext(error: unknown): Partial<ErrorContext> {
    if (!error || typeof error !== 'object') {
      return {};
    }

    const context: Partial<ErrorContext> = {};

    if ('config' in error) {
      const axiosError = error as any;
      context.path = axiosError.config?.url;
      context.action = axiosError.config?.method?.toUpperCase();
    }

    return context;
  }

  private setupGlobalHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason);
    });

    // Handle uncaught errors
    window.addEventListener('error', (event) => {
      this.handleError(event.error);
    });
  }

  private logError(error: AppError, context: ErrorContext): void {
    const errorInfo = {
      ...error.toJSON(),
      context
    };

    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        console.error('[CRITICAL ERROR]', errorInfo);
        break;
      case ErrorSeverity.ERROR:
        console.error('[ERROR]', errorInfo);
        break;
      case ErrorSeverity.WARNING:
        console.warn('[WARNING]', errorInfo);
        break;
      default:
        console.log('[INFO]', errorInfo);
    }
  }

  private async logToService(error: AppError, context: ErrorContext): Promise<void> {
    // Implement error logging service integration
    // Example: Sentry, LogRocket, etc.
    try {
      // await errorLoggingService.log({
      //   ...error.toJSON(),
      //   context
      // });
    } catch (loggingError) {
      console.error('Failed to log error to service:', loggingError);
    }
  }

  private notifyListeners(error: AppError, context: ErrorContext): void {
    this.listeners.forEach(listener => {
      try {
        listener(error, context);
      } catch (listenerError) {
        console.error('Error in error listener:', listenerError);
      }
    });
  }
}

export const errorHandler = ErrorHandler.getInstance();

// Helper function to create context object
export const createErrorContext = (
  path: string,
  action: string,
  additionalContext?: Partial<ErrorContext>
): ErrorContext => ({
  timestamp: new Date(),
  path,
  action,
  ...additionalContext
});