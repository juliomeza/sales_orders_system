// backend/src/shared/constants/messages.ts
export const ERROR_MESSAGES = {
    AUTHENTICATION: {
      REQUIRED: 'Authentication required',
      INVALID_CREDENTIALS: 'Invalid credentials',
      INVALID_TOKEN: 'Invalid or expired token',
      ACCESS_DENIED: 'Access denied'
    },
    VALIDATION: {
      REQUIRED_FIELD: 'This field is required',
      INVALID_STATUS: 'Invalid status value',
      INVALID_ROLE: 'Invalid role',
      INVALID_TYPE: 'Invalid type',
      INVALID_QUANTITY: 'Quantity must be greater than zero'
    },
    NOT_FOUND: {
      USER: 'User not found',
      ORDER: 'Order not found',
      MATERIAL: 'Material not found',
      WAREHOUSE: 'Warehouse not found',
      CUSTOMER: 'Customer not found'
    },
    OPERATION: {
      CREATE_ERROR: 'Error creating record',
      UPDATE_ERROR: 'Error updating record',
      DELETE_ERROR: 'Error deleting record',
      LIST_ERROR: 'Error retrieving records'
    }
  } as const;