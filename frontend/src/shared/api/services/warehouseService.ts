// frontend/src/shared/api/services/warehouseService.ts
import { apiClient } from '../apiClient';

// Types
export interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

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

class WarehouseService {
  /**
   * Transform warehouse data for consistency
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
   * Validate warehouse data before creation
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
   * Validate email format
   */
  private validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Build query string from filters
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
   * Get warehouses with filters and pagination
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
   * Get warehouse by ID
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
   * Get warehouse statistics
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
   * Create new warehouse (admin only)
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
   * Update warehouse (admin only)
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
   * Delete warehouse (admin only)
   */
  public async deleteWarehouse(id: number): Promise<void> {
    try {
      await apiClient.delete(`/warehouses/${id}`);
    } catch (error) {
      throw this.handleError(error, `Error deleting warehouse ${id}`);
    }
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

// Export singleton instance
export const warehouseService = new WarehouseService();