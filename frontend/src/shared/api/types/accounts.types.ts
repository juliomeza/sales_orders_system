// frontend/src/shared/api/types/accounts.types.ts
export interface ShippingAddressResponse {
    addresses: ShippingAddress[];
  }
  
  export interface ShippingAddress {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  }