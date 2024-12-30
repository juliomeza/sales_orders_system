import { QueryClient, QueryKey, QueryCache, MutationCache } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { shippingService } from '../api/services/shippingService';
import { errorHandler } from '../errors/ErrorHandler';
import { AppError, ErrorCategory, ErrorSeverity } from '../errors/AppError';
import { API_ERROR_CODES } from '../errors/ErrorCodes';
import { CarrierFilters, WarehouseFilters } from '../api/types/shipping.types';

export const CACHE_TIME = {
 STATIC: 30 * 60 * 1000,    
 DYNAMIC: 5 * 60 * 1000,    
 VOLATILE: 2 * 60 * 1000    
} as const;

const DEFAULT_PREFETCH_FILTERS: CarrierFilters = {
 page: 1,
 limit: 10,
 status: 1
};

const DEFAULT_WAREHOUSE_FILTERS: WarehouseFilters = {
 page: 1,
 limit: 10
};

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

export const queryClient = new QueryClient({
 defaultOptions: {
   queries: {
     staleTime: CACHE_TIME.DYNAMIC,
     gcTime: CACHE_TIME.DYNAMIC * 2,
     retry: (failureCount, error: any) => {
       if (error instanceof AppError) {
         switch (error.category) {
           case ErrorCategory.AUTHENTICATION:
           case ErrorCategory.AUTHORIZATION:
           case ErrorCategory.VALIDATION:
             return false;
           case ErrorCategory.TECHNICAL:
             return failureCount < 2;
           default:
             return failureCount < 1;
         }
       }
       return failureCount < 1;
     },
     refetchOnWindowFocus: false,
     refetchOnReconnect: true,
     refetchOnMount: true
   },
   mutations: {
     retry: false
   }
 },
 queryCache: new QueryCache({
   onError: (error) => {
     if (error instanceof AppError && error.category === ErrorCategory.TECHNICAL) {
       console.warn('Query cache error:', error);
       return;
     }
     errorHandler.handleError(error, {
       action: 'Query',
       path: window.location.pathname
     });
   }
 }),
 mutationCache: new MutationCache({
   onError: (error) => {
     const appError = error instanceof AppError ? error : 
       new AppError(
         'Mutation failed',
         ErrorCategory.TECHNICAL,
         ErrorSeverity.ERROR,
         {
           code: API_ERROR_CODES.UNKNOWN_ERROR,
           originalError: error
         }
       );
     errorHandler.handleError(appError, {
       action: 'Mutation',
       path: window.location.pathname
     });
   }
 })
});

export const prefetchCommonData = async () => {
 const token = localStorage.getItem('token');
 if (!token) return;

 try {
   const carriersResponse = await shippingService.getCarriers(DEFAULT_PREFETCH_FILTERS);
   const activeCarriers = carriersResponse.data
     .filter(c => c.status === 1)
     .slice(0, 3);

   const prefetchPromises = [
     queryClient.prefetchQuery({
       queryKey: [...queryKeys.warehouses.all, DEFAULT_WAREHOUSE_FILTERS],
       queryFn: () => shippingService.getWarehouses(DEFAULT_WAREHOUSE_FILTERS),
       staleTime: CACHE_TIME.STATIC,
       retry: false
     }),
     queryClient.prefetchQuery({
       queryKey: [...queryKeys.shipping.carriers, DEFAULT_PREFETCH_FILTERS],
       queryFn: () => shippingService.getCarriers(DEFAULT_PREFETCH_FILTERS),
       staleTime: CACHE_TIME.STATIC,
       retry: false
     })
   ];

   await Promise.all(prefetchPromises);

   for (const carrier of activeCarriers) {
     try {
       await queryClient.prefetchQuery({
         queryKey: queryKeys.shipping.services(carrier.id.toString()),
         queryFn: () => shippingService.getCarrierServices(carrier.id.toString()),
         staleTime: CACHE_TIME.STATIC,
         retry: false
       });
     } catch (err) {
       console.warn(`Skip prefetch for carrier ${carrier.id}:`, err);
     }
   }
 } catch (error) {
   console.warn('Error en prefetch:', error);
 }
};

export const invalidateRelatedQueries = async (entity: keyof typeof queryKeys) => {
 try {
   await queryClient.invalidateQueries({ 
     queryKey: [entity]
   });
 } catch (error) {
   console.warn('Error invalidando queries:', error);
 }
};

export const getQueryStaleTime = (queryKey: QueryKey): number => {
 return getStaleTime(queryKey);
};