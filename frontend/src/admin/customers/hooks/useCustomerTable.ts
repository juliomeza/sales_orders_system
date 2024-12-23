// frontend/src/admin/customers/hooks/useCustomerTable.ts
import { useState, useCallback, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Customer } from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';
import { CACHE_TIME } from '../../../shared/config/queryClient';

interface UseCustomerTableProps {
  onSearchChange?: (term: string) => void;
  debounceTime?: number;
}

export const useCustomerTable = ({
  onSearchChange,
  debounceTime = 300
}: UseCustomerTableProps = {}) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Debounced search handler
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    const handler = setTimeout(() => {
      onSearchChange?.(value);
    }, debounceTime);

    return () => clearTimeout(handler);
  }, [onSearchChange, debounceTime]);

  // Prefetch customer data
  const prefetchCustomer = useCallback(async (customerId: number) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.customers.byId(customerId),
      staleTime: CACHE_TIME.DYNAMIC
    });
  }, [queryClient]);

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(true);
  }, []);

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

  const handleDelete = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDialogs = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
  }, []);

  // Computed properties
  const dialogState = useMemo(() => ({
    isOpen: isEditDialogOpen || isDeleteDialogOpen,
    mode: isEditDialogOpen ? 'edit' : isDeleteDialogOpen ? 'delete' : null,
    customer: selectedCustomer
  }), [isEditDialogOpen, isDeleteDialogOpen, selectedCustomer]);

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