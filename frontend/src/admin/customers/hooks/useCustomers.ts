// frontend/src/admin/customers/hooks/useCustomers.ts
import { useState, useCallback } from 'react';
import { apiClient } from '../../../shared/api/apiClient';
import { Customer, CreateCustomerData } from '../types';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiClient.get<{ customers: Customer[] }>('/customers');
      setCustomers(response.customers);
    } catch (err) {
      setError('Error loading customers');
      console.error('Error loading customers:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleCreateCustomer = async (data: CreateCustomerData) => {
    try {
      const response = await apiClient.post<Customer>('/customers', data);
      await loadCustomers();
      return response;
    } catch (err) {
      setError('Error creating customer');
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const handleUpdateCustomer = async (customerId: number, data: CreateCustomerData) => {
    try {
      const response = await apiClient.put<Customer>(`/customers/${customerId}`, data);
      await loadCustomers();
      return response;
    } catch (err) {
      setError('Error updating customer');
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await apiClient.delete(`/customers/${customerId}`);
      await loadCustomers();
    } catch (err) {
      setError('Error deleting customer');
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  return {
    customers,
    isLoading,
    error,
    loadCustomers,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
  };
};