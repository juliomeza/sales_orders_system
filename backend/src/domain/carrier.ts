// backend/src/domain/carrier.ts
export interface Carrier {
    id: number;
    lookupCode: string;
    name: string;
    status: number;
    created_at: Date;
    created_by: number | null;
    modified_at: Date;
    modified_by: number | null;
    services: CarrierService[];
  }
  
  export interface CarrierService {
    id: number;
    lookupCode: string;
    name: string;
    description: string | null;
    carrierId: number;
    carrier?: Carrier;
    status: number;
    created_at: Date;
    created_by: number | null;
    modified_at: Date;
    modified_by: number | null;
  }