// backend/src/shared/types/models/carrier.ts
import { BaseEntity, Status } from '../base/common';
import { Carrier as CarrierDomain, CarrierService as CarrierServiceDomain } from '../../../domain/carrier';

// Por ahora mantenemos la compatibilidad con el dominio
export type Carrier = CarrierDomain;
export type CarrierService = CarrierServiceDomain;