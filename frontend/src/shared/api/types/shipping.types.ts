// frontend/src/shared/api/types/shipping.types.ts
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
  
  export interface CarriersResponse {
    carriers: Carrier[];
    total: number;
  }
  
  export interface WarehousesResponse {
    warehouses: Warehouse[];
    total: number;
  }