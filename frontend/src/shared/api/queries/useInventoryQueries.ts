// frontend/src/shared/api/queries/useInventoryQueries.ts
import { useQuery } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';
import { queryKeys } from '../../config/queryClient';
import { MaterialQueryParams } from '../types/inventory.types';

export const useInventoryQuery = (searchTerm: string = '') => {
  const params: MaterialQueryParams = searchTerm ? { query: searchTerm } : {};
  
  return useQuery({
    queryKey: searchTerm ? queryKeys.inventory.search(searchTerm) : queryKeys.inventory.all,
    queryFn: () => inventoryService.getInventory(params),
    placeholderData: (previousData) => previousData, // Reemplaza keepPreviousData
  });
};