// frontend/src/shared/config/queryClient.ts
// frontend/src/shared/config/queryClient.ts
import { QueryClient, QueryKey, QueryCache, MutationCache } from '@tanstack/react-query';
import { queryKeys } from './queryKeys';
import { shippingService } from '../api/services/shippingService';
import { errorHandler } from '../errors/ErrorHandler';
import { AppError, ErrorCategory, ErrorSeverity } from '../errors/AppError';
import { API_ERROR_CODES } from '../errors/ErrorCodes';

export const CACHE_TIME = {
 STATIC: 30 * 60 * 1000,    
 DYNAMIC: 5 * 60 * 1000,    
 VOLATILE: 2 * 60 * 1000    
} as const;

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

// En la configuración del queryClient
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
              return false;
            case ErrorCategory.VALIDATION:
              return false;
            case ErrorCategory.TECHNICAL:
              return failureCount < 3;
            default:
              return failureCount < 2;
          }
        }
        return failureCount < 2;
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

export const invalidateRelatedQueries = async (entity: keyof typeof queryKeys) => {
 try {
   await queryClient.invalidateQueries({ 
     queryKey: [entity]
   });
 } catch (error) {
   errorHandler.handleError(error, {
     action: 'InvalidateQueries',
     path: window.location.pathname
   });
 }
};

export const prefetchCommonData = async () => {
 const token = localStorage.getItem('token');
 if (!token) return;

 try {
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
   errorHandler.handleError(error, {
     action: 'PrefetchData',
     path: window.location.pathname
   });
 }
};

export const getQueryStaleTime = (queryKey: QueryKey): number => {
 return getStaleTime(queryKey);
};