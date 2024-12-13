// backend/src/shared/types/models/order.ts
import { BaseEntity, Status } from '../base/common';
import { Material } from './material';

export interface Order extends BaseEntity {
  orderNumber: string;
  orderTypeId: number;
  customerId: number;
  shipToAccountId: number;
  billToAccountId: number;
  carrierId: number;
  carrierServiceId: number;
  warehouseId?: number;
  expectedDeliveryDate: Date;
  items: OrderItem[];
  carrier?: {
    name: string;
    lookupCode: string;
  };
  carrierService?: {
    name: string;
    description: string;
  };
  warehouse?: {
    name: string;
    city: string;
    state: string;
  };
  shipToAccount?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  billToAccount?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  };
  customer?: {
    name: string;
  };
}

export interface OrderItem extends BaseEntity {
  materialId: number;
  quantity: number;
  material?: Material;
}