// frontend/src/admin/customers/hooks/useCustomers.ts
import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { 
  useCustomersQuery,
  useCreateCustomerMutation,
  useUpdateCustomerMutation,
  useDeleteCustomerMutation 
} from '../../../shared/api/queries/useCustomerQueries';
import { Customer, CreateCustomerData } from '../../../shared/api/types/customer.types';
import { queryKeys } from '../../../shared/config/queryKeys';

interface CustomersData {
  customers: Customer[];
}

export const useCustomers = () => {
  const queryClient = useQueryClient();
  
  const { 
    data: customersData,
    isLoading,
    error,
    refetch: loadCustomers
  } = useCustomersQuery();

  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  const handleCreateCustomer = useCallback(async (data: CreateCustomerData) => {
    let previousData: CustomersData | undefined;
    
    try {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.all });
      
      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);
      
      // Optimistic update
      if (previousData?.customers) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, {
          customers: [
            ...previousData.customers,
            {
              id: Date.now(), // Temporary ID
              ...data.customer,
              _count: { users: data.users?.length || 0 }
            }
          ]
        });
      }

      await createMutation.mutateAsync(data);
      
      // Invalidate and refetch
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, previousData);
      }
      console.error('Error creating customer:', error);
      throw error;
    }
  }, [createMutation, queryClient]);

  const handleUpdateCustomer = useCallback(async (
    customerId: number, 
    data: Partial<CreateCustomerData>
  ) => {
    let previousData: CustomersData | undefined;

    try {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.byId(customerId) 
      });

      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);

      // Optimistic update
      if (previousData?.customers) {
        const updatedCustomers = previousData.customers.map(customer =>
          customer.id === customerId
            ? { ...customer, ...data.customer }
            : customer
        );

        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, {
          customers: updatedCustomers
        });
      }

      await updateMutation.mutateAsync({ customerId, data });

      // Invalidate related queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
      await queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.byId(customerId)
      });
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, previousData);
      }
      console.error('Error updating customer:', error);
      throw error;
    }
  }, [updateMutation, queryClient]);

  const handleDeleteCustomer = useCallback(async (customerId: number) => {
    let previousData: CustomersData | undefined;

    try {
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.all });

      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);

      // Optimistic update
      if (previousData?.customers) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, {
          customers: previousData.customers.filter(
            customer => customer.id !== customerId
          )
        });
      }

      await deleteMutation.mutateAsync(customerId);

      // Invalidate queries
      await queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, previousData);
      }
      console.error('Error deleting customer:', error);
      throw error;
    }
  }, [deleteMutation, queryClient]);

  return {
    customers: customersData?.customers ?? [],
    isLoading,
    error: error ? String(error) : null,
    loadCustomers,
    handleCreateCustomer,
    handleUpdateCustomer,
    handleDeleteCustomer,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending
  };
};