/**
 * @fileoverview Custom hook for managing shipping-related selections
 * Provides comprehensive state management for carriers, warehouses, and shipping services
 * with support for initial values and automatic service validation.
 */

import { useState, useCallback, useEffect } from 'react';
import { Carrier, CarrierService, Warehouse } from '../api/types/shipping.types';
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

  // Fetch required data using React Query hooks
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

  // Find selected entities from available data
  const selectedCarrier = carriers.find((c: Carrier) => c.id.toString() === selectedIds.carrier);
  const selectedWarehouse = warehouses.find((w: Warehouse) => w.id.toString() === selectedIds.warehouse);
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
    carriers: carriers.filter((carrier: Carrier) => carrier.status === 1),  // Only active carriers
    warehouses,
    availableServices: availableServices.filter((service: CarrierService) => service.status === 1),  // Only active services
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