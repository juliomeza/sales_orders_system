// backend/src/shared/constants/messages.ts
export const ERROR_MESSAGES = {
    AUTHENTICATION: {
      REQUIRED: 'Authentication required',
      INVALID_CREDENTIALS: 'Invalid credentials',
      INVALID_TOKEN: 'Invalid or expired token',
      ACCESS_DENIED: 'Access denied',
      USER_EXISTS: 'User already exists',
      ACCOUNT_INACTIVE: 'Account is inactive'
    },
    VALIDATION: {
      REQUIRED_FIELD: 'This field is required',
      INVALID_STATUS: 'Invalid status value',
      INVALID_ROLE: 'Invalid role',
      INVALID_TYPE: 'Invalid type',
      INVALID_QUANTITY: 'Quantity must be greater than zero',
      FAILED: 'Validation failed',
      INVALID_PASSWORD: 'Password must be at least 8 characters long',
      INVALID_EMAIL: 'Invalid email format',
      INVALID_CODE: 'Invalid code format',
      INVALID_NAME: 'Invalid name format',
      CODE_EXISTS: 'Code already exists'
    },
    NOT_FOUND: {
      USER: 'User not found',
      ORDER: 'Order not found',
      MATERIAL: 'Material not found',
      WAREHOUSE: 'Warehouse not found',
      CUSTOMER: 'Customer not found',
      CARRIER: 'Carrier not found',
      CARRIER_SERVICE: 'Carrier service not found'
    },
    OPERATION: {
      CREATE_ERROR: 'Error creating record',
      UPDATE_ERROR: 'Error updating record',
      DELETE_ERROR: 'Error deleting record',
      LIST_ERROR: 'Error retrieving records',
      SEARCH_ERROR: 'Error searching records',
      LOGIN_ERROR: 'Error during login',
      TOKEN_REFRESH_ERROR: 'Error refreshing token'
    }
  } as const;