// backend/src/services/carriers/carrierService.ts
import { ServiceResult } from '../../shared/types';
import { ERROR_MESSAGES, STATUS } from '../../shared/constants';
import { Carrier, CarrierService as ICarrierService } from '../../domain/carrier';
import { CarrierRepository } from '../../repositories/carrierRepository';
import { validateCarrier, validateCarrierService } from './validation';
import { 
  CarrierFilters, 
  CreateCarrierDTO, 
  CreateCarrierServiceDTO, 
  UpdateCarrierDTO, 
  UpdateCarrierServiceDTO,
  CarrierResult,
  CarrierServiceResult,
  CarriersListResult
} from './types';

export class CarrierServiceImpl {
  constructor(private carrierRepository: CarrierRepository) {}
  
  async getAllCarriers(filters?: CarrierFilters): Promise<CarriersListResult> {
    try {
      const carriers = await this.carrierRepository.findAll(filters);
      return {
        success: true,
        data: {
          carriers,
          total: carriers.length
        }
      };
    } catch (error) {
      console.error('Error in getAllCarriers:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getCarrierById(id: number): Promise<CarrierResult> {
    try {
      const carrier = await this.carrierRepository.findById(id);
      if (!carrier) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }
      return {
        success: true,
        data: carrier
      };
    } catch (error) {
      console.error('Error in getCarrierById:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createCarrier(data: CreateCarrierDTO): Promise<CarrierResult> {
    try {
      // Validate carrier data
      const validationErrors = validateCarrier(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Check for existing carrier
      const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
      if (existing) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
        };
      }

      const carrierData = {
        ...data,
        status: data.status ?? STATUS.ACTIVE
      };

      const carrier = await this.carrierRepository.create(carrierData);
      return {
        success: true,
        data: carrier
      };
    } catch (error) {
      console.error('Error in createCarrier:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateCarrier(id: number, data: UpdateCarrierDTO): Promise<CarrierResult> {
    try {
      // Validate carrier existence
      const carrier = await this.carrierRepository.findById(id);
      if (!carrier) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }

      // Validate update data
      const validationErrors = validateCarrier(data, true);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Check lookup code uniqueness if it's being updated
      if (data.lookupCode && data.lookupCode !== carrier.lookupCode) {
        const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
        if (existing) {
          return {
            success: false,
            error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
          };
        }
      }

      const updatedCarrier = await this.carrierRepository.update(id, data);
      return {
        success: true,
        data: updatedCarrier
      };
    } catch (error) {
      console.error('Error in updateCarrier:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }

  async getServiceById(id: number): Promise<CarrierServiceResult> {
    try {
      const service = await this.carrierRepository.findServiceById(id);
      if (!service) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER_SERVICE
        };
      }
      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error in getServiceById:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createCarrierService(data: CreateCarrierServiceDTO): Promise<CarrierServiceResult> {
    try {
      // Validate service data
      const validationErrors = validateCarrierService(data);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Validate carrier existence
      const carrier = await this.carrierRepository.findById(data.carrierId);
      if (!carrier) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }

      // Check for existing service
      const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
      if (existing) {
        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
        };
      }

      const serviceData = {
        ...data,
        status: data.status ?? STATUS.ACTIVE
      };

      const service = await this.carrierRepository.createService(serviceData);
      return {
        success: true,
        data: service
      };
    } catch (error) {
      console.error('Error in createCarrierService:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateCarrierService(id: number, data: UpdateCarrierServiceDTO): Promise<CarrierServiceResult> {
    try {
      // Validate service existence
      const service = await this.carrierRepository.findServiceById(id);
      if (!service) {
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER_SERVICE
        };
      }

      // Validate update data
      const validationErrors = validateCarrierService(data, true);
      if (validationErrors.length > 0) {
        return {
          success: false,
          errors: validationErrors
        };
      }

      // Check lookup code uniqueness if it's being updated
      if (data.lookupCode && data.lookupCode !== service.lookupCode) {
        const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
        if (existing) {
          return {
            success: false,
            error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
          };
        }
      }

      const updatedService = await this.carrierRepository.updateService(id, data);
      return {
        success: true,
        data: updatedService
      };
    } catch (error) {
      console.error('Error in updateCarrierService:', error);
      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }
}