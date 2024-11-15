// frontend/src/shared/hooks/useShipping.ts
import { useState, useEffect } from 'react';
import { apiClient } from '../api/apiClient';

interface CarrierService {
  id: number;
  lookupCode: string;
  name: string;
  description: string | null;
  status: number;
}

interface Carrier {
  id: number;
  lookupCode: string;
  name: string;
  status: number;
  services: CarrierService[];
}

interface Warehouse {
  id: number;
  lookupCode: string;
  name: string;
  status: number;
  city: string;
  state: string;
  address: string;
}

interface WarehousesResponse {
  warehouses: Warehouse[];
  total: number;
}

interface CarriersResponse {
  carriers: Carrier[];
  total: number;
}

export const useShipping = (
  initialCarrierId?: string | null,
  initialWarehouseId?: string | null,
  initialServiceId?: string | null
) => {
  const [carriers, setCarriers] = useState<Carrier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [availableServices, setAvailableServices] = useState<CarrierService[]>([]);

  // Load initial data
  useEffect(() => {
    const loadShippingData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const [carriersResponse, warehousesResponse] = await Promise.all([
          apiClient.get<CarriersResponse>('/carriers'),
          apiClient.get<WarehousesResponse>('/warehouses')
        ]);

        console.log('Warehouse Response:', warehousesResponse);

        setCarriers(carriersResponse.carriers);
        setWarehouses(warehousesResponse.warehouses);

        // Set initial carrier and its services if provided
        if (initialCarrierId) {
          const carrier = carriersResponse.carriers.find(
            c => c.id.toString() === initialCarrierId
          );
          if (carrier) {
            setSelectedCarrier(carrier);
            setAvailableServices(carrier.services);
          }
        }

        // Set initial warehouse if provided
        if (initialWarehouseId) {
          const warehouse = warehousesResponse.warehouses.find(
            w => w.id.toString() === initialWarehouseId
          );
          if (warehouse) {
            setSelectedWarehouse(warehouse);
          }
        }

      } catch (err: any) {
        console.error('Error loading shipping data:', err);
        setError(err?.response?.data?.error || 'Error loading shipping data');
      } finally {
        setIsLoading(false);
      }
    };

    loadShippingData();
  }, [initialCarrierId, initialWarehouseId]);

  // Update available services when carrier changes
  useEffect(() => {
    if (selectedCarrier) {
      setAvailableServices(selectedCarrier.services || []);
      
      // If there's an initial service ID and it's valid for this carrier,
      // keep it selected
      if (initialServiceId) {
        const serviceExists = selectedCarrier.services.some(
          s => s.id.toString() === initialServiceId
        );
        if (!serviceExists) {
          setSelectedServiceId('');
        }
      }
    } else {
      setAvailableServices([]);
      setSelectedServiceId('');
    }
  }, [selectedCarrier, initialServiceId]);

  const setSelectedCarrierId = (carrierId: string) => {
    const carrier = carriers.find(c => c.id.toString() === carrierId);
    setSelectedCarrier(carrier || null);
    if (!carrier) {
      setSelectedServiceId('');
      setAvailableServices([]);
    }
  };

  const setSelectedWarehouseId = (warehouseId: string) => {
    const warehouse = warehouses.find(w => w.id.toString() === warehouseId);
    setSelectedWarehouse(warehouse || null);
  };

  const setSelectedService = (serviceId: string) => {
    setSelectedServiceId(serviceId);
  };

  return {
    // Data
    carriers,
    warehouses,
    availableServices,
    
    // Selected states
    selectedCarrier,
    selectedWarehouse,
    selectedService: selectedServiceId,
    
    // UI states
    isLoading,
    error,
    
    // Handlers
    setSelectedCarrierId,
    setSelectedWarehouseId,
    setSelectedService
  };
};