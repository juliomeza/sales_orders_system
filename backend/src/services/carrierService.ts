// backend/src/services/carrierService.ts
import { ERROR_MESSAGES, STATUS, LOG_MESSAGES } from '../shared/constants';
import { CarrierRepository } from '../repositories/carrierRepository';
import { CarrierValidation  } from '../shared/validations/services/carrierValidation';
import Logger from '../config/logger';
import { 
  CarrierFilters, 
  CreateCarrierDTO, 
  CreateCarrierServiceDTO, 
  UpdateCarrierDTO, 
  UpdateCarrierServiceDTO,
  CarrierResult,
  CarrierServiceResult,
  CarriersListResult
} from '../shared/types/carriers.types';

export class CarrierServiceImpl {
  constructor(private carrierRepository: CarrierRepository) {}
  
  async getAllCarriers(filters?: CarrierFilters): Promise<CarriersListResult> {
    Logger.debug(LOG_MESSAGES.CARRIERS.LIST.REQUEST, {
      filters
    });

    try {
      const carriers = await this.carrierRepository.findAll(filters);
      
      Logger.info(LOG_MESSAGES.CARRIERS.LIST.SUCCESS, {
        count: carriers.length,
        filters
      });

      return {
        success: true,
        data: {
          carriers,
          total: carriers.length
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.LIST.FAILED, {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getCarrierById(id: number): Promise<CarrierResult> {
    Logger.debug(LOG_MESSAGES.CARRIERS.GET.REQUEST, { carrierId: id });

    try {
      const carrier = await this.carrierRepository.findById(id);
      
      if (!carrier) {
        Logger.warn(LOG_MESSAGES.CARRIERS.GET.FAILED_NOT_FOUND, { carrierId: id });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }

      Logger.info(LOG_MESSAGES.CARRIERS.GET.SUCCESS, {
        carrierId: id,
        lookupCode: carrier.lookupCode
      });

      return {
        success: true,
        data: carrier
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.GET.FAILED, {
        carrierId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createCarrier(data: CreateCarrierDTO): Promise<CarrierResult> {
    Logger.info(LOG_MESSAGES.CARRIERS.CREATE.ATTEMPT, {
      lookupCode: data.lookupCode,
      name: data.name
    });

    try {
      const validationErrors = CarrierValidation.validateCarrier(data);
      if (validationErrors.length > 0) {
        Logger.warn(LOG_MESSAGES.CARRIERS.CREATE.FAILED_VALIDATION, {
          lookupCode: data.lookupCode,
          errors: validationErrors
        });

        return {
          success: false,
          errors: validationErrors
        };
      }

      const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
      if (existing) {
        Logger.warn(LOG_MESSAGES.CARRIERS.CREATE.FAILED_EXISTS, {
          lookupCode: data.lookupCode
        });

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

      Logger.info(LOG_MESSAGES.CARRIERS.CREATE.SUCCESS, {
        carrierId: carrier.id,
        lookupCode: carrier.lookupCode
      });

      return {
        success: true,
        data: carrier
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.CREATE.FAILED, {
        lookupCode: data.lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateCarrier(id: number, data: UpdateCarrierDTO): Promise<CarrierResult> {
    Logger.info(LOG_MESSAGES.CARRIERS.UPDATE.ATTEMPT, {
      carrierId: id,
      updateData: data
    });

    try {
      const carrier = await this.carrierRepository.findById(id);
      if (!carrier) {
        Logger.warn(LOG_MESSAGES.CARRIERS.UPDATE.FAILED_NOT_FOUND, { carrierId: id });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }

      const validationErrors = CarrierValidation.validateCarrier(data, true);
      if (validationErrors.length > 0) {
        Logger.warn(LOG_MESSAGES.CARRIERS.UPDATE.FAILED_VALIDATION, {
          carrierId: id,
          errors: validationErrors
        });

        return {
          success: false,
          errors: validationErrors
        };
      }

      if (data.lookupCode && data.lookupCode !== carrier.lookupCode) {
        const existing = await this.carrierRepository.findByLookupCode(data.lookupCode);
        if (existing) {
          Logger.warn(LOG_MESSAGES.CARRIERS.UPDATE.FAILED_EXISTS, {
            carrierId: id,
            lookupCode: data.lookupCode
          });

          return {
            success: false,
            error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
          };
        }
      }

      const updatedCarrier = await this.carrierRepository.update(id, data);

      Logger.info(LOG_MESSAGES.CARRIERS.UPDATE.SUCCESS, {
        carrierId: id,
        lookupCode: updatedCarrier.lookupCode
      });

      return {
        success: true,
        data: updatedCarrier
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.UPDATE.FAILED, {
        carrierId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }

  async getServiceById(id: number): Promise<CarrierServiceResult> {
    Logger.debug(LOG_MESSAGES.CARRIERS.SERVICES.GET.REQUEST, { serviceId: id });

    try {
      const service = await this.carrierRepository.findServiceById(id);
      
      if (!service) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.GET.FAILED_NOT_FOUND, { serviceId: id });
        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER_SERVICE
        };
      }

      Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.GET.SUCCESS, {
        serviceId: id,
        lookupCode: service.lookupCode
      });

      return {
        success: true,
        data: service
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.SERVICES.GET.FAILED, {
        serviceId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async createCarrierService(data: CreateCarrierServiceDTO): Promise<CarrierServiceResult> {
    Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.ATTEMPT, {
      carrierId: data.carrierId,
      lookupCode: data.lookupCode,
      name: data.name
    });

    try {
      const validationErrors = CarrierValidation.validateCarrierService(data);
      if (validationErrors.length > 0) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.FAILED_VALIDATION, {
          carrierId: data.carrierId,
          errors: validationErrors
        });

        return {
          success: false,
          errors: validationErrors
        };
      }

      const carrier = await this.carrierRepository.findById(data.carrierId);
      if (!carrier) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.FAILED_CARRIER_NOT_FOUND, {
          carrierId: data.carrierId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER
        };
      }

      const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
      if (existing) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.FAILED_EXISTS, {
          lookupCode: data.lookupCode
        });

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

      Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.SUCCESS, {
        serviceId: service.id,
        carrierId: service.carrierId,
        lookupCode: service.lookupCode
      });

      return {
        success: true,
        data: service
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.SERVICES.CREATE.FAILED, {
        carrierId: data.carrierId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateCarrierService(id: number, data: UpdateCarrierServiceDTO): Promise<CarrierServiceResult> {
    Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.ATTEMPT, {
      serviceId: id,
      updateData: data
    });

    try {
      const service = await this.carrierRepository.findServiceById(id);
      if (!service) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.FAILED_NOT_FOUND, {
          serviceId: id
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.CARRIER_SERVICE
        };
      }

      const validationErrors = CarrierValidation.validateCarrierService(data, true);
      if (validationErrors.length > 0) {
        Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.FAILED_VALIDATION, {
          serviceId: id,
          errors: validationErrors
        });

        return {
          success: false,
          errors: validationErrors
        };
      }

      if (data.lookupCode && data.lookupCode !== service.lookupCode) {
        const existing = await this.carrierRepository.findServiceByLookupCode(data.lookupCode);
        if (existing) {
          Logger.warn(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.FAILED_EXISTS, {
            serviceId: id,
            lookupCode: data.lookupCode
          });

          return {
            success: false,
            error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
          };
        }
      }

      const updatedService = await this.carrierRepository.updateService(id, data);

      Logger.info(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.SUCCESS, {
        serviceId: id,
        lookupCode: updatedService.lookupCode
      });

      return {
        success: true,
        data: updatedService
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.CARRIERS.SERVICES.UPDATE.FAILED, {
        serviceId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }
}