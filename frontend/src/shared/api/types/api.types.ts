// frontend/src/shared/api/types/api.types.ts

// Tipo genérico para respuestas de API
export interface ApiResponse<T> {
    data: T;
    message?: string;
    status: number;
  }
  
  // Tipo para respuestas paginadas
  export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    limit: number;
  }
  
  // Tipos específicos para errores de API
  export interface ApiError {
    code: string;
    message: string;
    details?: any;
  }
  
  // Tipos para respuestas de autenticación
  export interface AuthResponse {
    token: string;
    user: {
      id: number;
      email: string;
      role: 'ADMIN' | 'CLIENT';
      customerId?: number;
    };
  }