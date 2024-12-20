// frontend/src/shared/hooks/useWarehouse.ts
import { useState } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import { 
  useWarehousesQuery, 
  useWarehouseStatsQuery,
  useCreateWarehouseMutation,
  useUpdateWarehouseMutation,
  useDeleteWarehouseMutation
} from '../api/queries/useWarehouseQueries';
import { 
  Warehouse, 
  WarehouseStats, 
  WarehouseFilters, 
  CreateWarehouseData, 
  UpdateWarehouseData 
} from '../api/services/warehouseService';

interface UseWarehouseReturn {
  warehouses: Warehouse[];
  stats: WarehouseStats | null;
  isLoading: boolean;
  error: string | null;
  selectedWarehouse: Warehouse | null;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  createWarehouse?: (warehouse: CreateWarehouseData) => Promise<void>;
  updateWarehouse?: (id: number, warehouse: UpdateWarehouseData) => Promise<void>;
  deleteWarehouse?: (id: number) => Promise<void>;
}

export const useWarehouse = (filters: WarehouseFilters = {}): UseWarehouseReturn => {
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Queries
  const { 
    data: warehousesData, 
    isLoading: isLoadingWarehouses, 
    error: warehousesError 
  } = useWarehousesQuery(filters);

  const { 
    data: statsData, 
    isLoading: isLoadingStats,
    error: statsError
  } = useWarehouseStatsQuery();

  // Mutations (solo para admin)
  const createMutation = useCreateWarehouseMutation();
  const updateMutation = useUpdateWarehouseMutation();
  const deleteMutation = useDeleteWarehouseMutation();

  // Helper functions for admin operations
  const handleCreate = async (warehouse: CreateWarehouseData) => {
    if (!isAdmin) return;
    await createMutation.mutateAsync(warehouse);
  };

  const handleUpdate = async (id: number, warehouse: UpdateWarehouseData) => {
    if (!isAdmin) return;
    await updateMutation.mutateAsync({ id, data: warehouse });
  };

  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    await deleteMutation.mutateAsync(id);
  };

  return {
    warehouses: warehousesData?.warehouses ?? [],
    stats: statsData ?? null,
    isLoading: isLoadingWarehouses || isLoadingStats,
    error: warehousesError || statsError ? String(warehousesError || statsError) : null,
    selectedWarehouse,
    setSelectedWarehouse,
    ...(isAdmin && {
      createWarehouse: handleCreate,
      updateWarehouse: handleUpdate,
      deleteWarehouse: handleDelete,
    }),
  };
};