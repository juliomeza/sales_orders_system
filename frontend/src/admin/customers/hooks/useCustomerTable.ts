// frontend/src/admin/customers/hooks/useCustomerTable.ts
import { useState, useCallback } from 'react';
import { Customer } from '../types';

export const useCustomerTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
  }, []);

  const handleOpenCreateDialog = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(true);
  }, []);

  const handleEdit = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsEditDialogOpen(true);
  }, []);

  const handleDelete = useCallback((customer: Customer) => {
    setSelectedCustomer(customer);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleCloseDialogs = useCallback(() => {
    setSelectedCustomer(null);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
  }, []);

  return {
    searchTerm,
    selectedCustomer,
    isDeleteDialogOpen,
    isEditDialogOpen,
    handleSearchChange,
    handleOpenCreateDialog,
    handleEdit,
    handleDelete,
    handleCloseDialogs
  };
};