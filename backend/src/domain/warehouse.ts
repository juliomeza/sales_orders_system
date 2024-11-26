// backend/src/domain/warehouse.ts
export interface WarehouseDomain {
    id: number;
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    email: string | null;
    capacity: number;
    status: number;
    customers?: CustomerRelation[];
    stats?: WarehouseStats;
  }
  
  interface CustomerRelation {
    customerId: number;
    customer: {
      id: number;
      name: string;
    };
  }
  
  interface WarehouseStats {
    orderCount: number;
    customerCount: number;
  }