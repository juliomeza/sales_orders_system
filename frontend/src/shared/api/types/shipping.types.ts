// frontend/src/shared/api/types/shipping.types.ts

// Base interfaces
export interface CarrierService {
  id: number;
  lookupCode: string;
  name: string;
  description: string | null;
  status: number;
}

export interface Carrier {
  id: number;
  lookupCode: string;
  name: string;
  status: number;
  services: CarrierService[];
}

export interface Warehouse {
  id: number;
  lookupCode: string;
  name: string;
  status: number;
  city: string;
  state: string;
  address: string;
}

// Paginated response interface
export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

// Filter interfaces
export interface CarrierFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: number;
  name?: string;
  lookupCode?: string;
}

export interface WarehouseFilters {
  page?: number;
  limit?: number;
  status?: number;
  city?: string;
  state?: string;
}

// Response interfaces
export interface CarriersResponse extends PaginatedResponse<Carrier> {}

export interface WarehousesResponse extends PaginatedResponse<Warehouse> {}