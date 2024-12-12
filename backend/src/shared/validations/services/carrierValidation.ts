// backend/src/shared/validations/services/carrierValidation.ts
import { 
  CreateCarrierDTO, 
  UpdateCarrierDTO, 
  CreateCarrierServiceDTO, 
  UpdateCarrierServiceDTO 
} from '../../types/carriers.types';
import { ERROR_MESSAGES } from '../../constants';

export class CarrierValidation {
  static validateCarrier(data: CreateCarrierDTO | UpdateCarrierDTO, isUpdate: boolean = false): string[] {
    const errors: string[] = [];

    if (!isUpdate || data.lookupCode !== undefined) {
      if (!data.lookupCode?.trim()) {
        errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('lookupCode'));
      } else if (data.lookupCode.length > 50) {
        errors.push(ERROR_MESSAGES.VALIDATION.MAX_LENGTH_EXCEEDED('lookupCode', 50));
      }
    }

    if (!isUpdate || data.name !== undefined) {
      if (!data.name?.trim()) {
        errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('name'));
      } else if (data.name.length > 100) {
        errors.push(ERROR_MESSAGES.VALIDATION.MAX_LENGTH_EXCEEDED('name', 100));
      }
    }

    if (data.status !== undefined && ![1, 2].includes(data.status)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_STATUS);
    }

    return errors;
  }

  static validateCarrierService(data: CreateCarrierServiceDTO | UpdateCarrierServiceDTO, isUpdate: boolean = false): string[] {
    const errors: string[] = [];

    if (!isUpdate || data.lookupCode !== undefined) {
      if (!data.lookupCode?.trim()) {
        errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('lookupCode'));
      } else if (data.lookupCode.length > 50) {
        errors.push(ERROR_MESSAGES.VALIDATION.MAX_LENGTH_EXCEEDED('lookupCode', 50));
      }
    }

    if (!isUpdate || data.name !== undefined) {
      if (!data.name?.trim()) {
        errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('name'));
      } else if (data.name.length > 100) {
        errors.push(ERROR_MESSAGES.VALIDATION.MAX_LENGTH_EXCEEDED('name', 100));
      }
    }

    if (data.description && data.description.length > 255) {
      errors.push(ERROR_MESSAGES.VALIDATION.MAX_LENGTH_EXCEEDED('description', 255));
    }

    if ('carrierId' in data && !data.carrierId) {
      errors.push(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('carrierId'));
    }

    if (data.status !== undefined && ![1, 2].includes(data.status)) {
      errors.push(ERROR_MESSAGES.VALIDATION.INVALID_STATUS);
    }

    return errors;
  }
}