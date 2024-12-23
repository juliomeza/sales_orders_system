// frontend/src/admin/customers/hooks/useCustomerTable.ts
import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Customer } from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';
import { CACHE_TIME } from '../../../shared/config/queryClient';

/**
 * Interface for useCustomerTable hook props
 * @interface UseCustomerTableProps
 * @property {(term: string) => void} [onSearchChange] - Optional callback for search term changes
 * @property {number} [debounceTime] - Debounce delay in milliseconds for search
 */
interface UseCustomerTableProps {
  onSearchChange?: (term: string) => void;
  debounceTime?: number;
}

/**
 * Custom hook for managing customer table state and interactions
 * Handles search, selection, and dialog states for customer management
 */
export const useCustomerTable = ({
  onSearchChange,
  debounceTime = 300
}: UseCustomerTableProps = {}) => {
  const queryClient = useQueryClient();
  
  // State management for table interactions
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  /**
   * Handles search input changes with debouncing
   * Prevents excessive API calls by delaying the search callback
   * @param {string} value - Current search input value
   */
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    const handler = setTimeout(() => {
      onSearchChange?.(value);
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [onSearchChange, debounceTime]);

  /**
   * Prefetches customer data for quick access
   * Uses React Query's prefetchQuery to cache customer details
   * @param {number} customerId - ID of the customer to prefetch
   */
  const prefetchCustomer = useCallback(async (customerId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.customers.byId(customerId),
      staleTime: CACHE_TIME.DYNAMIC
    });
  }, [queryClient]);

  /**
   * Handles opening the create customer dialog
   * Resets selected customer and opens edit dialog in create mode
   */
  const handleOpenCreateDialog = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(true);
  }, []);

  /**
   * Handles initiating customer edit
   * Prefetches customer data before opening edit dialog
   * @param {Customer} customer - Customer to be edited
   */
  const handleEdit = useCallback(async (customer: Customer) => {
    try {
      // Prefetch customer details before opening dialog
      if (customer.id) {
        await prefetchCustomer(customer.id);
      }
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    } catch (error) {
      console.error('Error prefetching customer data:', error);
      // Still open dialog even if prefetch fails
      setSelectedCustomer(customer);
      setIsEditDialogOpen(true);
    }
  }, [prefetchCustomer]);

  /**
   * Handles initiating customer deletion
   * Sets selected customer and opens delete confirmation dialog
   * @param {Customer} customer - Customer to be deleted
   */
  const handleDelete = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  }, []);

  /**
   * Handles closing all dialogs
   * Resets selected customer and dialog states
   */
  const handleCloseDialogs = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
  }, []);

  /**
   * Computed dialog state object
   * Combines dialog states and selected customer info
   */
  const dialogState = useMemo(() => ({
    isOpen: isEditDialogOpen || isDeleteDialogOpen,
    mode: isEditDialogOpen ? 'edit' : isDeleteDialogOpen ? 'delete' : null,
    customer: selectedCustomer
  }), [isEditDialogOpen, isDeleteDialogOpen, selectedCustomer]);

  // Return hook interface with all necessary state and handlers
  return {
    searchTerm,
    selectedCustomer,
    isDeleteDialogOpen,
    isEditDialogOpen,
    dialogState,
    handleSearchChange,
    handleOpenCreateDialog,
    handleEdit,
    handleDelete,
    handleCloseDialogs,
    prefetchCustomer
  };
};