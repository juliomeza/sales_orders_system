// frontend/src/shared/hooks/useAccounts.ts
/**
 * @fileoverview Custom hook for managing shipping and billing addresses
 * Provides functionality for selecting, creating, and managing shipping/billing addresses
 * with support for different billing address scenarios.
 */

import { useState, useCallback } from 'react';
import { ShippingAddress } from '../api/types/accounts.types';
import { 
  useShippingAddressesQuery, 
  useCreateShippingAddressMutation,
  useUpdateShippingAddressMutation 
} from '../api/queries/useAccountQueries';
import { queryClient } from '../config/queryClient';
import { queryKeys } from '../config/queryKeys';

/**
 * Hook for managing shipping and billing addresses
 * 
 * @param {string} initialShipToId - Initial shipping address ID
 * @param {string} initialBillToId - Initial billing address ID
 * @param {boolean} initialIsDifferentBillTo - Whether billing address differs from shipping
 * @returns {Object} Account management methods and state
 */
export const useAccounts = (
  initialShipToId?: string,
  initialBillToId?: string,
  initialIsDifferentBillTo: boolean = false
) => {
  // Fetch all available shipping addresses
  const { 
    data: accounts = [], 
    isLoading,
    error: queryError,
    isError
  } = useShippingAddressesQuery();

  // Initialize mutations for address management
  const createMutation = useCreateShippingAddressMutation();
  const updateMutation = useUpdateShippingAddressMutation();

  // State for selected addresses
  const [selectedIds, setSelectedIds] = useState({
    shipTo: initialShipToId || '',
    billTo: initialBillToId || initialShipToId || ''
  });
  const [isDifferentBillTo, setIsDifferentBillTo] = useState(initialIsDifferentBillTo);

  // Find selected addresses from accounts list
  const selectedShipTo = accounts.find(a => a.id === selectedIds.shipTo) || null;
  const selectedBillTo = isDifferentBillTo 
    ? accounts.find(a => a.id === selectedIds.billTo) 
    : selectedShipTo;

  /**
   * Handle shipping address selection
   * Updates both shipping and billing if they're linked
   * 
   * @param {string} accountId - Selected address ID
   * @param {ShippingAddress} address - Optional address object
   * @returns {ShippingAddress | null} Selected address
   */
  const handleShipToChange = useCallback((accountId: string, address?: ShippingAddress) => {
    setSelectedIds(prev => ({
      ...prev,
      shipTo: accountId,
      billTo: !isDifferentBillTo ? accountId : prev.billTo
    }));
    return address || accounts.find(a => a.id === accountId) || null;
  }, [isDifferentBillTo, accounts]);

  /**
   * Handle billing address selection
   * Only updates billing address
   * 
   * @param {string} accountId - Selected address ID
   * @param {ShippingAddress} address - Optional address object
   * @returns {ShippingAddress | null} Selected address
   */
  const handleBillToChange = useCallback((accountId: string, address?: ShippingAddress) => {
    setSelectedIds(prev => ({
      ...prev,
      billTo: accountId
    }));
    return address || accounts.find(a => a.id === accountId) || null;
  }, [accounts]);

  /**
   * Create a new shipping address
   * 
   * @param {Omit<ShippingAddress, 'id'>} newAccount - New address data
   * @returns {Promise<ShippingAddress>} Created address
   * @throws {Error} If creation fails
   */
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

  /**
   * Reset all selections and refresh address list
   * Clears selected addresses and resets billing flag
   */
  const resetSelections = useCallback(() => {
    setSelectedIds({ shipTo: '', billTo: '' });
    setIsDifferentBillTo(false);
    queryClient.invalidateQueries({ queryKey: queryKeys.accounts.shipTo });
  }, []);

  // Return hook interface
  return {
    accounts,            // All available addresses
    selectedShipTo,      // Currently selected shipping address
    selectedBillTo,      // Currently selected billing address
    isDifferentBillTo,   // Flag for different billing address
    isLoading,          // Loading state
    error: isError ? String(queryError) : null,  // Error state
    setIsDifferentBillTo,  // Toggle different billing address
    handleShipToChange,    // Update shipping address
    handleBillToChange,    // Update billing address
    createNewAccount,      // Create new address
    resetSelections        // Reset all selections
  };
};