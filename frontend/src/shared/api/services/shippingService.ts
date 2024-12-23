/**
 * @fileoverview Shipping service layer
 * Provides API integration for managing carriers, services, and warehouses
 * with data transformation and error handling capabilities.
 */

import { apiClient } from '../apiClient';
import { 
  CarriersResponse, 
  WarehousesResponse,
  Carrier, 
  Warehouse,
  CarrierService
} from '../types/shipping.types';

/**
 * Service class for managing shipping-related operations
 * Handles carriers, carrier services, and warehouse management
 */
class ShippingService {
  private readonly carriersPath = '/carriers';
  private readonly warehousesPath = '/warehouses';

  /**
   * Fetches all carriers with their associated services
   * 
   * @throws {Error} If the request fails or returns invalid data
   * @returns {Promise<Carrier[]>} List of carriers with normalized data
   */
  public async getCarriers(): Promise<Carrier[]> {
    try {
      const response = await apiClient.get<CarriersResponse>(this.carriersPath);
      return this.transformCarriersResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Error fetching carriers');
    }
  }

  /**
   * Fetches available services for a specific carrier
   * Implements graceful error handling by returning empty array on failure
   * 
   * @param {string} carrierId - ID of the carrier to fetch services for
   * @returns {Promise<CarrierService[]>} List of carrier services or empty array
   */
  public async getCarrierServices(carrierId: string): Promise<CarrierService[]> {
    try {
      const response = await apiClient.get<{ services: CarrierService[] }>(
        `${this.carriersPath}/${carrierId}/services`
      );
      return response.services || []; // Fallback to empty array if no services
    } catch (error) {
      console.error('Error fetching carrier services:', error);
      return []; // Graceful failure with empty array
    }
  }

  /**
   * Fetches warehouses with optional filtering
   * 
   * @param {Object} filters - Optional filters for warehouse query
   * @param {number} filters.status - Filter by warehouse status
   * @param {string} filters.city - Filter by city
   * @param {string} filters.state - Filter by state
   * @throws {Error} If the request fails
   * @returns {Promise<Warehouse[]>} List of filtered warehouses
   */
  public async getWarehouses(filters?: {
    status?: number;
    city?: string;
    state?: string;
  }): Promise<Warehouse[]> {
    try {
      // Build query parameters
      const queryParams = new URLSearchParams();
      
      if (filters?.status) {
        queryParams.append('status', filters.status.toString());
      }
      if (filters?.city) {
        queryParams.append('city', filters.city);
      }
      if (filters?.state) {
        queryParams.append('state', filters.state);
      }

      // Construct endpoint with optional filters
      const endpoint = queryParams.toString()
        ? `${this.warehousesPath}?${queryParams.toString()}`
        : this.warehousesPath;

      const response = await apiClient.get<WarehousesResponse>(endpoint);
      return this.transformWarehousesResponse(response);
    } catch (error) {
      throw this.handleError(error, 'Error fetching warehouses');
    }
  }

  /**
   * Fetches details for a specific warehouse
   * 
   * @param {string} id - Warehouse ID to fetch
   * @throws {Error} If warehouse is not found or request fails
   * @returns {Promise<Warehouse>} Warehouse details
   */
  public async getWarehouse(id: string): Promise<Warehouse> {
    try {
      const response = await apiClient.get<{ warehouse: Warehouse }>(
        `${this.warehousesPath}/${id}`
      );
      return response.warehouse;
    } catch (error) {
      throw this.handleError(error, `Error fetching warehouse ${id}`);
    }
  }

  /**
   * Transforms carrier response data to ensure consistent structure
   * Normalizes services array and status values
   * 
   * @param {CarriersResponse} response - Raw API response
   * @returns {Carrier[]} Normalized carrier data
   * @private
   */
  private transformCarriersResponse(response: CarriersResponse): Carrier[] {
    return response.carriers.map(carrier => ({
      ...carrier,
      services: carrier.services || [],
      status: carrier.status || 1
    }));
  }

  /**
   * Transforms warehouse response data to ensure consistent structure
   * Normalizes status values and ensures required fields
   * 
   * @param {WarehousesResponse} response - Raw API response
   * @returns {Warehouse[]} Normalized warehouse data
   * @private
   */
  private transformWarehousesResponse(response: WarehousesResponse): Warehouse[] {
    return response.warehouses.map(warehouse => ({
      ...warehouse,
      status: warehouse.status || 1
    }));
  }

  /**
   * Handles service errors with context
   * Provides specific error messages for common error cases
   * 
   * @param {unknown} error - The caught error
   * @param {string} context - Description of the operation that failed
   * @returns {Error} Formatted error with context
   * @private
   */
  private handleError(error: unknown, context: string): Error {
    console.error(`${context}:`, error);

    if (error instanceof Error) {
      error.message = `${context}: ${error.message}`;
      return error;
    }

    if (typeof error === 'object' && error !== null && 'response' in error) {
      const axiosError = error as any;
      if (axiosError.response?.status === 404) {
        return new Error(`${context}: Resource not found`);
      }
      if (axiosError.response?.status === 403) {
        return new Error(`${context}: Not authorized`);
      }
      if (axiosError.response?.data?.message) {
        return new Error(`${context}: ${axiosError.response.data.message}`);
      }
    }

    return new Error(context);
  }
}

// Export singleton instance for use across the application
export const shippingService = new ShippingService();