// frontend/src/shared/api/queries/useAccountQueries.ts
/**
 * @fileoverview Collection of React Query hooks for managing shipping addresses
 * Includes functionality for fetching, creating, updating, and deleting shipping addresses
 * with optimistic updates and error handling.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';
import { queryKeys } from '../../config/queryKeys';
import { ShippingAddress } from '../types/accounts.types';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch all shipping addresses
 * 
 * Features:
 * - Caches results based on CACHE_TIME.DYNAMIC
 * - Normalizes state codes to uppercase
 * - Implements smart retry logic based on error types
 * 
 * @returns {UseQueryResult} Query result with shipping addresses data
 */
export const useShippingAddressesQuery = () => {
  return useQuery<ShippingAddress[], Error>({
    queryKey: queryKeys.accounts.shipTo,
    queryFn: () => accountsService.getShippingAddresses(),
    staleTime: CACHE_TIME.DYNAMIC,
    select: (addresses) => addresses.map(address => ({
      ...address,
      state: address.state.toUpperCase(), // Normalize state codes
    })),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to fetch a single shipping address by ID
 * 
 * Features:
 * - Only runs query when ID is provided
 * - Implements retry logic with 404 handling
 * 
 * @param {string} id - The ID of the shipping address to fetch
 * @returns {UseQueryResult} Query result with single address data
 */
export const useShippingAddressQuery = (id: string) => {
  return useQuery<ShippingAddress, Error>({
    queryKey: queryKeys.accounts.byId(id),
    queryFn: () => accountsService.getShippingAddress(id),
    enabled: Boolean(id),
    staleTime: CACHE_TIME.DYNAMIC,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to create a new shipping address
 * 
 * Features:
 * - Implements optimistic updates
 * - Handles rollback on error
 * - Automatically invalidates related queries on success
 * 
 * @returns {UseMutationResult} Mutation handlers and state
 */
export const useCreateShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newAddress: Omit<ShippingAddress, 'id'>) => 
      accountsService.createShippingAddress(newAddress),
    
    onMutate: async (newAddress) => {
      // Optimistic update logic
      // Cancels in-flight queries and updates cache with temporary data
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });

      const previousAddresses = queryClient.getQueryData<ShippingAddress[]>(
        queryKeys.accounts.shipTo
      );

      if (previousAddresses) {
        const optimisticAddress = {
          ...newAddress,
          id: `temp-${Date.now()}`,
          state: newAddress.state.toUpperCase()
        };

        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          [...previousAddresses, optimisticAddress]
        );
      }

      return { previousAddresses };
    },

    onError: (error, variables, context) => {
      // Rollback logic on error
      // Restores previous data if mutation fails
      if (context?.previousAddresses) {
        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          context.previousAddresses
        );
      }
      console.error('Error creating shipping address:', error);
    },

    onSettled: () => {
      // Cleanup logic
      // Invalidates queries to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });
    }
  });
};

/**
 * Hook to update an existing shipping address
 * 
 * Features:
 * - Implements optimistic updates
 * - Handles state normalization
 * - Manages cache invalidation for both list and individual queries
 * 
 * @returns {UseMutationResult} Mutation handlers and state
 */
export const useUpdateShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      address 
    }: { 
      id: string; 
      address: Partial<ShippingAddress>; 
    }) => accountsService.updateShippingAddress(id, address),
    
    onMutate: async ({ id, address }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });

      const previousAddresses = queryClient.getQueryData<ShippingAddress[]>(
        queryKeys.accounts.shipTo
      );

      if (previousAddresses) {
        const updatedAddresses = previousAddresses.map(addr => 
          addr.id === id
            ? { 
                ...addr, 
                ...address,
                state: address.state ? address.state.toUpperCase() : addr.state
              }
            : addr
        );

        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          updatedAddresses
        );
      }

      return { previousAddresses };
    },

    onError: (error, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          context.previousAddresses
        );
      }
      console.error('Error updating shipping address:', error);
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.accounts.byId(id) 
      });
    }
  });
};

/**
 * Hook to delete a shipping address
 * 
 * Features:
 * - Implements optimistic deletion
 * - Handles rollback on error
 * - Manages cache invalidation for affected queries
 * 
 * @returns {UseMutationResult} Mutation handlers and state
 */
export const useDeleteShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => 
      accountsService.deleteShippingAddress(id),
    
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });

      const previousAddresses = queryClient.getQueryData<ShippingAddress[]>(
        queryKeys.accounts.shipTo
      );

      if (previousAddresses) {
        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          previousAddresses.filter(addr => addr.id !== deletedId)
        );
      }

      return { previousAddresses };
    },

    onError: (error, variables, context) => {
      if (context?.previousAddresses) {
        queryClient.setQueryData<ShippingAddress[]>(
          queryKeys.accounts.shipTo,
          context.previousAddresses
        );
      }
      console.error('Error deleting shipping address:', error);
    },

    onSettled: (_, __, id) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.accounts.shipTo 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.accounts.byId(id) 
      });
    }
  });
};