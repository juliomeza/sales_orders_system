// frontend/src/shared/api/services/inventoryService.ts
import { apiClient } from '../apiClient';
import { MaterialResponse, MaterialQueryParams } from '../types/inventory.types';
import { InventoryItem } from '../../types/shipping';

export const inventoryService = {
  getInventory: async (params: MaterialQueryParams = {}): Promise<InventoryItem[]> => {
    const queryParams = new URLSearchParams();
    
    if (params.query) {
      queryParams.append('query', params.query);
    }
    if (params.page) {
      queryParams.append('page', params.page.toString());
    }
    if (params.limit) {
      queryParams.append('limit', params.limit.toString());
    }

    const endpoint = params.query ? 
      `/materials/search?${queryParams.toString()}` : 
      '/materials';
    
    const response = await apiClient.get<MaterialResponse>(endpoint);
    
    return response.materials.map(material => ({
      id: material.id.toString(),
      code: material.code,
      lookupCode: material.code,
      description: material.description,
      uom: material.uom,
      availableQuantity: material.availableQuantity,
      available: material.availableQuantity,
      quantity: 0,
      packaging: material.uom,
      baseAvailable: material.availableQuantity
    }));
  }
};