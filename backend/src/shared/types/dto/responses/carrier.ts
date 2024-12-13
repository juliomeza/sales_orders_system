// backend/src/shared/types/dto/responses/carrier.ts
import { ServiceResult } from '../../base/common';  // En lugar de ApiResponse
import { Carrier, CarrierService } from '../../models/carrier';

export interface CarriersListData {
  carriers: Carrier[];
  total: number;
}

// Mantener la definición original
export type CarrierResult = ServiceResult<Carrier>;
export type CarrierServiceResult = ServiceResult<CarrierService>;
export type CarriersListResult = ServiceResult<CarriersListData>;