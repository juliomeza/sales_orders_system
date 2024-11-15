// frontend/src/shared/api/warehouseService.ts
import { apiClient } from '../../shared/api/apiClient';

// Tipos
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

// Servicio
export const warehouseService = {
  // Obtener lista de almacenes con filtros y paginación
  getWarehouses: async (filters: WarehouseFilters = {}): Promise<WarehouseResponse> => {
    const queryParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value.toString());
      }
    });
    
    return apiClient.get(`/warehouses?${queryParams.toString()}`);
  },

  // Obtener un almacén por ID
  getWarehouse: async (id: number): Promise<Warehouse> => {
    return apiClient.get(`/warehouses/${id}`);
  },

  // Obtener estadísticas de almacenes
  getStats: async (): Promise<WarehouseStats> => {
    return apiClient.get('/warehouses/stats');
  },

  // Crear nuevo almacén (solo admin)
  createWarehouse: async (data: CreateWarehouseData): Promise<Warehouse> => {
    return apiClient.post('/warehouses', data);
  },

  // Actualizar almacén (solo admin)
  updateWarehouse: async (id: number, data: UpdateWarehouseData): Promise<Warehouse> => {
    return apiClient.put(`/warehouses/${id}`, data);
  },

  // Eliminar almacén (solo admin)
  deleteWarehouse: async (id: number): Promise<void> => {
    return apiClient.delete(`/warehouses/${id}`);
  }
};