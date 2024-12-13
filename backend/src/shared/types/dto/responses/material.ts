// backend/src/shared/types/dto/responses/material.ts
import { Material } from '../../models/material';
import { ApiResponse } from '../../base/responses';

export interface MaterialSummary {
  id: number;
  code: string;
  lookupCode: string;
  description: string;
  uom: string;
  availableQuantity: number;
  status: number;
  projectName: string;
  customerName: string;
  orderCount: number;
  recentOrders?: RecentOrder[];
}

export interface RecentOrder {
  orderNumber: string;
  status: number;
  quantity: number;
  date: Date;
}

export interface MaterialListResponse extends ApiResponse<{
  materials: MaterialSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}

export interface MaterialResponse extends ApiResponse<Material> {}

export interface MaterialSearchResponse extends ApiResponse<{
  materials: Array<Material & {
    projectName: string;
    customerName: string;
    recentOrders: RecentOrder[];
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}> {}