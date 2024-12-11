// backend/src/shared/constants/logMessages.ts
export const LOG_MESSAGES = {
  AUTH: {
    LOGIN: {
      ATTEMPT: 'Login attempt',
      SUCCESS: 'Login successful',
      FAILED: 'Login failed'
    },
    REGISTRATION: {
      ATTEMPT: 'User registration attempt',
      SUCCESS: 'User registration successful',
      FAILED_USER_EXISTS: 'Registration failed - User exists',
      FAILED_VALIDATION: 'Registration failed - Validation errors',
      FAILED_INTERNAL: 'Registration failed - Internal error'
    },
    CURRENT_USER: {
      REQUEST: 'Get current user request',
      SUCCESS: 'Get current user successful',
      FAILED_NO_USER: 'Get current user failed - No user in request',
      FAILED_NOT_FOUND: 'Get current user failed - User not found',
      FAILED_INTERNAL: 'Get current user failed - Internal error',
      FAILED_INACTIVE:'Get current user failed - Inactive user'
    },
    TOKEN: {
      REQUEST: 'Token refresh request',
      SUCCESS: 'Token refresh successful',
      FAILED_NO_USER: 'Token refresh failed - No user in request',
      FAILED: 'Token refresh failed'
    }
  },
  CARRIERS: {
    LIST: {
      REQUEST: 'Get carriers list request',
      SUCCESS: 'Get carriers list successful',
      FAILED: 'Get carriers list failed'
    },
    GET: {
      REQUEST: 'Get carrier by ID request',
      SUCCESS: 'Get carrier successful',
      FAILED_NOT_FOUND: 'Get carrier failed - Not found',
      FAILED: 'Get carrier failed'
    },
    CREATE: {
      ATTEMPT: 'Create carrier attempt',
      SUCCESS: 'Create carrier successful',
      FAILED_VALIDATION: 'Create carrier failed - Validation errors',
      FAILED_EXISTS: 'Create carrier failed - Carrier exists',
      FAILED: 'Create carrier failed'
    },
    UPDATE: {
      ATTEMPT: 'Update carrier attempt',
      SUCCESS: 'Update carrier successful',
      FAILED_NOT_FOUND: 'Update carrier failed - Not found',
      FAILED_VALIDATION: 'Update carrier failed - Validation errors',
      FAILED: 'Update carrier failed',
      FAILED_EXISTS:'Update carrier failed - Carrier exists'
    },
    SERVICES: {
      GET: {
        REQUEST: 'Get carrier service request',
        SUCCESS: 'Get carrier service successful',
        FAILED_NOT_FOUND: 'Get carrier service failed - Service not found',
        FAILED: 'Get carrier service failed'
      },
      LIST: {
        REQUEST: 'Get carrier services list request',
        SUCCESS: 'Get carrier services list successful',
        FAILED_NOT_FOUND: 'Get carrier services failed - Carrier not found',
        FAILED: 'Get carrier services list failed'
      },
      CREATE: {
        ATTEMPT: 'Create carrier service attempt',
        SUCCESS: 'Create carrier service successful',
        FAILED_VALIDATION: 'Create carrier service failed - Validation errors',
        FAILED_CARRIER_NOT_FOUND: 'Create carrier service failed - Carrier not found',
        FAILED_EXISTS: 'Create carrier service failed - Service code already exists',
        FAILED: 'Create carrier service failed'
      },
      UPDATE: {
        ATTEMPT: 'Update carrier service attempt',
        SUCCESS: 'Update carrier service successful',
        FAILED_NOT_FOUND: 'Update carrier service failed - Service not found',
        FAILED_VALIDATION: 'Update carrier service failed - Validation errors',
        FAILED_EXISTS: 'Update carrier service failed - Service code already exists',
        FAILED: 'Update carrier service failed'
      }
    }
  },
  CUSTOMERS: {
    LIST: {
      REQUEST: 'Get customers list request',
      SUCCESS: 'Get customers list successful',
      FAILED: 'Get customers list failed'
    },
    GET: {
      REQUEST: 'Get customer by ID request',
      SUCCESS: 'Get customer successful',
      FAILED_NOT_FOUND: 'Get customer failed - Not found',
      FAILED: 'Get customer failed'
    },
    CREATE: {
      ATTEMPT: 'Create customer attempt',
      SUCCESS: 'Create customer successful',
      FAILED_VALIDATION: 'Create customer failed - Validation errors',
      FAILED_EXISTS: 'Create customer failed - Customer exists',
      FAILED: 'Create customer failed'
    },
    UPDATE: {
      ATTEMPT: 'Update customer attempt',
      SUCCESS: 'Update customer successful',
      FAILED_NOT_FOUND: 'Update customer failed - Not found',
      FAILED_VALIDATION: 'Update customer failed - Validation errors',
      FAILED: 'Update customer failed'
    },
    DELETE: {
      ATTEMPT: 'Delete customer attempt',
      SUCCESS: 'Delete customer successful',
      FAILED_NOT_FOUND: 'Delete customer failed - Not found',
      FAILED: 'Delete customer failed'
    }
  },
  MATERIALS: {
    LIST: {
      REQUEST: 'Get materials list request',
      SUCCESS: 'Get materials list successful',
      FAILED: 'Get materials list failed'
    },
    SEARCH: {
      REQUEST: 'Search materials request',
      SUCCESS: 'Search materials successful',
      FAILED_VALIDATION: 'Search materials failed - Validation errors',
      FAILED: 'Search materials failed'
    },
    GET: {
      REQUEST: 'Get material by ID request',
      SUCCESS: 'Get material successful',
      FAILED_NOT_FOUND: 'Get material failed - Not found',
      FAILED: 'Get material failed'
    },
    UOMS: {
      REQUEST: 'Get UOMs request',
      SUCCESS: 'Get UOMs successful',
      FAILED: 'Get UOMs failed'
    }
  },
  ORDERS: {
    LIST: {
      REQUEST: 'Get orders list request',
      SUCCESS: 'Get orders list successful',
      FAILED: 'Get orders list failed'
    },
    GET: {
      REQUEST: 'Get order by ID request',
      SUCCESS: 'Get order successful',
      FAILED_NOT_FOUND: 'Get order failed - Not found',
      FAILED: 'Get order failed',
      FAILED_ACCESS_DENIED: 'Get order failed - Access Denied'
    },
    CREATE: {
      ATTEMPT: 'Create order attempt',
      SUCCESS: 'Create order successful',
      FAILED_VALIDATION: 'Create order failed - Validation errors',
      FAILED: 'Create order failed'
    },
    UPDATE: {
      ATTEMPT: 'Update order attempt',
      SUCCESS: 'Update order successful',
      FAILED_NOT_FOUND: 'Update order failed - Not found',
      FAILED_VALIDATION: 'Update order failed - Validation errors',
      FAILED_ACCESS_DENIED: 'Update order failed - Access denied',
      FAILED_DRAFT_ONLY: 'Update order failed - Not in draft status',
      FAILED: 'Update order failed'
    },
    DELETE: {
      ATTEMPT: 'Delete order attempt',
      SUCCESS: 'Delete order successful',
      FAILED_NOT_FOUND: 'Delete order failed - Not found',
      FAILED_ACCESS_DENIED: 'Delete order failed - Access denied',
      FAILED_DRAFT_ONLY: 'Delete order failed - Not in draft status',
      FAILED: 'Delete order failed'
    },
    STATS: {
      REQUEST: 'Get order stats request',
      SUCCESS: 'Get order stats successful',
      FAILED: 'Get order stats failed'
    }
  },
  SHIP_TO: {
    LIST: {
      REQUEST: 'List shipping addresses request',
      SUCCESS: 'Successfully retrieved shipping addresses',
      FAILED: 'Failed to list shipping addresses',
      FAILED_AUTH: 'Unauthenticated access attempt to list shipping addresses',
      FAILED_ROLE: 'Non-client user attempted to access shipping addresses',
      FAILED_CUSTOMER: 'Client user without customer ID attempted to access shipping addresses'
    },
    CREATE: {
      ATTEMPT: 'Create shipping address attempt',
      SUCCESS: 'Successfully created shipping address',
      FAILED: 'Failed to create shipping address',
      FAILED_AUTH: 'Unauthenticated access attempt to create shipping address',
      FAILED_ROLE: 'Non-client user attempted to create shipping address',
      FAILED_CUSTOMER: 'Client user without customer ID attempted to create shipping address',
      FAILED_VALIDATION: 'Validation failed while creating shipping address'
    },
    BILLING: {
      REQUEST: 'List billing addresses request',
      SUCCESS: 'Successfully retrieved billing addresses',
      FAILED: 'Failed to list billing addresses',
      FAILED_AUTH: 'Unauthenticated access attempt to list billing addresses',
      FAILED_ROLE: 'Non-client user attempted to access billing addresses',
      FAILED_CUSTOMER: 'Client user without customer ID attempted to access billing addresses'
    }
  },
  WAREHOUSES: {
    LIST: {
      REQUEST: 'List warehouses request',
      SUCCESS: 'Successfully retrieved warehouses list',
      FAILED: 'Failed to list warehouses',
      FAILED_AUTH: 'Unauthenticated access attempt to list warehouses',
      FAILED_VALIDATION: 'Validation failed while listing warehouses'
    },
    GET: {
      REQUEST: 'Get warehouse by ID request',
      SUCCESS: 'Successfully retrieved warehouse',
      FAILED: 'Failed to get warehouse',
      FAILED_AUTH: 'Unauthenticated access attempt to get warehouse',
      FAILED_NOT_FOUND: 'Attempted to access non-existent warehouse'
    },
    CREATE: {
      ATTEMPT: 'Create warehouse attempt',
      SUCCESS: 'Successfully created warehouse',
      FAILED: 'Failed to create warehouse',
      FAILED_AUTH: 'Unauthenticated access attempt to create warehouse',
      FAILED_VALIDATION: 'Validation failed while creating warehouse'
    },
    UPDATE: {
      ATTEMPT: 'Update warehouse attempt',
      SUCCESS: 'Successfully updated warehouse',
      FAILED: 'Failed to update warehouse',
      FAILED_AUTH: 'Unauthenticated access attempt to update warehouse',
      FAILED_VALIDATION: 'Validation failed while updating warehouse',
      FAILED_NOT_FOUND: 'Update attempted on non-existent warehouse'
    },
    DELETE: {
      ATTEMPT: 'Delete warehouse attempt',
      SUCCESS: 'Successfully deleted warehouse',
      FAILED: 'Failed to delete warehouse',
      FAILED_AUTH: 'Unauthenticated access attempt to delete warehouse',
      FAILED_NOT_FOUND: 'Delete attempted on non-existent warehouse',
      DEACTIVATED: 'Warehouse deactivated due to existing orders'
    },
    STATS: {
      REQUEST: 'Get warehouse stats request',
      SUCCESS: 'Successfully retrieved warehouse stats',
      FAILED: 'Failed to get warehouse stats',
      FAILED_AUTH: 'Unauthenticated access attempt to get warehouse stats'
    }
  }
} as const;