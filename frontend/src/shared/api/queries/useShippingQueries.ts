/**
 * @fileoverview Shipping-related React Query hooks
 * Provides functionality for managing carriers, services, and warehouses
 * with error handling, caching, and data prefetching capabilities.
 */

import { useQuery, useQueryClient, QueryClient } from '@tanstack/react-query';
import { shippingService } from '../services/shippingService';
import { queryKeys } from '../../config/queryKeys';
import { CACHE_TIME } from '../../config/queryClient';
import {
  Carrier,
  CarrierService,
  Warehouse,
  WarehousesResponse
} from '../types/shipping.types';

/**
 * Hook to fetch all available carriers
 * 
 * Features:
 * - Static caching for infrequently changing data
 * - Data normalization and validation
 * - Error handling with fallback values
 * 
 * @returns {UseQueryResult} Query result with carrier list
 */
export const useCarriersQuery = () => {
  const queryClient = useQueryClient();

  return useQuery<{ carriers: Carrier[]; total: number }, Error, Carrier[]>({
    queryKey: queryKeys.shipping.carriers,
    queryFn: async () => {
      try {
        const response = await shippingService.getCarriers();
        // Ensure response has correct structure
        if (!Array.isArray(response)) {
          console.error('Unexpected response format:', response);
          return { carriers: [], total: 0 };
        }
        return {
          carriers: response || [],
          total: (response || []).length
        };
      } catch (error) {
        console.error('Error fetching carriers:', error);
        throw error;
      }
    },
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC * 2,
    select: (response) => {
      // Asegurarnos de que siempre devolvemos un array
      if (!response?.carriers) return [];
      
      return response.carriers.map(carrier => ({
        ...carrier,
        services: carrier.services || [],
        status: carrier.status || 1
      }));
    },
    placeholderData: {
      carriers: [],
      total: 0
    }
  });
};

/**
 * Prefetches carrier services for active carriers
 * 
 * @param {QueryClient} queryClient - React Query client instance
 * @param {Carrier[]} carriers - List of carriers to prefetch services for
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
 * Hook to fetch services for a specific carrier
 * 
 * Features:
 * - Conditional fetching based on carrier ID
 * - Filters for active services only
 * - Smart retry logic for specific error codes
 * 
 * @param {string} carrierId - ID of the carrier
 */
export const useCarrierServicesQuery = (carrierId: string) => {
  return useQuery<CarrierService[]>({
    queryKey: queryKeys.shipping.services(carrierId),
    queryFn: () => shippingService.getCarrierServices(carrierId),
    staleTime: CACHE_TIME.STATIC,
    enabled: Boolean(carrierId),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
    placeholderData: [], // Add this
    select: (services) => 
      services?.filter(service => service.status === 1) || [] // Modify this
  });
};

/**
 * Hook to fetch warehouses with optional filtering
 * 
 * Features:
 * - Support for status, city, and state filters
 * - Placeholder data from cache while loading
 * - Data normalization for consistency
 * 
 * @param {Object} filters - Optional filters for warehouse query
 */
export const useWarehousesQuery = (filters?: {
  status?: number;
  city?: string;
  state?: string;
}) => {
  const queryClient = useQueryClient();

  return useQuery<WarehousesResponse, Error, Warehouse[]>({
    queryKey: [...queryKeys.shipping.warehouses, filters],
    queryFn: async () => {
      const warehouses = await shippingService.getWarehouses(filters);
      return {
        warehouses,
        total: warehouses.length
      };
    },
    staleTime: CACHE_TIME.STATIC,
    gcTime: CACHE_TIME.STATIC * 2,
    select: (response) => {
      return response.warehouses.map(warehouse => ({
        ...warehouse,
        status: warehouse.status || 1
      }));
    },
    placeholderData: () => {
      // Usar datos previos como placeholder mientras se carga la nueva data
      const previousData = queryClient.getQueryData<WarehousesResponse>(
        queryKeys.shipping.warehouses
      );
      return previousData;
    },
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to fetch details for a specific warehouse
 * 
 * Features:
 * - Uses cached warehouse list as placeholder
 * - Conditional fetching based on ID
 * - Static caching for performance
 * 
 * @param {string} id - Warehouse ID
 */
export const useWarehouseQuery = (id: string) => {
  const queryClient = useQueryClient();

  return useQuery<Warehouse>({
    queryKey: queryKeys.warehouses.byId(Number(id)),
    queryFn: () => shippingService.getWarehouse(id),
    enabled: Boolean(id),
    staleTime: CACHE_TIME.STATIC,
    placeholderData: () => {
      const warehouses = queryClient.getQueryData<Warehouse[]>(
        queryKeys.shipping.warehouses
      );
      return warehouses?.find(w => w.id.toString() === id);
    }
  });
};

/**
 * Prefetches critical shipping data
 * Includes carriers and warehouses for initial app load
 * 
 * @param {QueryClient} queryClient - React Query client instance
 */
export const prefetchShippingData = async (queryClient: any) => {
  try {
    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.shipping.carriers,
        queryFn: () => shippingService.getCarriers(),
        staleTime: CACHE_TIME.STATIC
      }),
      queryClient.prefetchQuery({
        queryKey: queryKeys.shipping.warehouses,
        queryFn: () => shippingService.getWarehouses(),
        staleTime: CACHE_TIME.STATIC
      })
    ]);
  } catch (error) {
    console.error('Error prefetching shipping data:', error);
  }
};

/**
 * Custom hook combining carrier and service data
 * 
 * Features:
 * - Combines data from multiple queries
 * - Provides carrier validation
 * - Returns normalized service list
 * 
 * @param {string} carrierId - Optional carrier ID
 * @returns {Object} Combined carrier and services data
 */
export const useCarrierWithServices = (carrierId?: string) => {
  const { data: carriers } = useCarriersQuery();
  const { data: services } = useCarrierServicesQuery(carrierId || '');

  const selectedCarrier = carrierId 
    ? carriers?.find(c => c.id.toString() === carrierId)
    : undefined;

  return {
    carrier: selectedCarrier,
    services: services || [],
    isValidCarrier: Boolean(selectedCarrier)
  };
};