// frontend/src/shared/hooks/useWarehouse.ts
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../auth/contexts/AuthContext';
import { 
  warehouseService, 
  Warehouse, 
  WarehouseStats, 
  WarehouseFilters 
} from '../../shared/api/warehouseService';

interface UseWarehouseReturn {
  warehouses: Warehouse[];
  stats: WarehouseStats | null;
  loading: boolean;
  error: string | null;
  selectedWarehouse: Warehouse | null;
  loadWarehouses: (filters?: WarehouseFilters) => Promise<void>;
  getWarehouseById: (id: number) => Promise<Warehouse | null>;
  setSelectedWarehouse: (warehouse: Warehouse | null) => void;
  // Métodos admin
  createWarehouse?: typeof warehouseService.createWarehouse;
  updateWarehouse?: typeof warehouseService.updateWarehouse;
  deleteWarehouse?: typeof warehouseService.deleteWarehouse;
}

export const useWarehouse = (): UseWarehouseReturn => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [stats, setStats] = useState<WarehouseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const loadWarehouses = useCallback(async (filters: WarehouseFilters = {}) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await warehouseService.getWarehouses(filters);
      setWarehouses(response.warehouses);
      
      // Cargar estadísticas solo si es admin o tiene acceso a warehouses
      if (isAdmin || response.warehouses.length > 0) {
        const statsResponse = await warehouseService.getStats();
        setStats(statsResponse);
      }
    } catch (err) {
      console.error('Error loading warehouses:', err);
      setError(err instanceof Error ? err.message : 'Error loading warehouses');
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  const getWarehouseById = async (id: number): Promise<Warehouse | null> => {
    try {
      const warehouse = await warehouseService.getWarehouse(id);
      return warehouse;
    } catch (err) {
      console.error('Error getting warehouse:', err);
      return null;
    }
  };

  // Cargar warehouses al montar el componente
  useEffect(() => {
    loadWarehouses();
  }, [loadWarehouses]);

  return {
    warehouses,
    stats,
    loading,
    error,
    selectedWarehouse,
    loadWarehouses,
    getWarehouseById,
    setSelectedWarehouse,
    // Incluir métodos admin solo si el usuario es admin
    ...(isAdmin && {
      createWarehouse: warehouseService.createWarehouse,
      updateWarehouse: warehouseService.updateWarehouse,
      deleteWarehouse: warehouseService.deleteWarehouse,
    }),
  };
};