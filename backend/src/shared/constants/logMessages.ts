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
        FAILED_INTERNAL: 'Get current user failed - Internal error'
      },
      TOKEN: {
        REQUEST: 'Token refresh request',
        SUCCESS: 'Token refresh successful',
        FAILED_NO_USER: 'Token refresh failed - No user in request',
        FAILED: 'Token refresh failed'
      }
    }
  } as const;