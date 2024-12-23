// frontend/src/shared/hooks/useShipping.ts
import { useState, useCallback, useEffect } from 'react';
import { Carrier, CarrierService, Warehouse } from '../api/types/shipping.types';
import { 
  useCarriersQuery, 
  useWarehousesQuery,
  useCarrierServicesQuery 
} from '../api/queries/useShippingQueries';

export const useShipping = (
  initialCarrierId?: string,
  initialWarehouseId?: string,
  initialServiceId?: string
) => {
  const [selectedIds, setSelectedIds] = useState({
    carrier: initialCarrierId || '',
    warehouse: initialWarehouseId || '',
    service: initialServiceId || ''
  });

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

  const {
    data: services = [],
    isLoading: isLoadingServices
  } = useCarrierServicesQuery(selectedIds.carrier);

  const selectedCarrier = carriers.find((c: Carrier) => c.id.toString() === selectedIds.carrier);
  const selectedWarehouse = warehouses.find((w: Warehouse) => w.id.toString() === selectedIds.warehouse);
  const availableServices = selectedCarrier?.services || services || [];

  useEffect(() => {
    if (selectedCarrier && initialServiceId) {
      const serviceExists = availableServices.some(
        (s: CarrierService) => s.id.toString() === initialServiceId
      );
      if (!serviceExists) {
        setSelectedIds(prev => ({ ...prev, service: '' }));
      }
    }
  }, [selectedCarrier, initialServiceId, availableServices]);

  const setSelectedCarrierId = useCallback((carrierId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      carrier: carrierId,
      service: ''
    }));
  }, []);

  const setSelectedWarehouseId = useCallback((warehouseId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      warehouse: warehouseId
    }));
  }, []);

  const setSelectedService = useCallback((serviceId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      service: serviceId
    }));
  }, []);

  return {
    carriers: carriers.filter((carrier: Carrier) => carrier.status === 1),
    warehouses,
    availableServices: availableServices.filter((service: CarrierService) => service.status === 1),
    selectedCarrier,
    selectedWarehouse,
    selectedService: selectedIds.service,
    isLoading: isLoadingCarriers || isLoadingWarehouses || isLoadingServices,
    error: carriersError || warehousesError ? String(carriersError || warehousesError) : null,
    setSelectedCarrierId,
    setSelectedWarehouseId,
    setSelectedService
  };
};