// backend/src/services/materials/materialService.ts
import { 
    MaterialDomain, 
    MaterialFilters, 
    MaterialSearchFilters,
    MaterialListResponse,
    MaterialSummary,
    OrderItem,
    PaginatedResponse
  } from '../../domain/material';
  import { MaterialRepository } from '../../repositories/materialRepository';
  import { ServiceResult } from '../../shared/types';
  import { MaterialValidationService } from './materialValidationService';
  import { MaterialErrorMessages } from './errorMessages';
  
  export class MaterialService {
    constructor(private materialRepository: MaterialRepository) {}
  
    async getMaterialById(
      id: number, 
      customerId?: number
    ): Promise<ServiceResult<MaterialDomain>> {
      try {
        const material = await this.materialRepository.findById(id, customerId);
        
        if (!material) {
          return {
            success: false,
            error: MaterialErrorMessages.NOT_FOUND
          };
        }
  
        return {
          success: true,
          data: material
        };
      } catch (error: unknown) {
        console.error('Get material error:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Error retrieving material'
        };
      }
    }
  
    async listMaterials(
      filters: MaterialFilters
    ): Promise<ServiceResult<MaterialListResponse>> {
      try {
        const validation = MaterialValidationService.validateFilters(filters);
        if (!validation.isValid) {
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
  
        return {
          success: true,
          data: {
            materials,
            pagination: result.pagination
          }
        };
      } catch (error: unknown) {
        console.error('List materials error:', error);
        return {
          success: false,
          error: MaterialErrorMessages.LIST_ERROR
        };
      }
    }
  
    async searchMaterials(
      filters: MaterialSearchFilters
    ): Promise<ServiceResult<MaterialListResponse>> {
      try {
        const validation = MaterialValidationService.validateSearchFilters(filters);
        if (!validation.isValid) {
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
  
        return {
          success: true,
          data: {
            materials,
            pagination: result.pagination
          }
        };
      } catch (error: unknown) {
        console.error('Search materials error:', error);
        return {
          success: false,
          error: MaterialErrorMessages.SEARCH_ERROR
        };
      }
    }
  
    async getUniqueUoms(): Promise<ServiceResult<string[]>> {
      try {
        const uoms = await this.materialRepository.getUniqueUoms();
        return {
          success: true,
          data: uoms
        };
      } catch (error: unknown) {
        console.error('Get UOMs error:', error);
        return {
          success: false,
          error: MaterialErrorMessages.UOM_ERROR
        };
      }
    }
  }