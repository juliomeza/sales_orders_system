// backend/src/services/carriers/types.ts
export interface CreateCarrierDTO {
    lookupCode: string;
    name: string;
    status?: number;
  }
  
  export interface UpdateCarrierDTO {
    lookupCode?: string;
    name?: string;
    status?: number;
  }
  
  export interface CreateCarrierServiceDTO {
    lookupCode: string;
    name: string;
    description?: string;
    carrierId: number;
    status?: number;
  }
  
  export interface UpdateCarrierServiceDTO {
    lookupCode?: string;
    name?: string;
    description?: string;
    status?: number;
  }
  
  export interface CarrierFilters {
    status?: number;
    search?: string;
  }