// src/hooks/useShipping.ts
import { useState, useEffect } from 'react';
import { Carrier, Warehouse } from '../types/shipping';
import { mockApi } from '../services/mockApi';

interface UseShippingReturn {
  carriers: Carrier[];
  warehouses: Warehouse[];
  isLoading: boolean;
  error: string | null;
  selectedCarrier: Carrier | null;
  selectedWarehouse: Warehouse | null;
  availableServices: string[];
  setSelectedCarrierId: (carrierId: string) => void;
  setSelectedWarehouseId: (warehouseId: string) => void;
  setSelectedService: (service: string) => void;
  resetSelections: () => void;
}

export const useShipping = (
  initialCarrierId?: string,
  initialWarehouseId?: string,
  initialService?: string
): UseShippingReturn => {
  // Basic state
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedService, setSelectedService] = useState<string>(initialService || '');

  // Load initial data
  useEffect(() => {
    const loadShippingData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [carriersData, warehousesData] = await Promise.all([
          mockApi.getCarriers(),
          mockApi.getWarehouses()
        ]);

        setCarriers(carriersData);
        setWarehouses(warehousesData);

        // Set initial selections if provided
        if (initialCarrierId) {
          const carrier = carriersData.find(c => c.id === initialCarrierId);
          if (carrier) {
            setSelectedCarrier(carrier);
          }
        }

        if (initialWarehouseId) {
          const warehouse = warehousesData.find(w => w.id === initialWarehouseId);
          if (warehouse) {
            setSelectedWarehouse(warehouse);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading shipping data');
      } finally {
        setIsLoading(false);
      }
    };

    loadShippingData();
  }, [initialCarrierId, initialWarehouseId]);

  // Handlers
  const setSelectedCarrierId = (carrierId: string) => {
    const carrier = carriers.find(c => c.id === carrierId);
    setSelectedCarrier(carrier || null);
    setSelectedService(''); // Reset service when carrier changes
  };

  const setSelectedWarehouseId = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id === warehouseId);
    setSelectedWarehouse(warehouse || null);
  };

  const resetSelections = () => {
    setSelectedCarrier(null);
    setSelectedWarehouse(null);
    setSelectedService('');
  };

  // Computed values
  const availableServices = selectedCarrier?.services || [];

  return {
    carriers,
    warehouses,
    isLoading,
    error,
    selectedCarrier,
    selectedWarehouse,
    availableServices,
    setSelectedCarrierId,
    setSelectedWarehouseId,
    setSelectedService,
    resetSelections
  };
};