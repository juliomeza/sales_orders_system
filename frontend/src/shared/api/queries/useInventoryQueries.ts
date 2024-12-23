/**
 * @fileoverview Custom React Query hooks for inventory management
 * Provides functionality for fetching inventory items and individual item details
 * with caching, error handling, and data transformation.
 */

import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { queryKeys } from '../../config/queryKeys';
import { MaterialQueryParams } from '../types/inventory.types';
import { InventoryItem } from '../../types/shipping';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch inventory items with optional search parameters
 * 
 * Features:
 * - Supports both string search and advanced query parameters
 * - Implements data transformation for UI compatibility
 * - Manages cache with volatile timing due to frequent updates
 * - Implements smart retry logic based on error types
 * 
 * @param searchTermOrParams - Search string or query parameters object
 * @returns Query result containing inventory items
 */
export const useInventoryQuery = (searchTermOrParams: string | MaterialQueryParams = '') => {
  // Convert search parameters to consistent format
  const params: MaterialQueryParams = typeof searchTermOrParams === 'string'
    ? { query: searchTermOrParams }
    : searchTermOrParams;

  // Determine appropriate query key based on params
  const queryKey = params.query 
    ? queryKeys.inventory.search(params.query)
    : queryKeys.inventory.all;

  return useQuery<InventoryItem[], Error>({
    queryKey,
    queryFn: () => inventoryService.getInventory(params),
    staleTime: CACHE_TIME.VOLATILE, // Short cache time for frequently changing data
    
    select: (data) => {
      // Transform inventory data for UI requirements
      return data.map(item => ({
        ...item,
        quantity: 0,           // Initialize quantity field for UI interactions
        baseAvailable: item.available  // Preserve original availability
      }));
    },

    retry: (failureCount, error: any) => {
      // Custom retry logic based on error types
      if (error?.response?.status === 404) return false;  // Don't retry not found
      if (error?.response?.status === 403) return false;  // Don't retry forbidden
      return failureCount < 2;  // Retry other errors up to 2 times
    },

    // Maintain previous data while fetching to prevent UI flicker
    placeholderData: (previousData) => previousData,
  });
};

/**
 * Hook to fetch details of a single inventory item
 * 
 * Features:
 * - Conditional fetching based on ID availability
 * - Implements volatile cache timing
 * - Custom retry logic for specific error cases
 * 
 * @param id - ID of the inventory item to fetch
 * @returns Query result containing single item details
 */
export const useInventoryItemQuery = (id: string) => {
  return useQuery<InventoryItem, Error>({
    queryKey: queryKeys.inventory.byId(id),
    queryFn: () => inventoryService.getInventoryItem(id),
    enabled: Boolean(id),  // Only fetch when ID is provided
    staleTime: CACHE_TIME.VOLATILE,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;  // Don't retry not found
      return failureCount < 2;  // Retry other errors up to 2 times
    }
  });
};

