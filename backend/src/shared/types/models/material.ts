// backend/src/shared/types/models/material.ts
import { BaseEntity, Status } from '../base/common';

export interface Material extends BaseEntity {
  code: string;
  description: string;
  uom: string;
  availableQuantity: number;
  projectId: number;
  project: {
    id: number;
    name: string;
    description: string | null;
    customer: {
      id: number;
      name: string;
    };
  };
  orderItems?: OrderItem[];
  orderHistory?: OrderHistoryItem[];
  stats?: MaterialStats;
}

export interface OrderHistoryItem {
  orderId: number;
  orderNumber: string;
  quantity: number;
  status: number;
  customerName: string;
  expectedDeliveryDate: Date;
  created_at: Date;
}

export interface OrderItem {
  quantity: number;
  order: {
    orderNumber: string;
    status: number;
    created_at: Date;
  };
}

export interface MaterialStats {
  totalOrders: number;
  totalQuantityOrdered: number;
  averageQuantityPerOrder: number;
}