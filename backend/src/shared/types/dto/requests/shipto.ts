// backend/src/shared/types/dto/requests/shipto.ts
export interface CreateShipToAddressDTO {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone?: string;
    email?: string;
    contactName?: string;
    accountType?: 'SHIP_TO' | 'BILL_TO' | 'BOTH';
  }