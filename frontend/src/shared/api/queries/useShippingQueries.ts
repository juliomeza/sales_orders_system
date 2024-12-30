// frontend/src/shared/api/queries/useShippingQueries.ts
import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { shippingService } from '../services/shippingService';
import { queryKeys } from '../../config/queryKeys';
import { CACHE_TIME } from '../../config/queryClient';
import {
  Carrier,
  CarrierService,
  Warehouse,
  CarriersResponse,
  WarehousesResponse,
  CarrierFilters,
  WarehouseFilters
} from '../types/shipping.types';

/**
 * Hook to fetch carriers with pagination and filtering
 */
export const useCarriersQuery = (filters?: CarrierFilters) => {
  const queryClient = useQueryClient();

  return useQuery<CarriersResponse, Error>({
    queryKey: [...queryKeys.shipping.carriers, filters],
    queryFn: () => shippingService.getCarriers(filters),
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC * 2,
    placeholderData: {
      data: [],
      page: 1,
      limit: 10,
      total: 0
    },
    select: (response) => {
      if (!response?.data) {
        console.warn('Unexpected carriers response format:', response);
        return {
          data: [],
          page: 1,
          limit: 10,
          total: 0
        };
      }
      return response;
    }
  });
};

/**
 * Hook to fetch carrier services
 */
export const useCarrierServicesQuery = (carrierId: string) => {
  return useQuery<CarrierService[]>({
    queryKey: queryKeys.shipping.services(carrierId),
    queryFn: () => shippingService.getCarrierServices(carrierId),
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC * 2,
    enabled: Boolean(carrierId),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
    placeholderData: [],
    select: (services) => 
      services?.filter(service => service.status === 1) || []
  });
};

/**
 * Hook to fetch warehouses with pagination and filtering
 */
export const useWarehousesQuery = (filters?: WarehouseFilters) => {
  const queryClient = useQueryClient();

  return useQuery<WarehousesResponse, Error>({
    queryKey: [...queryKeys.shipping.warehouses, filters],
    queryFn: () => shippingService.getWarehouses(filters),
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC * 2,
    select: (response) => {
      if (!response?.data) {
        console.warn('Expected response to have data property');
        return {
          data: [],
          page: 1,
          limit: 10,
          total: 0
        };
      }
      return response;
    },
    placeholderData: () => {
      const previousData = queryClient.getQueryData<WarehousesResponse>(
        queryKeys.shipping.warehouses
      );
      return previousData || {
        data: [],
        page: 1,
        limit: 10,
        total: 0
      };
    }
  });
};

/**
 * Hook to fetch warehouse details
 */
export const useWarehouseQuery = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery<Warehouse>({
    queryKey: queryKeys.warehouses.byId(Number(id)),
    queryFn: () => shippingService.getWarehouse(id),
    enabled: Boolean(id),
    staleTime: CACHE_TIME.STATIC,
    placeholderData: () => {
      const warehouses = queryClient.getQueryData<WarehousesResponse>(
        queryKeys.shipping.warehouses
      );
      return warehouses?.data?.find(w => w.id.toString() === id);
    }
  });
};

/**
 * Hook combining carrier and service data
 */
export const useCarrierWithServices = (carrierId?: string) => {
  const { data: carriersResponse } = useCarriersQuery();
  const { data: services } = useCarrierServicesQuery(carrierId || '');

  const selectedCarrier = carrierId 
    ? carriersResponse?.data?.find(c => c.id.toString() === carrierId)
    : undefined;

  return {
    carrier: selectedCarrier,
    services: services || [],
    isValidCarrier: Boolean(selectedCarrier)
  };
};

/**
 * Prefetches carrier services for active carriers
 */
const prefetchCarrierServices = (queryClient: QueryClient, carriers: Carrier[]) => {
  carriers.forEach((carrier: Carrier) => {
    if (carrier.status === 1) {
      queryClient.prefetchQuery({
        queryKey: queryKeys.shipping.services(carrier.id.toString()),
        queryFn: () => shippingService.getCarrierServices(carrier.id.toString()),
        staleTime: CACHE_TIME.STATIC
      });
    }
  });
};

/**
 * Prefetches critical shipping data
 */
export const prefetchShippingData = async (queryClient: QueryClient) => {
  try {
    const initialFilters = {
      page: 1,
      limit: 10
    };

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: [...queryKeys.shipping.carriers, initialFilters],
        queryFn: () => shippingService.getCarriers(initialFilters),
        staleTime: CACHE_TIME.STATIC
      }),
      queryClient.prefetchQuery({
        queryKey: [...queryKeys.shipping.warehouses, initialFilters],
        queryFn: () => shippingService.getWarehouses(initialFilters),
        staleTime: CACHE_TIME.STATIC
      })
    ]);
  } catch (error) {
    console.error('Error prefetching shipping data:', error);
  }
};