// backend/src/services/warehouses/types.ts

import { WarehouseDomain } from '../../domain/warehouse';

export interface CreateWarehouseDTO {
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string | null;
  email?: string | null;
  capacity: number;
  customerIds?: number[];
}

export interface UpdateWarehouseDTO {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string | null;
  email?: string | null;
  capacity?: number;
  status?: number;
  customerIds?: number[];
}

export interface WarehouseFilters {
  search?: string;
  status?: number;
  city?: string;
  state?: string;
  customerId?: number;
  page?: number;
  limit?: number;
}

export interface WarehouseListResponse {
  warehouses: WarehouseDomain[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface WarehouseStats {
  total: number;
  capacity: {
    total: number;
    average: number;
    maximum: number;
    minimum: number;
  };
  utilization: {
    byState: StateUtilization[];
    totalUtilization: number;
  };
}

interface StateUtilization {
  state: string;
  warehouseCount: number;
  totalCapacity: number;
  utilizationPercentage: string;
}

export interface WarehouseStatsResponse {
  summary: {
    totalActiveWarehouses: number;
    capacity: {
      total: number;
      average: number;
      maximum: number;
      minimum: number;
    };
    utilization: {
      byState: {
        state: string;
        warehouseCount: number;
        totalCapacity: number;
        utilizationPercentage: string;
      }[];
      totalUtilization: number;
    };
    orders?: {
      last30Days: number;
      byWarehouse: WarehouseOrderStats[];
    };
  };
  distributions: {
    byState: StateDistribution[];
    byCustomer?: CustomerDistribution[];
  };
}

interface WarehouseOrderStats {
  warehouseId: number;
  orderCount: number;
}

interface StateDistribution {
  state: string;
  count: number;
  totalCapacity: number;
}

interface CustomerDistribution {
  warehouseId: number;
  customerCount: number;
}