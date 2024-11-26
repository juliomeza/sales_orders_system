// backend/src/services/orders/types.ts
import { OrderItemDomain } from '../../domain/order';

export interface CreateOrderDTO {
  orderTypeId: number;
  customerId: number;
  shipToAccountId: number;
  billToAccountId: number;
  carrierId: number;
  carrierServiceId: number;
  warehouseId?: number;
  expectedDeliveryDate: string;
  items: OrderItemDomain[];
}

export interface UpdateOrderDTO {
  orderTypeId?: number;
  shipToAccountId?: number;
  billToAccountId?: number;
  carrierId?: number;
  carrierServiceId?: number;
  warehouseId?: number;
  expectedDeliveryDate?: string;
  items?: OrderItemDomain[];
}

export interface OrderFilters {
  status?: number;
  fromDate?: Date;
  toDate?: Date;
  customerId?: number;
  page?: number;
  limit?: number;
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

export interface OrderStatsFilters {
  customerId?: number;
  periodInMonths?: number;
}