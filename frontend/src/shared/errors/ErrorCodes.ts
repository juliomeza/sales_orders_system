// frontend/src/shared/errors/ErrorCodes.ts
export const API_ERROR_CODES = {
    // Network Errors (1000-1999)
    NETWORK_ERROR: 'ERR_1000',
    REQUEST_TIMEOUT: 'ERR_1001',
    SERVER_ERROR: 'ERR_1002',
    SERVICE_UNAVAILABLE: 'ERR_1003',
  
    // Authentication Errors (2000-2999)
    UNAUTHORIZED: 'ERR_2000',
    INVALID_CREDENTIALS: 'ERR_2001',
    TOKEN_EXPIRED: 'ERR_2002',
    SESSION_EXPIRED: 'ERR_2003',
  
    // Authorization Errors (3000-3999)
    FORBIDDEN: 'ERR_3000',
    INSUFFICIENT_PERMISSIONS: 'ERR_3001',
    INVALID_ROLE: 'ERR_3002',
  
    // Validation Errors (4000-4999)
    VALIDATION_ERROR: 'ERR_4000',
    INVALID_INPUT: 'ERR_4001',
    REQUIRED_FIELD: 'ERR_4002',
    INVALID_FORMAT: 'ERR_4003',
    DUPLICATE_ENTRY: 'ERR_4004',
  
    // Business Logic Errors (5000-5999)
    BUSINESS_RULE_VIOLATION: 'ERR_5000',
    INSUFFICIENT_INVENTORY: 'ERR_5001',
    ORDER_NOT_FOUND: 'ERR_5002',
    INVALID_ORDER_STATE: 'ERR_5003',
    SHIPPING_ERROR: 'ERR_5004',
  
    // Technical Errors (9000-9999)
    UNKNOWN_ERROR: 'ERR_9000',
    DATA_CORRUPTION: 'ERR_9001',
    INTEGRATION_ERROR: 'ERR_9002'
  } as const;
  
  export const HTTP_STATUS_TO_ERROR_CODE: Record<number, string> = {
    400: API_ERROR_CODES.VALIDATION_ERROR,
    401: API_ERROR_CODES.UNAUTHORIZED,
    403: API_ERROR_CODES.FORBIDDEN,
    404: API_ERROR_CODES.ORDER_NOT_FOUND,
    408: API_ERROR_CODES.REQUEST_TIMEOUT,
    409: API_ERROR_CODES.DUPLICATE_ENTRY,
    500: API_ERROR_CODES.SERVER_ERROR,
    503: API_ERROR_CODES.SERVICE_UNAVAILABLE
  };
  
  export const getErrorCodeFromStatus = (status: number): string => {
    return HTTP_STATUS_TO_ERROR_CODE[status] || API_ERROR_CODES.UNKNOWN_ERROR;
  };