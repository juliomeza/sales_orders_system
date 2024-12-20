// frontend/src/shared/api/queries/useInventoryQueries.ts
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { queryKeys } from '../../config/queryKeys';
import { MaterialQueryParams } from '../types/inventory.types';
import { InventoryItem } from '../../types/shipping';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch inventory items with optional search parameters
 * Accepts either a search string directly or a full params object
 */
export const useInventoryQuery = (searchTermOrParams: string | MaterialQueryParams = '') => {
  // Handle both string and object parameters
  const params: MaterialQueryParams = typeof searchTermOrParams === 'string'
    ? { query: searchTermOrParams }
    : searchTermOrParams;

  const queryKey = params.query 
    ? queryKeys.inventory.search(params.query)
    : queryKeys.inventory.all;

  return useQuery<InventoryItem[], Error>({
    queryKey,
    queryFn: () => inventoryService.getInventory(params),
    staleTime: CACHE_TIME.VOLATILE, // Inventory data changes frequently
    select: (data) => {
      // Transform and validate inventory data
      return data.map(item => ({
        ...item,
        quantity: 0, // Initialize quantity for UI
        baseAvailable: item.available // Store original availability
      }));
    },
    retry: (failureCount, error: any) => {
      // Don't retry on specific error codes
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    },
    placeholderData: (previousData) => previousData, // Keep previous data while fetching
  });
};

/**
 * Hook to fetch a single inventory item by ID
 */
export const useInventoryItemQuery = (id: string) => {
  return useQuery<InventoryItem, Error>({
    queryKey: queryKeys.inventory.byId(id),
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: Boolean(id),
    staleTime: CACHE_TIME.VOLATILE,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to check availability for multiple items
 */
export const useInventoryAvailabilityQuery = (itemIds: string[]) => {
  return useQuery<Record<string, number>, Error>({
    queryKey: [...queryKeys.inventory.all, 'availability', itemIds],
    queryFn: () => inventoryService.checkAvailability(itemIds),
    enabled: itemIds.length > 0,
    staleTime: CACHE_TIME.VOLATILE,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    }
  });
};