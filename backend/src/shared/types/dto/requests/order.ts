// backend/src/shared/types/dto/requests/order.ts
import { OrderItemDomain } from '../../../../domain/order';

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

export interface OrderStatsFilters {
  customerId?: number;
  periodInMonths?: number;
}