import { apiClient } from '../apiClient';
import { AppError, ErrorCategory } from '../../errors/AppError';
import { 
 CarriersResponse, 
 WarehousesResponse,
 Carrier,
 Warehouse,
 CarrierService,
 CarrierFilters,
 WarehouseFilters
} from '../types/shipping.types';

class ShippingService {
 private readonly carriersPath = '/carriers';
 private readonly warehousesPath = '/warehouses';

 public async getCarriers(filters?: CarrierFilters): Promise<CarriersResponse> {
   try {
     const queryParams = new URLSearchParams();
     
     if (filters?.page) queryParams.append('page', filters.page.toString());
     if (filters?.limit) queryParams.append('limit', filters.limit.toString());
     if (filters?.search) queryParams.append('search', filters.search);
     if (filters?.status !== undefined) queryParams.append('status', filters.status.toString());
     if (filters?.name) queryParams.append('name', filters.name);
     if (filters?.lookupCode) queryParams.append('lookupCode', filters.lookupCode);

     const endpoint = queryParams.toString()
       ? `${this.carriersPath}?${queryParams.toString()}`
       : this.carriersPath;

     const response = await apiClient.get<CarriersResponse>(endpoint);
     return this.transformCarriersResponse(response);
   } catch (error) {
     if (error instanceof AppError && error.category === ErrorCategory.TECHNICAL) {
       return this.getEmptyCarriersResponse();
     }
     throw error;
   }
 }

 public async getWarehouses(filters?: WarehouseFilters): Promise<WarehousesResponse> {
   try {
     const queryParams = new URLSearchParams();
     
     if (filters?.page) queryParams.append('page', filters.page.toString());
     if (filters?.limit) queryParams.append('limit', filters.limit.toString());
     if (filters?.status !== undefined) queryParams.append('status', filters.status.toString());
     if (filters?.city) queryParams.append('city', filters.city);
     if (filters?.state) queryParams.append('state', filters.state);

     const endpoint = queryParams.toString()
       ? `${this.warehousesPath}?${queryParams.toString()}`
       : this.warehousesPath;

     const response = await apiClient.get<WarehousesResponse>(endpoint);
     return this.transformWarehousesResponse(response);
   } catch (error) {
     if (error instanceof AppError && error.category === ErrorCategory.TECHNICAL) {
       return this.getEmptyWarehousesResponse();
     }
     throw error;
   }
 }

 public async getWarehouse(id: string): Promise<Warehouse> {
   if (!id) throw new Error('Warehouse ID is required');
   
   try {
     const response = await apiClient.get<{ warehouse: Warehouse }>(
       `${this.warehousesPath}/${id}`
     );
     return response.warehouse;
   } catch (error) {
     if (error instanceof AppError && error.category === ErrorCategory.TECHNICAL) {
       throw new Error(`Error fetching warehouse ${id}`);
     }
     throw error;
   }
 }

 public async getCarrierServices(carrierId: string): Promise<CarrierService[]> {
  if (!carrierId) return [];
  
  try {
    const response = await apiClient.get<{ services: CarrierService[] }>(
      `${this.carriersPath}/${carrierId}/services`
    );
    return response.services?.filter(service => service.status === 1) || [];
  } catch (error) {
    // Solo loguear error crítico
    if (error instanceof AppError && error.category === ErrorCategory.TECHNICAL) {
      console.warn(`Error técnico al obtener servicios para carrier ${carrierId}:`, error);
    }
    return [];
  }
}

 private transformCarriersResponse(response: CarriersResponse): CarriersResponse {
   if (!response?.data || !Array.isArray(response.data)) {
     return this.getEmptyCarriersResponse();
   }

   return {
     data: response.data.map(carrier => ({
       ...carrier,
       services: carrier.services || [],
       status: carrier.status || 1
     })),
     page: response.page || 1,
     limit: response.limit || 10,
     total: response.total || 0
   };
 }

 private transformWarehousesResponse(response: WarehousesResponse): WarehousesResponse {
   if (!response?.data || !Array.isArray(response.data)) {
     return this.getEmptyWarehousesResponse();
   }

   return {
     data: response.data.map(warehouse => ({
       ...warehouse,
       status: warehouse.status || 1
     })),
     page: response.page || 1,
     limit: response.limit || 10,
     total: response.total || 0
   };
 }

 private getEmptyCarriersResponse(): CarriersResponse {
   return { data: [], page: 1, limit: 10, total: 0 };
 }

 private getEmptyWarehousesResponse(): WarehousesResponse {
   return { data: [], page: 1, limit: 10, total: 0 };
 }
}

export const shippingService = new ShippingService();