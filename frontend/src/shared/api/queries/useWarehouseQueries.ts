// frontend/src/shared/api/queries/useWarehouseQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { warehouseService, Warehouse, WarehouseStats, WarehouseFilters, CreateWarehouseData, UpdateWarehouseData } from '../warehouseService';
import { queryKeys } from '../../config/queryClient';

// Queries
export const useWarehousesQuery = (filters: WarehouseFilters = {}) => {
  return useQuery({
    queryKey: ['warehouses', 'list', filters],
    queryFn: () => warehouseService.getWarehouses(filters),
  });
};

export const useWarehouseQuery = (id: number) => {
  return useQuery({
    queryKey: ['warehouses', 'detail', id],
    queryFn: () => warehouseService.getWarehouse(id),
    enabled: !!id,
  });
};

export const useWarehouseStatsQuery = () => {
  return useQuery({
    queryKey: ['warehouses', 'stats'],
    queryFn: () => warehouseService.getStats(),
  });
};

// Mutations
export const useCreateWarehouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWarehouseData) => 
      warehouseService.createWarehouse(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
    },
  });
};

export const useUpdateWarehouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateWarehouseData }) =>
      warehouseService.updateWarehouse(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.byId(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
    },
  });
};

export const useDeleteWarehouseMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => warehouseService.deleteWarehouse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.warehouses.all });
    },
  });
};