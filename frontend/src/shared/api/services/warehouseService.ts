// frontend/src/shared/api/services/warehouseService.ts
/**
 * @fileoverview Warehouse management service layer
 * Provides comprehensive API integration for warehouse operations with
 * data validation, transformation, and error handling capabilities.
 */

import { apiClient } from '../apiClient';

/**
 * Type Definitions
 * Define interfaces for warehouse-related data structures
 */

// Basic address structure
export interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

/**
 * Complete warehouse information including metadata
 */
export interface Warehouse {
  id: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string | null;
  email?: string | null;
  capacity: number;
  status: number;
  orderCount: number;
  customerCount: number;
  customers?: Array<{
    id: number;
    name: string;
  }>;
  created_at: string;
  modified_at: string;
}

/**
 * Statistical information about warehouses
 */
export interface WarehouseStats {
  summary: {
    totalActiveWarehouses: number;
    totalCapacity: number;
    averageCapacity: number;
    maxCapacity: number;
    minCapacity: number;
  };
  warehousesByState: Array<{
    state: string;
    count: number;
    totalCapacity: number;
  }>;
}

/**
 * Available filters for warehouse queries
 */
export interface WarehouseFilters {
  search?: string;
  page?: number;
  limit?: number;
  status?: number;
  city?: string;
  state?: string;
}

export interface WarehouseResponse {
  warehouses: Warehouse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateWarehouseData {
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  capacity: number;
  customerIds?: number[];
}

export interface UpdateWarehouseData {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  capacity?: number;
  status?: number;
  customerIds?: number[];
}

/**
 * Service class for managing warehouse operations
 * Implements CRUD operations with comprehensive validation and error handling
 */
class WarehouseService {
  /**
   * Normalizes warehouse data for consistency
   * Ensures all optional fields have default values and standardizes formats
   * 
   * @param {Warehouse} warehouse - Raw warehouse data
   * @returns {Warehouse} Normalized warehouse data
   * @private
   */
  private transformWarehouse(warehouse: Warehouse): Warehouse {
    return {
      ...warehouse,
      status: warehouse.status || 1,
      orderCount: warehouse.orderCount || 0,
      customerCount: warehouse.customerCount || 0,
      customers: warehouse.customers || [],
      phone: warehouse.phone || null,
      email: warehouse.email || null,
      state: warehouse.state.toUpperCase(),
    };
  }

  /**
   * Validates required fields and data formats for warehouse creation
   * 
   * @param {CreateWarehouseData} data - Warehouse data to validate
   * @throws {Error} If validation fails
   * @private
   */
  private validateCreateData(data: CreateWarehouseData): void {
    const requiredFields: (keyof CreateWarehouseData)[] = [
      'lookupCode',
      'name',
      'address',
      'city',
      'state',
      'zipCode',
      'capacity'
    ];

    for (const field of requiredFields) {
      if (!data[field]) {
        throw new Error(`${field} is required`);
      }
    }

    if (data.state.length !== 2) {
      throw new Error('State must be a 2-letter code');
    }

    if (data.capacity <= 0) {
      throw new Error('Capacity must be greater than 0');
    }

    if (data.email && !this.validateEmail(data.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Validates email format using regex
   * 
   * @param {string} email - Email to validate
   * @returns {boolean} True if email is valid
   * @private
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Constructs query string from filter parameters
   * 
   * @param {WarehouseFilters} filters - Filter criteria
   * @returns {string} Formatted query string
   * @private
   */
  private buildQueryString(filters: WarehouseFilters): string {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    return queryParams.toString();
  }

  /**
   * Fetches warehouses with optional filtering and pagination
   * 
   * @param {WarehouseFilters} filters - Optional filter criteria
   * @throws {Error} If request fails
   * @returns {Promise<WarehouseResponse>} Paginated warehouse list
   */
  public async getWarehouses(filters: WarehouseFilters = {}): Promise<WarehouseResponse> {
    try {
      const queryString = this.buildQueryString(filters);
      const endpoint = queryString ? `/warehouses?${queryString}` : '/warehouses';
      
      const response = await apiClient.get<WarehouseResponse>(endpoint);
      
      return {
        ...response,
        warehouses: response.warehouses.map(this.transformWarehouse)
      };
    } catch (error) {
      throw this.handleError(error, 'Error fetching warehouses');
    }
  }

  /**
   * Fetches detailed information for a specific warehouse
   * 
   * @param {number} id - Warehouse ID
   * @throws {Error} If warehouse not found or request fails
   * @returns {Promise<Warehouse>} Warehouse details
   */
  public async getWarehouse(id: number): Promise<Warehouse> {
    try {
      const warehouse = await apiClient.get<Warehouse>(`/warehouses/${id}`);
      return this.transformWarehouse(warehouse);
    } catch (error) {
      throw this.handleError(error, `Error fetching warehouse ${id}`);
    }
  }

  /**
   * Retrieves warehouse statistics and metrics
   * 
   * @throws {Error} If request fails
   * @returns {Promise<WarehouseStats>} Statistical data
   */
  public async getStats(): Promise<WarehouseStats> {
    try {
      const stats = await apiClient.get<WarehouseStats>('/warehouses/stats');
      return stats;
    } catch (error) {
      throw this.handleError(error, 'Error fetching warehouse statistics');
    }
  }

  /**
   * Creates a new warehouse (admin only)
   * Includes data validation and normalization
   * 
   * @param {CreateWarehouseData} data - New warehouse data
   * @throws {Error} If validation fails or creation fails
   * @returns {Promise<Warehouse>} Created warehouse
   */
  public async createWarehouse(data: CreateWarehouseData): Promise<Warehouse> {
    try {
      this.validateCreateData(data);
      
      const warehouse = await apiClient.post<Warehouse>('/warehouses', {
        ...data,
        state: data.state.toUpperCase()
      });
      
      return this.transformWarehouse(warehouse);
    } catch (error) {
      throw this.handleError(error, 'Error creating warehouse');
    }
  }

  /**
   * Updates an existing warehouse (admin only)
   * Validates partial updates and email/capacity if provided
   * 
   * @param {number} id - Warehouse ID to update
   * @param {UpdateWarehouseData} data - Fields to update
   * @throws {Error} If validation fails or update fails
   * @returns {Promise<Warehouse>} Updated warehouse
   */
  public async updateWarehouse(id: number, data: UpdateWarehouseData): Promise<Warehouse> {
    try {
      if (data.email && !this.validateEmail(data.email)) {
        throw new Error('Invalid email format');
      }

      if (data.capacity !== undefined && data.capacity <= 0) {
        throw new Error('Capacity must be greater than 0');
      }

      const warehouse = await apiClient.put<Warehouse>(`/warehouses/${id}`, {
        ...data,
        state: data.state?.toUpperCase()
      });
      
      return this.transformWarehouse(warehouse);
    } catch (error) {
      throw this.handleError(error, `Error updating warehouse ${id}`);
    }
  }

  /**
   * Deletes a warehouse (admin only)
   * 
   * @param {number} id - Warehouse ID to delete
   * @throws {Error} If deletion fails
   */
  public async deleteWarehouse(id: number): Promise<void> {
    try {
      await apiClient.delete(`/warehouses/${id}`);
    } catch (error) {
      throw this.handleError(error, `Error deleting warehouse ${id}`);
    }
  }

  /**
   * Handles API errors with context
   * Provides specific error messages for common cases
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
        return new Error(`${context}: Warehouse not found`);
      }
      if (axiosError.response?.status === 403) {
        return new Error(`${context}: Not authorized to perform this action`);
      }
      if (axiosError.response?.data?.message) {
        return new Error(`${context}: ${axiosError.response.data.message}`);
      }
    }

    return new Error(`${context}: An unexpected error occurred`);
  }
}

// Export singleton instance for use across the application
export const warehouseService = new WarehouseService();