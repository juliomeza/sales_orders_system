// frontend/src/shared/api/services/shippingService.ts
import { apiClient } from '../apiClient';
import { 
  CarriersResponse, 
  WarehousesResponse,
  Carrier, 
  Warehouse,
  CarrierService
} from '../types/shipping.types';

class ShippingService {
  private readonly carriersPath = '/carriers';
  private readonly warehousesPath = '/warehouses';

  /**
   * Get all carriers with their services
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
   * Get available services for a specific carrier
   */
  public async getCarrierServices(carrierId: string): Promise<CarrierService[]> {
    try {
      const response = await apiClient.get<{ services: CarrierService[] }>(
        `${this.carriersPath}/${carrierId}/services`
      );
      return response.services;
    } catch (error) {
      throw this.handleError(error, 'Error fetching carrier services');
    }
  }

  /**
   * Get all warehouses
   */
  public async getWarehouses(filters?: {
    status?: number;
    city?: string;
    state?: string;
  }): Promise<Warehouse[]> {
    try {
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
   * Get warehouse by ID
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
   * Transform carriers response to ensure consistent data structure
   */
  private transformCarriersResponse(response: CarriersResponse): Carrier[] {
    return response.carriers.map(carrier => ({
      ...carrier,
      services: carrier.services || [],
      status: carrier.status || 1
    }));
  }

  /**
   * Transform warehouses response to ensure consistent data structure
   */
  private transformWarehousesResponse(response: WarehousesResponse): Warehouse[] {
    return response.warehouses.map(warehouse => ({
      ...warehouse,
      status: warehouse.status || 1
    }));
  }

  /**
   * Standardized error handling with context
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

// Export singleton instance
export const shippingService = new ShippingService();