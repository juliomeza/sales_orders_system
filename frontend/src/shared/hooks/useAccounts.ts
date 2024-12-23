// frontend/src/shared/hooks/useAccounts.ts
import { useState, useCallback } from 'react';
import { ShippingAddress } from '../api/types/accounts.types';
import { 
  useShippingAddressesQuery, 
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation 
} from '../api/queries/useAccountQueries';
import { queryClient } from '../config/queryClient';
import { queryKeys } from '../config/queryKeys';

export const useAccounts = (
  initialShipToId?: string,
  initialBillToId?: string,
  initialIsDifferentBillTo: boolean = false
) => {
  const { 
    data: accounts = [], 
    isLoading,
    error: queryError,
    isError
  } = useShippingAddressesQuery();

  const createMutation = useCreateShippingAddressMutation();
  const updateMutation = useUpdateShippingAddressMutation();

  const [selectedIds, setSelectedIds] = useState({
    shipTo: initialShipToId || '',
    billTo: initialBillToId || initialShipToId || ''
  });
  const [isDifferentBillTo, setIsDifferentBillTo] = useState(initialIsDifferentBillTo);

  const selectedShipTo = accounts.find(a => a.id === selectedIds.shipTo) || null;
  const selectedBillTo = isDifferentBillTo 
    ? accounts.find(a => a.id === selectedIds.billTo) 
    : selectedShipTo;

  const handleShipToChange = useCallback((accountId: string, address?: ShippingAddress) => {
    setSelectedIds(prev => ({
      ...prev,
      shipTo: accountId,
      billTo: !isDifferentBillTo ? accountId : prev.billTo
    }));
    return address || accounts.find(a => a.id === accountId) || null;
  }, [isDifferentBillTo, accounts]);

  const handleBillToChange = useCallback((accountId: string, address?: ShippingAddress) => {
    setSelectedIds(prev => ({
      ...prev,
      billTo: accountId
    }));
    return address || accounts.find(a => a.id === accountId) || null;
  }, [accounts]);

  const createNewAccount = useCallback(async (
    newAccount: Omit<ShippingAddress, 'id'>
  ): Promise<ShippingAddress> => {
    try {
      return await createMutation.mutateAsync(newAccount);
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  }, [createMutation]);

  const resetSelections = useCallback(() => {
    setSelectedIds({ shipTo: '', billTo: '' });
    setIsDifferentBillTo(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.shipTo });
  }, []);

  return {
    accounts,
    selectedShipTo,
    selectedBillTo,
    isDifferentBillTo,
    isLoading,
    error: isError ? String(queryError) : null,
    setIsDifferentBillTo,
    handleShipToChange,
    handleBillToChange,
    createNewAccount,
    resetSelections
  };
};