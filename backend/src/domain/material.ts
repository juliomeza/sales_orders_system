// backend/src/domain/material.ts
export interface MaterialDomain {
    id: number;
    lookupCode: string;
    code: string;
    description: string;
    uom: string;
    availableQuantity: number;
    status: number;
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
  
  export interface MaterialFilters {
    search: string;
    uom?: string;
    status?: number;
    projectId?: number;
    customerId?: number | null;
    page?: number;
    limit?: number;
  }
  
  export interface MaterialSearchFilters extends MaterialFilters {
    minQuantity?: number;
    maxQuantity?: number;
  }
  
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
    recentOrders?: RecentOrder[];
  }
  
  export interface RecentOrder {
    orderNumber: string;
    status: number;
    quantity: number;
    date: Date;
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