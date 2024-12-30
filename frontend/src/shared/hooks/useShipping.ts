// frontend/src/shared/hooks/useShipping.ts
/**
 * @fileoverview Custom hook for managing shipping-related selections
 * Provides comprehensive state management for carriers, warehouses, and shipping services
 * with support for initial values and automatic service validation.
 */

import { useState, useCallback, useEffect } from 'react';
import { Carrier, CarrierService, Warehouse, CarrierFilters, WarehouseFilters } from '../api/types/shipping.types';
import { 
  useCarriersQuery, 
  useWarehousesQuery,
  useCarrierServicesQuery 
} from '../api/queries/useShippingQueries';

/**
 * Hook for managing shipping selections and related data
 * 
 * @param {string} initialCarrierId - Initial carrier selection
 * @param {string} initialWarehouseId - Initial warehouse selection
 * @param {string} initialServiceId - Initial service selection
 * @returns {Object} Shipping state and selection handlers
 */
export const useShipping = (
  initialCarrierId?: string,
  initialWarehouseId?: string,
  initialServiceId?: string
) => {
  // Initialize selection state with provided values or empty strings
  const [selectedIds, setSelectedIds] = useState({
    carrier: initialCarrierId || '',
    warehouse: initialWarehouseId || '',
    service: initialServiceId || ''
  });

  // Define default filters
  const defaultFilters: CarrierFilters = {
    page: 1,
    limit: 100, // Ajusta según necesidades
    status: 1 // Solo carriers activos
  };

  const defaultWarehouseFilters: WarehouseFilters = {
    page: 1,
    limit: 100 // Ajusta según necesidades
  };

  // Fetch required data using React Query hooks
  const { 
    data: carriersResponse = { data: [], page: 1, limit: 10, total: 0 },
    isLoading: isLoadingCarriers,
    error: carriersError 
  } = useCarriersQuery(defaultFilters);

  const { 
    data: warehousesResponse = { data: [], page: 1, limit: 10, total: 0 }, 
    isLoading: isLoadingWarehouses,
    error: warehousesError 
  } = useWarehousesQuery(defaultWarehouseFilters);

  const {
    data: services = [],
    isLoading: isLoadingServices
  } = useCarrierServicesQuery(selectedIds.carrier);

  // Find selected entities from available data
  const selectedCarrier = carriersResponse.data.find(
    (c: Carrier) => c.id.toString() === selectedIds.carrier
  );
  const selectedWarehouse = warehousesResponse.data.find(
    (w: Warehouse) => w.id.toString() === selectedIds.warehouse
  );
  const availableServices = selectedCarrier?.services || services || [];

  /**
   * Validate initial service selection when carrier changes
   * Clears service selection if it's no longer valid for the selected carrier
   */
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

  /**
   * Updates selected carrier and resets service selection
   * @param {string} carrierId - New carrier ID
   */
  const setSelectedCarrierId = useCallback((carrierId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      carrier: carrierId,
      service: ''  // Reset service when carrier changes
    }));
  }, []);

  /**
   * Updates selected warehouse
   * @param {string} warehouseId - New warehouse ID
   */
  const setSelectedWarehouseId = useCallback((warehouseId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      warehouse: warehouseId
    }));
  }, []);

  /**
   * Updates selected service
   * @param {string} serviceId - New service ID
   */
  const setSelectedService = useCallback((serviceId: string) => {
    setSelectedIds(prev => ({
      ...prev,
      service: serviceId
    }));
  }, []);

  // Return hook interface
  return {
    carriers: carriersResponse.data.filter((carrier: Carrier) => carrier.status === 1),
    warehouses: warehousesResponse.data,
    availableServices: availableServices.filter((service: CarrierService) => service.status === 1),
    selectedCarrier,
    selectedWarehouse,
    selectedService: selectedIds.service,
    isLoading: isLoadingCarriers || isLoadingWarehouses || isLoadingServices,
    error: carriersError || warehousesError ? String(carriersError || warehousesError) : null,
    setSelectedCarrierId,
    setSelectedWarehouseId,
    setSelectedService,
    // Metadata adicional por si se necesita para paginación
    carriersMeta: {
      total: carriersResponse.total,
      page: carriersResponse.page,
      limit: carriersResponse.limit
    },
    warehousesMeta: {
      total: warehousesResponse.total,
      page: warehousesResponse.page,
      limit: warehousesResponse.limit
    }
  };
};