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
      const tempId = Date.now();
      if (previousData?.customers) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, {
          customers: [
            ...previousData.customers,
            {
              id: tempId, // Temporary ID
              ...data.customer,
              _count: { users: data.users?.length || 0 }
            }
          ]
        });
      }
  
      // Await server response
      const savedCustomer = await createMutation.mutateAsync(data);
  
      // Replace temporary ID with actual ID
      queryClient.setQueryData<CustomersData>(queryKeys.customers.all, (oldData) => {
        if (!oldData) return oldData; // Si no hay datos previos, no se modifica nada.
      
        // Mapeamos y nos aseguramos de que solo retornamos valores del tipo Customer.
        return {
          customers: oldData.customers.map((customer) => {
            if (customer.id === tempId) {
              return savedCustomer; // Reemplazamos el ID temporal con el del servidor.
            }
            return customer; // Retornamos el resto de los clientes sin cambios.
          }) as Customer[], // Aseguramos explícitamente que el resultado es del tipo Customer[].
        };
      });
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