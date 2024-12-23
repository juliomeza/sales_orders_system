// frontend/src/shared/api/services/inventoryService.ts
import { apiClient } from '../apiClient';
import { MaterialResponse, MaterialQueryParams } from '../types/inventory.types';
import { InventoryItem } from '../../types/shipping';

class InventoryService {
  private readonly basePath = '/materials';

  /**
   * Transforms a material from API response to frontend InventoryItem format
   */
  private transformMaterial(material: MaterialResponse['materials'][0]): InventoryItem {
    return {
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
    };
  }

  /**
   * Get inventory items with optional search parameters
   */
  public async getInventory(params: MaterialQueryParams = {}): Promise<InventoryItem[]> {
    try {
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
        `${this.basePath}/search?${queryParams.toString()}` : 
        this.basePath;
      
      const response = await apiClient.get<MaterialResponse>(endpoint);
      
      return response.materials.map(material => this.transformMaterial(material));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get a single inventory item by ID
   */
  public async getInventoryItem(id: string): Promise<InventoryItem> {
    try {
      const response = await apiClient.get<{ material: MaterialResponse['materials'][0] }>(
        `${this.basePath}/${id}`
      );
      
      return this.transformMaterial(response.material);
    } catch (error) {
      console.error(`Error fetching inventory item ${id}:`, error);
      throw this.handleError(error);
    }
  }

  /**
   * Standardized error handling
   */
  private handleError(error: unknown): Error {
    if (error instanceof Error) {
      return error;
    }
    
    if (typeof error === 'string') {
      return new Error(error);
    }
    
    return new Error('An unknown error occurred in inventory service');
  }
}

// Export a singleton instance
export const inventoryService = new InventoryService();