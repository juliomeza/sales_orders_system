// backend/src/controllers/materials/material.controller.ts
import { Prisma } from '@prisma/client';

export interface MaterialFilters {
  search: string;
  uom?: string;
  status?: number;
  projectId?: number;
  customerId?: number | null;
}

export interface MaterialSearchFilters {
  query: string;
  uom?: string;
  minQuantity?: number;
  maxQuantity?: number;
  projectId?: number;
  customerId?: number | null;
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface RecentOrder {
  orderNumber: string;
  status: number;
  quantity: number;
  date: Date;
}

export interface MaterialListResponse {
  materials: Array<{
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
  }>;
  pagination: Pagination;
}

export interface MaterialSearchResponse {
  materials: Array<{
    id: number;
    code: string;
    lookupCode: string;
    description: string;
    uom: string;
    availableQuantity: number;
    status: number;
    projectName: string;
    customerName: string;
    recentOrders: RecentOrder[];
  }>;
  pagination: Pagination;
}

export interface MaterialDetail {
  id: number;
  code: string;
  lookupCode: string;
  description: string;
  uom: string;
  availableQuantity: number;
  status: number;
  project: {
    id: number;
    name: string;
    description: string | null;
    customer: {
      id: number;
      name: string;
    };
  };
  orderHistory: Array<{
    orderId: number;
    orderNumber: string;
    quantity: number;
    status: number;
    customerName: string;
    expectedDeliveryDate: Date;
    created_at: Date;
  }>;
  stats: {
    totalOrders: number;
    totalQuantityOrdered: number;
    averageQuantityPerOrder: number;
  };
}

export const buildMaterialWhereClause = (filters: MaterialFilters): Prisma.MaterialWhereInput => {
  const conditions: Prisma.MaterialWhereInput[] = [
    {
      OR: [
        { code: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
        { lookupCode: { contains: filters.search, mode: 'insensitive' } }
      ]
    }
  ];

  if (filters.uom) {
    conditions.push({ uom: filters.uom });
  }

  if (filters.status !== undefined) {
    conditions.push({ status: filters.status });
  }

  if (filters.projectId) {
    conditions.push({ projectId: filters.projectId });
  }

  if (filters.customerId) {
    conditions.push({
      project: {
        customerId: filters.customerId
      }
    });
  }

  return { AND: conditions };
};

export const formatMaterialResponse = (material: any): MaterialDetail => {
  const totalQuantityOrdered = material.orderItems.reduce(
    (sum: number, item: any) => sum + item.quantity, 
    0
  );

  return {
    id: material.id,
    code: material.code,
    lookupCode: material.lookupCode,
    description: material.description,
    uom: material.uom,
    availableQuantity: material.availableQuantity,
    status: material.status,
    project: {
      id: material.project.id,
      name: material.project.name,
      description: material.project.description,
      customer: {
        id: material.project.customer.id,
        name: material.project.customer.name
      }
    },
    orderHistory: material.orderItems.map((item: any) => ({
      orderId: item.orderId,
      orderNumber: item.order.orderNumber,
      quantity: item.quantity,
      status: item.status,
      customerName: item.order.customer.name,
      expectedDeliveryDate: item.order.expectedDeliveryDate,
      created_at: item.created_at
    })),
    stats: {
      totalOrders: material._count.orderItems,
      totalQuantityOrdered,
      averageQuantityPerOrder: material._count.orderItems > 0 
        ? Math.round(totalQuantityOrdered / material._count.orderItems) 
        : 0
    }
  };
};