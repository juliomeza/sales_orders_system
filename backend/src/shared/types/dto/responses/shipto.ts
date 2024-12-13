// backend/src/shared/types/dto/responses/shipto.ts
export interface ShipToAddressResponse {
    addresses: ShipToAddressListItem[];
  }
  
  export interface ShipToAddressListItem {
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