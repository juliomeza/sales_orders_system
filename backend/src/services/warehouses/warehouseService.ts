// backend/src/services/warehouses/warehouseService.ts
import { WarehouseRepository } from '../../repositories/warehouseRepository';
import { ServiceResult } from '../../shared/types';
import { ValidationService } from '../../shared/validations';
import { 
  CreateWarehouseDTO, 
  UpdateWarehouseDTO, 
  WarehouseFilters,
  WarehouseListResponse,
  WarehouseStats,
  WarehouseStatsResponse 
} from './types';
import { WarehouseDomain } from '../../domain/warehouse';

export class WarehouseService {
  constructor(private warehouseRepository: WarehouseRepository) {}

  async createWarehouse(
    data: CreateWarehouseDTO, 
    userId: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    const validation = this.validateWarehouseData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingWarehouse = await this.warehouseRepository.findByLookupCode(data.lookupCode);
      if (existingWarehouse) {
        return {
          success: false,
          error: 'Warehouse with this code already exists'
        };
      }

      const warehouse = await this.warehouseRepository.create(data, userId);
      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      console.error('Create warehouse error:', error);
      return {
        success: false,
        error: 'Error creating warehouse'
      };
    }
  }

  async updateWarehouse(
    id: number,
    data: UpdateWarehouseDTO,
    userId: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    const validation = this.validateUpdateData(data);
    if (!validation.isValid) {
      return {
        success: false,
        errors: validation.errors
      };
    }

    try {
      const existingWarehouse = await this.warehouseRepository.findById(id);
      if (!existingWarehouse) {
        return {
          success: false,
          error: 'Warehouse not found'
        };
      }

      const warehouse = await this.warehouseRepository.update(id, data, userId);
      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      console.error('Update warehouse error:', error);
      return {
        success: false,
        error: 'Error updating warehouse'
      };
    }
  }

  async deleteWarehouse(id: number): Promise<ServiceResult<void>> {
    try {
      const warehouse = await this.warehouseRepository.findById(id);
      if (!warehouse) {
        return {
          success: false,
          error: 'Warehouse not found'
        };
      }

      const orderCount = await this.warehouseRepository.getOrderCount(id);
      
      if (orderCount > 0) {
        // Soft delete if warehouse has orders
        await this.warehouseRepository.softDelete(id);
        return {
          success: true,
          data: undefined,
          message: 'Warehouse has been deactivated due to existing orders'
        };
      }

      await this.warehouseRepository.hardDelete(id);
      return { 
        success: true
      };
    } catch (error) {
      console.error('Delete warehouse error:', error);
      return {
        success: false,
        error: 'Error deleting warehouse'
      };
    }
  }

  async getWarehouseById(
    id: number, 
    customerId?: number
  ): Promise<ServiceResult<WarehouseDomain>> {
    try {
      const warehouse = await this.warehouseRepository.findById(id, customerId);
      
      if (!warehouse) {
        return {
          success: false,
          error: 'Warehouse not found'
        };
      }

      return {
        success: true,
        data: warehouse
      };
    } catch (error) {
      console.error('Get warehouse error:', error);
      return {
        success: false,
        error: 'Error retrieving warehouse'
      };
    }
  }

  async listWarehouses(
    filters: WarehouseFilters
  ): Promise<ServiceResult<WarehouseListResponse>> {
    try {
      const validation = this.validateFilters(filters);
      if (!validation.isValid) {
        return {
          success: false,
          errors: validation.errors
        };
      }

      const result = await this.warehouseRepository.findAll(filters);
      
      return {
        success: true,
        data: {
          warehouses: result.data,
          pagination: result.pagination
        }
      };
    } catch (error) {
      console.error('List warehouses error:', error);
      return {
        success: false,
        error: 'Error listing warehouses'
      };
    }
  }

  async getWarehouseStats(): Promise<ServiceResult<WarehouseStatsResponse>> {
    try {
      const stats = await this.warehouseRepository.getStats();
      
      return {
        success: true,
        data: stats
      };
    } catch (error) {
      console.error('Get warehouse stats error:', error);
      return {
        success: false,
        error: 'Error retrieving warehouse statistics'
      };
    }
  }

  private validateWarehouseData(data: CreateWarehouseDTO) {
    return ValidationService.validate([
      {
        condition: !!data.lookupCode,
        message: 'Warehouse Code is required'
      },
      {
        condition: !!data.name,
        message: 'Name is required'
      },
      {
        condition: !!data.address,
        message: 'Address is required'
      },
      {
        condition: !!data.city,
        message: 'City is required'
      },
      {
        condition: !!data.state,
        message: 'State is required'
      },
      {
        condition: !!data.zipCode,
        message: 'ZIP Code is required'
      },
      {
        condition: typeof data.capacity === 'number' && data.capacity > 0,
        message: 'Capacity must be a positive number'
      }
    ]);
  }

  private validateUpdateData(data: UpdateWarehouseDTO) {
    const rules = [];

    if (data.name !== undefined) {
      rules.push({
        condition: !!data.name,
        message: 'Name cannot be empty'
      });
    }

    if (data.address !== undefined) {
      rules.push({
        condition: !!data.address,
        message: 'Address cannot be empty'
      });
    }

    if (data.city !== undefined) {
      rules.push({
        condition: !!data.city,
        message: 'City cannot be empty'
      });
    }

    if (data.state !== undefined) {
      rules.push({
        condition: !!data.state,
        message: 'State cannot be empty'
      });
    }

    if (data.zipCode !== undefined) {
      rules.push({
        condition: !!data.zipCode,
        message: 'ZIP Code cannot be empty'
      });
    }

    if (data.capacity !== undefined) {
      rules.push({
        condition: typeof data.capacity === 'number' && data.capacity > 0,
        message: 'Capacity must be a positive number'
      });
    }

    if (data.status !== undefined) {
      rules.push({
        condition: [1, 2].includes(data.status),
        message: 'Invalid status value'
      });
    }

    return ValidationService.validate(rules);
  }

  private validateFilters(filters: WarehouseFilters) {
    return ValidationService.validate([
      {
        condition: !filters.page || (Number.isInteger(filters.page) && filters.page > 0),
        message: 'Page must be a positive integer'
      },
      {
        condition: !filters.limit || (Number.isInteger(filters.limit) && filters.limit > 0),
        message: 'Limit must be a positive integer'
      },
      {
        condition: !filters.status || [1, 2].includes(filters.status),
        message: 'Invalid status filter'
      }
    ]);
  }
}