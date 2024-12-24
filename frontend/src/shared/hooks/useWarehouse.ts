// frontend/src/shared/hooks/useWarehouse.ts
/**
 * @fileoverview Custom hook for comprehensive warehouse management
 * Provides centralized access to warehouse operations with role-based permissions,
 * data fetching, and mutation capabilities.
 */

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
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../config/queryKeys';

/**
 * Interface defining the return value of the useWarehouse hook
 * @interface
 */
interface UseWarehouseReturn {
  warehouses: Warehouse[];              // List of available warehouses
  stats: WarehouseStats | null;        // Warehouse statistics
  isLoading: boolean;                  // Loading state for queries
  error: string | null;                // Error state
  selectedWarehouse: Warehouse | null;  // Currently selected warehouse
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;  // Selection handler
  createWarehouse?: (warehouse: CreateWarehouseData) => Promise<void>;  // Admin only
  updateWarehouse?: (id: number, warehouse: UpdateWarehouseData) => Promise<void>;  // Admin only
  deleteWarehouse?: (id: number) => Promise<void>;  // Admin only
  isCreating: boolean;                 // Creation mutation state
  isUpdating: boolean;                 // Update mutation state
  isDeleting: boolean;                 // Deletion mutation state
}

/**
 * Hook for managing warehouse operations
 * 
 * Features:
 * - Role-based access control for admin operations
 * - Warehouse data fetching with filtering
 * - Statistics tracking
 * - CRUD operations for admins
 * - Loading and error states
 * 
 * @param {WarehouseFilters} filters - Optional filters for warehouse query
 * @returns {UseWarehouseReturn} Warehouse management interface
 */
export const useWarehouse = (filters: WarehouseFilters = {}): UseWarehouseReturn => {
  const queryClient = useQueryClient();
  // State for tracking selected warehouse
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  
  // Get user role for permission checks
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  // Fetch warehouse data and stats
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

  // Initialize mutation hooks
  const createMutation = useCreateWarehouseMutation();
  const updateMutation = useUpdateWarehouseMutation();
  const deleteMutation = useDeleteWarehouseMutation();

  /**
   * Handles warehouse creation with permission check
   * @param {CreateWarehouseData} warehouse - New warehouse data
   */
  const handleCreate = async (warehouse: CreateWarehouseData) => {
    if (!isAdmin) return;
    await createMutation.mutateAsync(warehouse);
  };

  /**
   * Handles warehouse update with permission check
   * @param {number} id - Warehouse ID to update
   * @param {UpdateWarehouseData} warehouse - Updated warehouse data
   */
  const handleUpdate = async (id: number, warehouse: UpdateWarehouseData) => {
    if (!isAdmin) return;
    await updateMutation.mutateAsync({ id, data: warehouse });
  };

  /**
   * Handles warehouse deletion with permission check
   * @param {number} id - Warehouse ID to delete
   */
  const handleDelete = async (id: number) => {
    if (!isAdmin) return;
    await deleteMutation.mutateAsync(id);
  };

  // Return interface with conditional admin operations
  return {
    warehouses: warehousesData?.warehouses ?? [],
    stats: statsData ?? null,
    isLoading: isLoadingWarehouses || isLoadingStats,
    error: warehousesError || statsError ? String(warehousesError || statsError) : null,
    selectedWarehouse,
    setSelectedWarehouse,
    // Only include admin operations if user has admin role
    ...(isAdmin && {
      createWarehouse: handleCreate,
      updateWarehouse: handleUpdate,
      deleteWarehouse: handleDelete,
    }),
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};