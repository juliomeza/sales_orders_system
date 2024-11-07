// src/hooks/useAccounts.ts
import { useState, useEffect } from 'react';
import { ShippingAddress } from '../types/shipping';
import { mockApi } from '../services/api/mockApi';

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
  // Basic state
  const [accounts, setAccounts] = useState<ShippingAddress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Selection state
  const [selectedShipTo, setSelectedShipTo] = useState<ShippingAddress | null>(null);
  const [selectedBillTo, setSelectedBillTo] = useState<ShippingAddress | null>(null);
  const [isDifferentBillTo, setIsDifferentBillTo] = useState(initialIsDifferentBillTo);

  // Load initial data
  useEffect(() => {
    const loadAccounts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const accountsData = await mockApi.getAccounts();
        setAccounts(accountsData);

        // Set initial selections if provided
        if (initialShipToId) {
          const shipTo = accountsData.find(a => a.id === initialShipToId);
          if (shipTo) {
            setSelectedShipTo(shipTo);
            // If not different bill to, set bill to same as ship to
            if (!initialIsDifferentBillTo) {
              setSelectedBillTo(shipTo);
            }
          }
        }

        if (initialBillToId && initialIsDifferentBillTo) {
          const billTo = accountsData.find(a => a.id === initialBillToId);
          if (billTo) {
            setSelectedBillTo(billTo);
          }
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading accounts');
      } finally {
        setIsLoading(false);
      }
    };

    loadAccounts();
  }, [initialShipToId, initialBillToId, initialIsDifferentBillTo]);

  // Watch isDifferentBillTo changes
  useEffect(() => {
    if (!isDifferentBillTo && selectedShipTo) {
      setSelectedBillTo(selectedShipTo);
    }
  }, [isDifferentBillTo, selectedShipTo]);

  const handleShipToChange = (accountId: string, address?: ShippingAddress) => {
    const shipTo = address || accounts.find(a => a.id === accountId) || null;
    setSelectedShipTo(shipTo);

    // Update bill to if not different
    if (!isDifferentBillTo && shipTo) {
      setSelectedBillTo(shipTo);
    }
  };

  const handleBillToChange = (accountId: string, address?: ShippingAddress) => {
    const billTo = address || accounts.find(a => a.id === accountId) || null;
    setSelectedBillTo(billTo);
  };

  const createNewAccount = async (newAccount: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> => {
    // Simulate API call
    const createdAccount: ShippingAddress = {
      ...newAccount,
      id: `NEW_${Date.now()}`
    };

    setAccounts(prev => [...prev, createdAccount]);
    return createdAccount;
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