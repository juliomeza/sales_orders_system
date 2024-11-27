// backend/src/servces/shipTo/types.ts
import { ShipToAddressSummary } from '../../domain/shipTo';

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

export interface ShipToAddressResponse {
  addresses: ShipToAddressSummary[];
}