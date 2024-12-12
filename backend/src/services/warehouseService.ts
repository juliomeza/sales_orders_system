// backend/src/services/warehouseService.ts
import { WarehouseRepository } from '../repositories/warehouseRepository';
import { ServiceResult } from '../shared/types';
import { ValidationService } from '../shared/validations';
import { 
  CreateWarehouseDTO, 
  UpdateWarehouseDTO, 
  WarehouseFilters,
  WarehouseListResponse,
  WarehouseStatsResponse 
} from '../shared/types/warehouses.types';
import { WarehouseDomain } from '../domain/warehouse';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';

export class WarehouseService {
  constructor(private warehouseRepository: WarehouseRepository) {}

  async createWarehouse(
    data: CreateWarehouseDTO, 
    userId: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    Logger.info(LOG_MESSAGES.WAREHOUSES.CREATE.ATTEMPT, {
      lookupCode: data.lookupCode,
      name: data.name,
      customersCount: data.customerIds?.length,
      userId
    });

    const validation = this.validateWarehouseData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED_VALIDATION, {
        lookupCode: data.lookupCode,
        errors: validation.errors,
        userId
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingWarehouse = await this.warehouseRepository.findByLookupCode(data.lookupCode);
      if (existingWarehouse) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED_AUTH, {
          lookupCode: data.lookupCode,
          userId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.VALIDATION.LOOKUP_CODE_EXISTS
        };
      }

      const warehouse = await this.warehouseRepository.create(data, userId);

      Logger.info(LOG_MESSAGES.WAREHOUSES.CREATE.SUCCESS, {
        warehouseId: warehouse.id,
        lookupCode: warehouse.lookupCode,
        userId
      });

      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.CREATE.FAILED, {
        lookupCode: data.lookupCode,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.CREATE_ERROR
      };
    }
  }

  async updateWarehouse(
    id: number,
    data: UpdateWarehouseDTO,
    userId: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    Logger.info(LOG_MESSAGES.WAREHOUSES.UPDATE.ATTEMPT, {
      warehouseId: id,
      updateData: {
        name: data.name,
        status: data.status,
        customerCount: data.customerIds?.length
      },
      userId
    });

    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      Logger.warn(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED_VALIDATION, {
        warehouseId: id,
        errors: validation.errors,
        userId
      });

      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingWarehouse = await this.warehouseRepository.findById(id);
      if (!existingWarehouse) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED_NOT_FOUND, {
          warehouseId: id,
          userId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE
        };
      }

      const warehouse = await this.warehouseRepository.update(id, data, userId);

      Logger.info(LOG_MESSAGES.WAREHOUSES.UPDATE.SUCCESS, {
        warehouseId: id,
        lookupCode: warehouse.lookupCode,
        userId
      });

      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.UPDATE.FAILED, {
        warehouseId: id,
        error: error instanceof Error ? error.message : 'Unknown error',
        userId
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.UPDATE_ERROR
      };
    }
  }

  async deleteWarehouse(id: number): Promise<ServiceResult<void>> {
    Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.ATTEMPT, { 
      warehouseId: id 
    });

    try {
      const warehouse = await this.warehouseRepository.findById(id);
      if (!warehouse) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED_NOT_FOUND, {
          warehouseId: id
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE
        };
      }

      const orderCount = await this.warehouseRepository.getOrderCount(id);
      
      if (orderCount > 0) {
        await this.warehouseRepository.softDelete(id);

        Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.DEACTIVATED, {
          warehouseId: id,
          orderCount
        });

        return {
          success: true,
          message: 'Warehouse has been deactivated due to existing orders'
        };
      }

      await this.warehouseRepository.hardDelete(id);

      Logger.info(LOG_MESSAGES.WAREHOUSES.DELETE.SUCCESS, {
        warehouseId: id
      });

      return { 
        success: true 
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.DELETE.FAILED, {
        warehouseId: id,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.DELETE_ERROR
      };
    }
  }

  async getWarehouseById(
    id: number, 
    customerId?: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    Logger.debug(LOG_MESSAGES.WAREHOUSES.GET.REQUEST, {
      warehouseId: id,
      customerId
    });

    try {
      const warehouse = await this.warehouseRepository.findById(id, customerId);
      
      if (!warehouse) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.GET.FAILED_NOT_FOUND, {
          warehouseId: id,
          customerId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.WAREHOUSE
        };
      }

      Logger.info(LOG_MESSAGES.WAREHOUSES.GET.SUCCESS, {
        warehouseId: id,
        lookupCode: warehouse.lookupCode,
        customerId
      });

      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.GET.FAILED, {
        warehouseId: id,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async listWarehouses(
    filters: WarehouseFilters
  ): Promise<ServiceResult<WarehouseListResponse>> {
    Logger.debug(LOG_MESSAGES.WAREHOUSES.LIST.REQUEST, {
      filters: {
        search: filters.search,
        status: filters.status,
        city: filters.city,
        state: filters.state,
        customerId: filters.customerId,
        page: filters.page,
        limit: filters.limit
      }
    });

    try {
      const validation = this.validateFilters(filters);
      if (!validation.isValid) {
        Logger.warn(LOG_MESSAGES.WAREHOUSES.LIST.FAILED_VALIDATION, {
          errors: validation.errors,
          filters
        });

        return {
          success: false,
          errors: validation.errors
        };
      }

      const result = await this.warehouseRepository.findAll(filters);

      Logger.info(LOG_MESSAGES.WAREHOUSES.LIST.SUCCESS, {
        count: result.data.length,
        totalPages: result.pagination.totalPages,
        filters
      });

      return {
        success: true,
        data: {
          warehouses: result.data,
          pagination: result.pagination
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.LIST.FAILED, {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async getWarehouseStats(): Promise<ServiceResult<WarehouseStatsResponse>> {
    Logger.debug(LOG_MESSAGES.WAREHOUSES.STATS.REQUEST);

    try {
      const stats = await this.warehouseRepository.getStats();

      Logger.info(LOG_MESSAGES.WAREHOUSES.STATS.SUCCESS, {
        totalWarehouses: stats.summary.totalActiveWarehouses
      });

      return {
        success: true,
        data: stats
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.WAREHOUSES.STATS.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  private validateWarehouseData(data: CreateWarehouseDTO) {
    Logger.debug('Validating warehouse data', {
      lookupCode: data.lookupCode,
      customersCount: data.customerIds?.length
    });

    return ValidationService.validate([
      {
        condition: !!data.lookupCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Warehouse Code')
      },
      {
        condition: !!data.name,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Name')
      },
      {
        condition: !!data.address,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Address')
      },
      {
        condition: !!data.city,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('City')
      },
      {
        condition: !!data.state,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('State')
      },
      {
        condition: !!data.zipCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('ZIP Code')
      },
      {
        condition: typeof data.capacity === 'number' && data.capacity > 0,
        message: ERROR_MESSAGES.VALIDATION.INVALID_TYPE
      }
    ]);
  }

  private validateUpdateData(data: UpdateWarehouseDTO) {
    Logger.debug('Validating warehouse update data', {
      hasName: !!data.name,
      hasStatus: data.status !== undefined,
      hasCustomers: !!data.customerIds
    });

    const rules = [];

    if (data.name !== undefined) {
      rules.push({
        condition: !!data.name,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Name')
      });
    }

    if (data.address !== undefined) {
      rules.push({
        condition: !!data.address,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('Address')
      });
    }

    if (data.city !== undefined) {
      rules.push({
        condition: !!data.city,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('City')
      });
    }

    if (data.state !== undefined) {
      rules.push({
        condition: !!data.state,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('State')
      });
    }

    if (data.zipCode !== undefined) {
      rules.push({
        condition: !!data.zipCode,
        message: ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD_WITH_NAME('ZIP Code')
      });
    }

    if (data.capacity !== undefined) {
      rules.push({
        condition: typeof data.capacity === 'number' && data.capacity > 0,
        message: ERROR_MESSAGES.VALIDATION.INVALID_TYPE
      });
    }

    if (data.status !== undefined) {
      rules.push({
        condition: [1, 2].includes(data.status),
        message: ERROR_MESSAGES.VALIDATION.INVALID_STATUS
      });
    }

    return ValidationService.validate(rules);
  }

  private validateFilters(filters: WarehouseFilters) {
    Logger.debug('Validating warehouse filters', filters);

    return ValidationService.validate([
      {
        condition: !filters.page || (Number.isInteger(filters.page) && filters.page > 0),
        message: ERROR_MESSAGES.VALIDATION.INVALID_TYPE
      },
      {
        condition: !filters.limit || (Number.isInteger(filters.limit) && filters.limit > 0),
        message: ERROR_MESSAGES.VALIDATION.INVALID_TYPE
      },
      {
        condition: !filters.status || [1, 2].includes(filters.status),
        message: ERROR_MESSAGES.VALIDATION.INVALID_STATUS
      }
    ]);
  }
}