// frontend/src/shared/hooks/useAccounts.ts
import { useState, useEffect } from 'react';
import { ShippingAddress } from '../api/types/accounts.types';
import { useShippingAddressesQuery, useCreateShippingAddressMutation } from '../api/queries/useAccountQueries';

interface UseAccountsReturn {
  accounts: ShippingAddress[];
  isLoading: boolean;
  error: string | null;
  selectedShipTo: ShippingAddress | null;
  selectedBillTo: ShippingAddress | null;
  isDifferentBillTo: boolean;
  setIsDifferentBillTo: (value: boolean) => void;
  handleShipToChange: (accountId: string, address?: ShippingAddress) => void;
  handleBillToChange: (accountId: string, address?: ShippingAddress) => void;
  createNewAccount: (newAccount: Omit<ShippingAddress, 'id'>) => Promise<ShippingAddress>;
  resetSelections: () => void;
}

export const useAccounts = (
  initialShipToId?: string,
  initialBillToId?: string,
  initialIsDifferentBillTo: boolean = false
): UseAccountsReturn => {
  const [selectedShipTo, setSelectedShipTo] = useState<ShippingAddress | null>(null);
  const [selectedBillTo, setSelectedBillTo] = useState<ShippingAddress | null>(null);
  const [isDifferentBillTo, setIsDifferentBillTo] = useState(initialIsDifferentBillTo);

  const { 
    data: accounts = [], 
    isLoading, 
    error: queryError 
  } = useShippingAddressesQuery();

  const createMutation = useCreateShippingAddressMutation();

  useEffect(() => {
    if (accounts.length > 0) {
      // Set initial selections if provided
      if (initialShipToId) {
        const shipTo = accounts.find(a => a.id === initialShipToId);
        if (shipTo) {
          setSelectedShipTo(shipTo);
          if (!initialIsDifferentBillTo) {
            setSelectedBillTo(shipTo);
          }
        }
      }

      if (initialBillToId && initialIsDifferentBillTo) {
        const billTo = accounts.find(a => a.id === initialBillToId);
        if (billTo) {
          setSelectedBillTo(billTo);
        }
      }
    }
  }, [accounts, initialShipToId, initialBillToId, initialIsDifferentBillTo]);

  useEffect(() => {
    if (!isDifferentBillTo && selectedShipTo) {
      setSelectedBillTo(selectedShipTo);
    }
  }, [isDifferentBillTo, selectedShipTo]);

  const handleShipToChange = (accountId: string, address?: ShippingAddress) => {
    const shipTo = address || accounts.find(a => a.id === accountId) || null;
    setSelectedShipTo(shipTo);

    if (!isDifferentBillTo && shipTo) {
      setSelectedBillTo(shipTo);
    }
  };

  const handleBillToChange = (accountId: string, address?: ShippingAddress) => {
    const billTo = address || accounts.find(a => a.id === accountId) || null;
    setSelectedBillTo(billTo);
  };

  const createNewAccount = async (newAccount: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> => {
    try {
      const response = await createMutation.mutateAsync(newAccount);
      return response;
    } catch (error) {
      console.error('Error creating address:', error);
      throw error;
    }
  };

  const resetSelections = () => {
    setSelectedShipTo(null);
    setSelectedBillTo(null);
    setIsDifferentBillTo(false);
  };

  return {
    accounts,
    isLoading,
    error: queryError ? String(queryError) : null,
    selectedShipTo,
    selectedBillTo,
    isDifferentBillTo,
    setIsDifferentBillTo,
    handleShipToChange,
    handleBillToChange,
    createNewAccount,
    resetSelections
  };
};