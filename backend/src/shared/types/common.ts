// backend/src/shared/types/common.ts
import { STATUS, ORDER_STATUS, ROLES, ACCOUNT_TYPES, UOM_TYPES } from '../constants';

export type Status = typeof STATUS[keyof typeof STATUS];
export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS];
export type Role = typeof ROLES[keyof typeof ROLES];
export type AccountType = typeof ACCOUNT_TYPES[keyof typeof ACCOUNT_TYPES];
export type UOMType = typeof UOM_TYPES[keyof typeof UOM_TYPES];

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface BaseFilters extends PaginationParams {
  search?: string;
  status?: Status;
}

export interface AuditFields {
  created_at: Date;
  created_by: number | null;
  modified_at: Date;
  modified_by: number | null;
}

export interface BaseEntity extends AuditFields {
  id: number;
  lookupCode: string;
  status: Status;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  errors?: string[];
  message?: string;
}