// frontend/src/admin/customers/hooks/useCustomers.ts
import { useCallback } from 'react';
import { 
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation 
} from '../../../shared/api/queries/useCustomerQueries';
import { CreateCustomerData } from '../../../shared/api/types/customer.types';

export const useCustomers = () => {
  const { 
    data: customersData,
    isLoading,
    error,
    refetch: loadCustomers // Añadimos esto
  } = useCustomersQuery();

  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const handleCreateCustomer = async (data: CreateCustomerData) => {
    try {
      await createMutation.mutateAsync(data);
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const handleUpdateCustomer = async (customerId: number, data: Partial<CreateCustomerData>) => {
    try {
      await updateMutation.mutateAsync({ customerId, data });
    } catch (err) {
      console.error('Error updating customer:', err);
      const axiosError = err as any;
      console.error('Server response:', axiosError.response?.data);
      throw err;
    }
  };

  const handleDeleteCustomer = async (customerId: number) => {
    try {
      await deleteMutation.mutateAsync(customerId);
    } catch (err) {
      console.error('Error deleting customer:', err);
      throw err;
    }
  };

  return {
    customers: customersData?.customers ?? [],
    isLoading,
    error: error ? String(error) : null,
    loadCustomers, // Exponemos refetch como loadCustomers
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer
  };
};