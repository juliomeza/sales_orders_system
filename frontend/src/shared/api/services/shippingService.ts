// frontend/src/shared/api/services/shippingService.ts
import { apiClient } from '../apiClient';
import { 
  CarriersResponse, 
  WarehousesResponse, 
  Carrier, 
  Warehouse 
} from '../types/shipping.types';

export const shippingService = {
  getCarriers: async (): Promise<Carrier[]> => {
    const response = await apiClient.get<CarriersResponse>('/carriers');
    return response.carriers;
  },

  getWarehouses: async (): Promise<Warehouse[]> => {
    const response = await apiClient.get<WarehousesResponse>('/warehouses');
    return response.warehouses;
  }
};