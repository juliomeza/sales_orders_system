// backend/src/shared/types/dto/requests/material.ts
import { Status } from '../../base/common';

export interface MaterialFilters {
  search: string;
  uom?: string;
  status?: Status;
  projectId?: number;
  customerId?: number | null;
  page?: number;
  limit?: number;
}

export interface MaterialSearchFilters extends MaterialFilters {
  minQuantity?: number;
  maxQuantity?: number;
}