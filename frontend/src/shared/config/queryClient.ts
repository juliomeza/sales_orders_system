// frontend/src/shared/config/queryClient.ts
import { QueryClient, QueryKey } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { shippingService } from '../api/services/shippingService';

// Cache time configuration
export const CACHE_TIME = {
  STATIC: 30 * 60 * 1000,    // 30 minutes - data that changes rarely
  DYNAMIC: 5 * 60 * 1000,    // 5 minutes - data that changes occasionally
  VOLATILE: 2 * 60 * 1000    // 2 minutes - data that changes frequently
} as const;

// Determine cache time based on query key
const getStaleTime = (queryKey: QueryKey): number => {
  const [entity] = queryKey as string[];
  
  switch (entity) {
    case 'warehouses':
    case 'carriers':
      return CACHE_TIME.STATIC;
    case 'inventory':
      return CACHE_TIME.VOLATILE;
    default:
      return CACHE_TIME.DYNAMIC;
  }
};

// Central React Query configuration
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: CACHE_TIME.DYNAMIC,
      gcTime: CACHE_TIME.DYNAMIC * 2,
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false;
        if (error?.response?.status === 404) return false;
        if (error?.response?.status === 403) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true
    },
    mutations: {
      retry: false,
      onError: (error: unknown) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

// Function to invalidate related queries
export const invalidateRelatedQueries = async (entity: keyof typeof queryKeys) => {
  await queryClient.invalidateQueries({ 
    queryKey: [entity]
  });
};

// Prefetch common data
export const prefetchCommonData = async () => {
  const token = localStorage.getItem('token');
  
  // Only prefetch if user is authenticated
  if (!token) {
    return;
  }

  try {
    // Get carriers first
    const carriers = await shippingService.getCarriers();

    await Promise.all([
      queryClient.prefetchQuery({
        queryKey: queryKeys.warehouses.all,
        queryFn: () => shippingService.getWarehouses(),
        staleTime: CACHE_TIME.STATIC
      }),

      ...carriers.map(carrier => 
        queryClient.prefetchQuery({
          queryKey: queryKeys.shipping.services(carrier.id.toString()),
          queryFn: () => shippingService.getCarrierServices(carrier.id.toString()),
          staleTime: CACHE_TIME.STATIC
        })
      ),

      queryClient.prefetchQuery({
        queryKey: queryKeys.shipping.carriers,
        queryFn: () => shippingService.getCarriers(),
        staleTime: CACHE_TIME.STATIC
      })
    ]);
  } catch (error) {
    console.error('Error prefetching common data:', error);
  }
};

// Helper function to get specific staleTime for a query
export const getQueryStaleTime = (queryKey: QueryKey): number => {
  return getStaleTime(queryKey);
};