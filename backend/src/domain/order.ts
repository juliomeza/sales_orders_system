// backend/src/domain/order.ts

export interface OrderDomain {
    id: number;
    lookupCode: string;
    orderNumber: string;
    status: number;
    orderTypeId: number;
    customerId: number;
    shipToAccountId: number;
    billToAccountId: number;
    carrierId: number;
    carrierServiceId: number;
    warehouseId?: number;
    expectedDeliveryDate: Date;
    created_at: Date;
    modified_at: Date;
    created_by?: number;
    modified_by?: number;
    items: OrderItemDomain[];
    carrier?: CarrierDomain;
    carrierService?: CarrierServiceDomain;
    warehouse?: WarehouseDomain;
    shipToAccount?: AccountDomain;
    billToAccount?: AccountDomain;
    customer?: CustomerDomain;
  }
  
  export interface OrderItemDomain {
    id?: number;
    materialId: number;
    quantity: number;
    status: number;
    material?: {
      code: string;
      description: string;
      uom: string;
    };
  }
  
  export interface CarrierDomain {
    name: string;
    lookupCode: string;
  }
  
  export interface CarrierServiceDomain {
    name: string;
    description: string;
  }
  
  export interface WarehouseDomain {
    name: string;
    city: string;
    state: string;
  }
  
  export interface AccountDomain {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }
  
  export interface CustomerDomain {
    name: string;
  }
  
  export interface OrderStatsDomain {
    totalOrders: number;
    ordersByStatus: OrderStatusStats[];
    ordersByMonth: OrderMonthStats[];
    topCarriers: TopCarrierStats[];
    topMaterials: TopMaterialStats[];
  }
  
  export interface OrderStatusStats {
    status: number;
    count: number;
    percentage: string;
  }
  
  export interface OrderMonthStats {
    month: string;
    count: number;
  }
  
  export interface TopCarrierStats {
    carrierId: number;
    carrierName: string;
    orderCount: number;
  }
  
  export interface TopMaterialStats {
    materialId: number;
    materialCode: string;
    orderCount: number;
    totalQuantity: number;
  }
  
  // Constantes del dominio
  export const OrderStatus = {
    DRAFT: 10,
    SUBMITTED: 11,
    PROCESSING: 12,
    COMPLETED: 13
  } as const;