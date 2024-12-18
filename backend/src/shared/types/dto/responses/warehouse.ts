// backend/src/shared/types/dto/responses/warehouse.ts
import { WarehouseDomain } from '../../../../domain/warehouse';

export interface WarehouseListResponse {
  warehouses: WarehouseDomain[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
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