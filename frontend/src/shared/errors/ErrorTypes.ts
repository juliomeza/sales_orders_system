// frontend/src/shared/errors/ErrorTypes.ts
import { ErrorCategory, ErrorSeverity } from './AppError';

export interface ApiErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ValidationErrorDetail {
  field: string;
  message: string;
  code: string;
}

export interface ErrorContext {
  requestId?: string;
  userId?: string | number;
  timestamp: Date;
  path?: string;
  action?: string;
}

export interface ErrorOptions {
  category: ErrorCategory;
  severity: ErrorSeverity;
  code: string;
  context?: ErrorContext;
  originalError?: unknown;
}

export interface ErrorHandlerConfig {
  logToConsole?: boolean;
  logToService?: boolean;
  showNotifications?: boolean;
  captureContext?: boolean;
}

export type ErrorListener = (error: Error, context?: ErrorContext) => void;

export interface ErrorSubscription {
  unsubscribe: () => void;
}