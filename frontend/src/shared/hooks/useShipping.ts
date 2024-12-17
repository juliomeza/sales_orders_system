// frontend/src/shared/hooks/useShipping.ts
import { useState, useEffect } from 'react';
import { Carrier, CarrierService, Warehouse } from '../api/types/shipping.types';
import { useCarriersQuery, useWarehousesQuery } from '../api/queries/useShippingQueries';

export const useShipping = (
  initialCarrierId?: string | null,
  initialWarehouseId?: string | null,
  initialServiceId?: string | null
) => {
  const [selectedCarrier, setSelectedCarrier] = useState<Carrier | null>(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState<Warehouse | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialServiceId || '');
  const [availableServices, setAvailableServices] = useState<CarrierService[]>([]);

  const { 
    data: carriers = [], 
    isLoading: isLoadingCarriers, 
    error: carriersError 
  } = useCarriersQuery();

  const { 
    data: warehouses = [], 
    isLoading: isLoadingWarehouses, 
    error: warehousesError 
  } = useWarehousesQuery();

  // Set initial carrier and its services if provided
  useEffect(() => {
    if (carriers.length > 0 && initialCarrierId) {
      const carrier = carriers.find(c => c.id.toString() === initialCarrierId);
      if (carrier) {
        setSelectedCarrier(carrier);
        setAvailableServices(carrier.services);
      }
    }
  }, [carriers, initialCarrierId]);

  // Set initial warehouse if provided
  useEffect(() => {
    if (warehouses.length > 0 && initialWarehouseId) {
      const warehouse = warehouses.find(w => w.id.toString() === initialWarehouseId);
      if (warehouse) {
        setSelectedWarehouse(warehouse);
      }
    }
  }, [warehouses, initialWarehouseId]);

  // Update available services when carrier changes
  useEffect(() => {
    if (selectedCarrier) {
      setAvailableServices(selectedCarrier.services || []);
      
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
    carriers,
    warehouses,
    availableServices,
    selectedCarrier,
    selectedWarehouse,
    selectedService: selectedServiceId,
    isLoading: isLoadingCarriers || isLoadingWarehouses,
    error: carriersError || warehousesError ? String(carriersError || warehousesError) : null,
    setSelectedCarrierId,
    setSelectedWarehouseId,
    setSelectedService
  };
};