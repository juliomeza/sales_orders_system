// frontend/src/shared/hooks/useAccounts.ts
import { useState, useEffect } from 'react';
import { ShippingAddress } from '../types/shipping';
import { apiClient } from '../../services/api/apiClient';

interface AddressResponse {
  addresses: ShippingAddress[];
}

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
  const [accounts, setAccounts] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedShipTo, setSelectedShipTo] = useState<ShippingAddress | null>(null);
  const [selectedBillTo, setSelectedBillTo] = useState<ShippingAddress | null>(null);
  const [isDifferentBillTo, setIsDifferentBillTo] = useState(initialIsDifferentBillTo);

  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await apiClient.get<AddressResponse>('/ship-to');
        setAccounts(response.addresses);

        // Set initial selections if provided
        if (initialShipToId) {
          const shipTo = response.addresses.find(a => a.id === initialShipToId);
          if (shipTo) {
            setSelectedShipTo(shipTo);
            if (!initialIsDifferentBillTo) {
              setSelectedBillTo(shipTo);
            }
          }
        }

        if (initialBillToId && initialIsDifferentBillTo) {
          const billTo = response.addresses.find(a => a.id === initialBillToId);
          if (billTo) {
            setSelectedBillTo(billTo);
          }
        }

      } catch (err: any) {
        console.error('Error loading accounts:', err);
        setError(err?.response?.data?.error || 'Error loading shipping addresses');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [initialShipToId, initialBillToId, initialIsDifferentBillTo]);

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
      const response = await apiClient.post<ShippingAddress>('/ship-to', newAccount);
      setAccounts(prev => [...prev, response]);
      return response;
    } catch (err: any) {
      console.error('Error creating address:', err);
      throw new Error(err?.response?.data?.error || 'Error creating shipping address');
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
    error,
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