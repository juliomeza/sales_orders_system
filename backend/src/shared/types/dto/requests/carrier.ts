// backend/src/shared/types/dto/requests/carrier.ts
import { Status } from '../../base/common';

export interface CreateCarrierDTO {
  lookupCode: string;
  name: string;
  status?: Status;
}

export interface UpdateCarrierDTO {
  lookupCode?: string;
  name?: string;
  status?: Status;
}

export interface CreateCarrierServiceDTO {
  lookupCode: string;
  name: string;
  description?: string;
  carrierId: number;
  status?: Status;
}

export interface UpdateCarrierServiceDTO {
  lookupCode?: string;
  name?: string;
  description?: string;
  status?: Status;
}

export interface CarrierFilters {
  status?: Status;
  search?: string;
}