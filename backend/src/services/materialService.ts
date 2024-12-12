// backend/src/services/materialService.ts
import { 
  MaterialDomain, 
  MaterialFilters, 
  MaterialSearchFilters,
  MaterialListResponse,
  MaterialSummary,
  OrderItem,
  PaginatedResponse
} from '../domain/material';
import { MaterialRepository } from '../repositories/materialRepository';
import { ServiceResult } from '../shared/types';
import { MaterialValidation } from '../shared/validations/services/materialValidation';
import { ERROR_MESSAGES, LOG_MESSAGES } from '../shared/constants';
import Logger from '../config/logger';

export class MaterialService {
  constructor(private materialRepository: MaterialRepository) {}

  async getMaterialById(
    id: number, 
    customerId?: number
  ): Promise<ServiceResult<MaterialDomain>> {
    Logger.debug(LOG_MESSAGES.MATERIALS.GET.REQUEST, {
      materialId: id,
      customerId
    });

    try {
      const material = await this.materialRepository.findById(id, customerId);
      
      if (!material) {
        Logger.warn(LOG_MESSAGES.MATERIALS.GET.FAILED_NOT_FOUND, {
          materialId: id,
          customerId
        });

        return {
          success: false,
          error: ERROR_MESSAGES.NOT_FOUND.MATERIAL
        };
      }

      Logger.info(LOG_MESSAGES.MATERIALS.GET.SUCCESS, {
        materialId: id,
        code: material.code,
        customerId
      });

      return {
        success: true,
        data: material
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.GET.FAILED, {
        materialId: id,
        customerId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error retrieving material'
      };
    }
  }

  async listMaterials(
    filters: MaterialFilters
  ): Promise<ServiceResult<MaterialListResponse>> {
    Logger.debug(LOG_MESSAGES.MATERIALS.LIST.REQUEST, {
      filters: {
        search: filters.search,
        uom: filters.uom,
        projectId: filters.projectId,
        customerId: filters.customerId,
        page: filters.page,
        limit: filters.limit
      }
    });

    try {
      const validation = MaterialValidation.validateFilters(filters);
      if (!validation.isValid) {
        Logger.warn(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
          errors: validation.errors,
          filters
        });

        return {
          success: false,
          errors: validation.errors
        };
      }

      const result = await this.materialRepository.findAll(filters);
      
      const materials: MaterialSummary[] = result.data.map((material: MaterialDomain) => ({
        id: material.id,
        code: material.code,
        lookupCode: material.lookupCode,
        description: material.description,
        uom: material.uom,
        availableQuantity: material.availableQuantity,
        status: material.status,
        projectName: material.project.name,
        customerName: material.project.customer.name,
        orderCount: material.orderItems?.length ?? 0
      }));

      Logger.info(LOG_MESSAGES.MATERIALS.LIST.SUCCESS, {
        count: materials.length,
        totalPages: result.pagination.totalPages,
        filters
      });

      return {
        success: true,
        data: {
          materials,
          pagination: result.pagination
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.LIST.FAILED, {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }

  async searchMaterials(
    filters: MaterialSearchFilters
  ): Promise<ServiceResult<MaterialListResponse>> {
    Logger.debug(LOG_MESSAGES.MATERIALS.SEARCH.REQUEST, {
      filters: {
        search: filters.search,
        uom: filters.uom,
        minQuantity: filters.minQuantity,
        maxQuantity: filters.maxQuantity,
        projectId: filters.projectId,
        customerId: filters.customerId,
        page: filters.page,
        limit: filters.limit
      }
    });

    try {
      const validation = MaterialValidation.validateSearchFilters(filters);
      if (!validation.isValid) {
        Logger.warn(LOG_MESSAGES.MATERIALS.SEARCH.FAILED_VALIDATION, {
          errors: validation.errors,
          filters
        });

        return {
          success: false,
          errors: validation.errors
        };
      }

      const result = await this.materialRepository.search(filters);
      
      const materials: MaterialSummary[] = result.data.map((material: MaterialDomain) => ({
        id: material.id,
        code: material.code,
        lookupCode: material.lookupCode,
        description: material.description,
        uom: material.uom,
        availableQuantity: material.availableQuantity,
        status: material.status,
        projectName: material.project.name,
        customerName: material.project.customer.name,
        orderCount: material.orderItems?.length ?? 0,
        recentOrders: material.orderItems?.map((item: OrderItem) => ({
          orderNumber: item.order.orderNumber,
          status: item.order.status,
          quantity: item.quantity,
          date: item.order.created_at
        }))
      }));

      Logger.info(LOG_MESSAGES.MATERIALS.SEARCH.SUCCESS, {
        count: materials.length,
        totalPages: result.pagination.totalPages,
        filters: {
          search: filters.search,
          uom: filters.uom,
          quantityRange: `${filters.minQuantity || '*'}-${filters.maxQuantity || '*'}`
        }
      });

      return {
        success: true,
        data: {
          materials,
          pagination: result.pagination
        }
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.SEARCH.FAILED, {
        filters,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.SEARCH_ERROR
      };
    }
  }

  async getUniqueUoms(): Promise<ServiceResult<string[]>> {
    Logger.debug(LOG_MESSAGES.MATERIALS.UOMS.REQUEST);

    try {
      const uoms = await this.materialRepository.getUniqueUoms();

      Logger.info(LOG_MESSAGES.MATERIALS.UOMS.SUCCESS, {
        count: uoms.length
      });

      return {
        success: true,
        data: uoms
      };
    } catch (error) {
      Logger.error(LOG_MESSAGES.MATERIALS.UOMS.FAILED, {
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      return {
        success: false,
        error: ERROR_MESSAGES.OPERATION.LIST_ERROR
      };
    }
  }
}