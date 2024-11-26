// backend/src/services/materials/types.ts
import { MaterialDomain } from '../../domain/material';

export interface MaterialListResponse {
  materials: MaterialSummary[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

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
}

export interface MaterialSearchResponse {
  materials: Array<MaterialDomain & {
    projectName: string;
    customerName: string;
    recentOrders: {
      orderNumber: string;
      status: number;
      quantity: number;
      date: Date;
    }[];
  }>;
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}