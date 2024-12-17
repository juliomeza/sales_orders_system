// frontend/src/shared/api/queries/useAccountQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { accountsService } from '../services/accountsService';
import { queryKeys } from '../../config/queryClient';
import { ShippingAddress } from '../types/accounts.types';

export const useShippingAddressesQuery = () => {
  return useQuery({
    queryKey: queryKeys.accounts.shipTo,
    queryFn: () => accountsService.getShippingAddresses(),
  });
};

export const useCreateShippingAddressMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newAccount: Omit<ShippingAddress, 'id'>) => 
      accountsService.createShippingAddress(newAccount),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.shipTo });
    },
  });
};