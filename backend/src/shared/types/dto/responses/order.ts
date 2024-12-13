// backend/src/shared/types/dto/responses/order.ts
export interface OrderSummary {
    id: number;
    orderNumber: string;
    status: number;
    expectedDeliveryDate: Date;
    customerName: string;
    itemCount: number;
    totalQuantity: number;
    created_at: Date;
    modified_at: Date;
  }
  
  export interface OrderListResponse {
    orders: OrderSummary[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }