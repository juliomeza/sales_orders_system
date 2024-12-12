// backend/src/shared/types/carriers.types.ts
import { ServiceResult } from '.';
import { Carrier, CarrierService } from '../../domain/carrier';

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

export interface CarriersListData {
  carriers: Carrier[];
  total: number;
}

// Result types
export type CarrierResult = ServiceResult<Carrier>;
export type CarrierServiceResult = ServiceResult<CarrierService>;
export type CarriersListResult = ServiceResult<CarriersListData>;