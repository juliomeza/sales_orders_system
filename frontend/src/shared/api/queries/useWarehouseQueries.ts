// frontend/src/shared/api/queries/useWarehouseQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService } from '../services/warehouseService';
import { queryKeys } from '../../config/queryKeys';
import { CACHE_TIME } from '../../config/queryClient';
import {
  Warehouse,
  WarehouseStats,
  WarehouseFilters,
  CreateWarehouseData,
  UpdateWarehouseData,
  WarehouseResponse
} from '../services/warehouseService';

/**
 * Hook to fetch warehouses with optional filters
 */
export const useWarehousesQuery = (filters: WarehouseFilters = {}) => {
  const queryClient = useQueryClient();
  
  return useQuery<WarehouseResponse, Error>({
    queryKey: [...queryKeys.warehouses.all, filters],
    queryFn: () => warehouseService.getWarehouses(filters),
    staleTime: CACHE_TIME.STATIC,
    select: (response) => ({
      ...response,
      warehouses: response.warehouses.map(warehouse => ({
        ...warehouse,
        status: warehouse.status || 1
      }))
    }),
    placeholderData: () => {
      // Use previous data as placeholder while loading
      const previousData = queryClient.getQueryData<WarehouseResponse>(
        queryKeys.warehouses.all
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
 * Hook to fetch a specific warehouse by ID
 */
export const useWarehouseQuery = (id: number) => {
  const queryClient = useQueryClient();
  
  return useQuery<Warehouse, Error>({
    queryKey: queryKeys.warehouses.byId(id),
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: Boolean(id),
    staleTime: CACHE_TIME.STATIC,
    select: (warehouse) => ({
      ...warehouse,
      status: warehouse.status || 1
    }),
    placeholderData: () => {
      const warehouses = queryClient.getQueryData<WarehouseResponse>(
        queryKeys.warehouses.all
      );
      return warehouses?.warehouses.find(w => w.id === id);
    }
  });
};

/**
 * Hook to fetch warehouse statistics
 */
export const useWarehouseStatsQuery = () => {
  return useQuery<WarehouseStats, Error>({
    queryKey: queryKeys.warehouses.stats,
    queryFn: () => warehouseService.getStats(),
    staleTime: CACHE_TIME.STATIC,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to create a new warehouse
 */
export const useCreateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateWarehouseData) => 
      warehouseService.createWarehouse(data),
    
    onMutate: async (newWarehouse) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.warehouses.all 
      });

      const previousWarehouses = queryClient.getQueryData<WarehouseResponse>(
        queryKeys.warehouses.all
      );

      if (previousWarehouses) {
        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          {
            ...previousWarehouses,
            warehouses: [
              ...previousWarehouses.warehouses,
              {
                id: Date.now(),
                ...newWarehouse,
                status: 1,
                orderCount: 0,
                customerCount: 0,
                created_at: new Date().toISOString(),
                modified_at: new Date().toISOString()
              }
            ],
            total: previousWarehouses.total + 1
          }
        );
      }

      return { previousWarehouses };
    },

    onError: (error, variables, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          context.previousWarehouses
        );
      }
      console.error('Error creating warehouse:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.stats 
      });
    }
  });
};

/**
 * Hook to update an existing warehouse
 */
export const useUpdateWarehouseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      id, 
      data 
    }: { 
      id: number; 
      data: UpdateWarehouseData 
    }) => warehouseService.updateWarehouse(id, data),
    
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.warehouses.all 
      });

      const previousWarehouses = queryClient.getQueryData<WarehouseResponse>(
        queryKeys.warehouses.all
      );

      if (previousWarehouses) {
        const updatedWarehouses = {
          ...previousWarehouses,
          warehouses: previousWarehouses.warehouses.map(warehouse =>
            warehouse.id === id
              ? { ...warehouse, ...data, modified_at: new Date().toISOString() }
              : warehouse
          )
        };

        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          updatedWarehouses
        );
      }

      return { previousWarehouses };
    },

    onError: (error, variables, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          context.previousWarehouses
        );
      }
      console.error('Error updating warehouse:', error);
    },

    onSettled: (_, __, { id }) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.byId(id) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.stats 
      });
    }
  });
};

/**
 * Hook to delete a warehouse
 */
export const useDeleteWarehouseMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => 
      warehouseService.deleteWarehouse(id),
    
    onMutate: async (deletedId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.warehouses.all 
      });

      const previousWarehouses = queryClient.getQueryData<WarehouseResponse>(
        queryKeys.warehouses.all
      );

      if (previousWarehouses) {
        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          {
            ...previousWarehouses,
            warehouses: previousWarehouses.warehouses.filter(
              warehouse => warehouse.id !== deletedId
            ),
            total: previousWarehouses.total - 1
          }
        );
      }

      return { previousWarehouses };
    },

    onError: (error, variables, context) => {
      if (context?.previousWarehouses) {
        queryClient.setQueryData<WarehouseResponse>(
          queryKeys.warehouses.all,
          context.previousWarehouses
        );
      }
      console.error('Error deleting warehouse:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.all 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.warehouses.stats 
      });
    }
  });
};