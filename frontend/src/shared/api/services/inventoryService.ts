/**
 * @fileoverview Inventory service layer
 * Provides API integration for inventory operations with data transformation
 * and error handling capabilities.
 */

import { apiClient } from '../apiClient';
import { MaterialResponse, MaterialQueryParams } from '../types/inventory.types';
import { InventoryItem } from '../../types/shipping';

/**
 * Service class for managing inventory operations
 * Handles material data fetching and transformation
 */
class InventoryService {
  private readonly basePath = '/materials';

  /**
   * Transforms API material response into frontend inventory format
   * Standardizes data structure and adds UI-specific fields
   * 
   * @param material - Raw material data from API
   * @returns {InventoryItem} Transformed inventory item
   * @private
   */
  private transformMaterial(material: MaterialResponse['materials'][0]): InventoryItem {
    return {
      id: material.id.toString(),
      code: material.code,
      lookupCode: material.code,
      description: material.description,
      uom: material.uom,
      availableQuantity: material.availableQuantity,
      available: material.availableQuantity,    // Alias for UI consistency
      quantity: 0,                              // Initialize quantity for UI
      packaging: material.uom,                  // Use UOM as packaging info
      baseAvailable: material.availableQuantity // Store original availability
    };
  }

  /**
   * Fetches inventory items with optional search and pagination
   * 
   * Features:
   * - Supports text search
   * - Implements pagination
   * - Transforms data for frontend use
   * 
   * @param {MaterialQueryParams} params - Search and pagination parameters
   * @throws {Error} If the request fails
   * @returns {Promise<InventoryItem[]>} Transformed inventory items
   */
  public async getInventory(params: MaterialQueryParams = {}): Promise<InventoryItem[]> {
    try {
      // Build query parameters
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

      // Determine endpoint based on search
      const endpoint = params.query ? 
        `${this.basePath}/search?${queryParams.toString()}` : 
        this.basePath;
      
      // Fetch and transform data
      const response = await apiClient.get<MaterialResponse>(endpoint);
      return response.materials.map(material => this.transformMaterial(material));
    } catch (error) {
      console.error('Error fetching inventory:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Fetches a single inventory item by ID
   * 
   * @param {string} id - ID of the inventory item to fetch
   * @throws {Error} If the item is not found or request fails
   * @returns {Promise<InventoryItem>} Transformed inventory item
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
   * Handles service errors and provides consistent error formatting
   * 
   * @param {unknown} error - The error to handle
   * @returns {Error} Formatted error object
   * @private
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

// Export singleton instance for use across the application
export const inventoryService = new InventoryService();