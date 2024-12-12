// backend/src/shared/types/base/responses.ts

// Códigos de error estandarizados
export enum ApiErrorCode {
    // Errores de autenticación/autorización (400-403)
    UNAUTHORIZED = 'UNAUTHORIZED',
    FORBIDDEN = 'FORBIDDEN',
    INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
    
    // Errores de validación (400)
    VALIDATION_ERROR = 'VALIDATION_ERROR',
    INVALID_INPUT = 'INVALID_INPUT',
    
    // Errores de recursos (404)
    NOT_FOUND = 'NOT_FOUND',
    RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
    
    // Errores de conflicto (409)
    CONFLICT = 'CONFLICT',
    DUPLICATE_ENTRY = 'DUPLICATE_ENTRY',
    
    // Errores del servidor (500)
    INTERNAL_ERROR = 'INTERNAL_ERROR',
    DATABASE_ERROR = 'DATABASE_ERROR',
    EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
  }
  
  // Estructura del error
  export interface ApiError {
    code: ApiErrorCode;
    message: string;
    details?: string[];
    stack?: string; // Solo en desarrollo
  }
  
  // Metadata común para todas las respuestas
  export interface ResponseMetadata {
    timestamp: string;
    requestId?: string;
    path?: string;
  }
  
  // Respuesta base
  export interface ApiResponse<T = void> {
    success: boolean;
    data?: T;
    error?: ApiError;
    metadata: ResponseMetadata;
  }
  
  // Tipo para respuestas paginadas
  export interface PaginatedApiResponse<T> extends ApiResponse<T> {
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }