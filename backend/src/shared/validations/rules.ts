// backend/src/shared/validations/rules.ts
import { STATUS, ROLES, ACCOUNT_TYPES } from '../constants';

import { Status, Role } from '../types';

export const rules = {
  isRequired: (value: any): boolean => {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0;
    if (typeof value === 'number') return true;
    if (Array.isArray(value)) return value.length > 0;
    return !!value;
  },

  isValidStatus: (status: Status): boolean => 
    [STATUS.ACTIVE, STATUS.INACTIVE, STATUS.DELETED].includes(status),

  isValidRole: (role: string): boolean => 
    Object.values(ROLES).includes(role as keyof typeof ROLES),

  isValidAccountType: (type: string): boolean => 
    Object.values(ACCOUNT_TYPES).includes(type as keyof typeof ACCOUNT_TYPES),

  isValidEmail: (email: string): boolean => 
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),

  isMinLength: (value: string, min: number): boolean => 
    value.length >= min,

  isMaxLength: (value: string, max: number): boolean => 
    value.length <= max,

  isPositiveNumber: (value: number): boolean => 
    typeof value === 'number' && value > 0,

  isValidLookupCode: (code: string): boolean => 
    /^[A-Z0-9-_]+$/.test(code)
};