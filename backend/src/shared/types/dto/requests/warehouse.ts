// backend/src/shared/types/dto/requests/warehouse.ts
export interface CreateWarehouseDTO {
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string | null;
    email?: string | null;
    capacity: number;
    customerIds?: number[];
  }
  
  export interface UpdateWarehouseDTO {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string | null;
    email?: string | null;
    capacity?: number;
    status?: number;
    customerIds?: number[];
  }
  
  export interface WarehouseFilters {
    search?: string;
    status?: number;
    city?: string;
    state?: string;
    customerId?: number;
    page?: number;
    limit?: number;
  }