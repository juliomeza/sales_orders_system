// frontend/src/shared/api/queries/useShippingQueries.ts
import { useQuery } from '@tanstack/react-query';
import { shippingService } from '../services/shippingService';
import { queryKeys } from '../../config/queryKeys';
import { Carrier, Warehouse } from '../types/shipping.types';

export const useCarriersQuery = () => {
  return useQuery<Carrier[]>({
    queryKey: queryKeys.shipping.carriers,
    queryFn: () => shippingService.getCarriers(),
  });
};

export const useWarehousesQuery = () => {
  return useQuery<Warehouse[]>({
    queryKey: queryKeys.shipping.warehouses,
    queryFn: () => shippingService.getWarehouses(),
  });
};