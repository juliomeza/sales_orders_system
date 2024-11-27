// backend/src/domain/shipTo.ts
export interface ShipToAddressDomain {
    id: number;
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    email: string | null;
    contactName: string | null;
    customerId: number;
    accountType: 'SHIP_TO' | 'BILL_TO' | 'BOTH';
    status: number;
  }
  
  export interface ShipToAddressSummary {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    contactName?: string;
  }