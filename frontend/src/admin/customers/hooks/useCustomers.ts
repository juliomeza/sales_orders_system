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

/**
 * Interface representing the structure of customers data from the API
 * @interface CustomersData
 * @property {Customer[]} customers - Array of customer records
 */
interface CustomersData {
  customers: Customer[];
}

/**
 * Custom hook for managing customer data operations
 * Provides CRUD operations with optimistic updates and error handling
 */
export const useCustomers = () => {
  const queryClient = useQueryClient();
  
  // Query and mutation hooks setup
  const { 
    data: customersData,
    isLoading,
    error,
    refetch: loadCustomers
  } = useCustomersQuery();

  const createMutation = useCreateCustomerMutation();
  const updateMutation = useUpdateCustomerMutation();
  const deleteMutation = useDeleteCustomerMutation();

  /**
   * Creates a new customer with optimistic updates
   * @param {CreateCustomerData} data - Customer data to be created
   * @throws {Error} When creation fails
   */
  const handleCreateCustomer = useCallback(async (data: CreateCustomerData) => {
    let previousData: CustomersData | undefined;
  
    try {
      // Cancel outgoing queries and prepare for optimistic update
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.all });
      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);
  
      // Optimistic update with temporary ID
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
  
      // Perform actual server update
      const savedCustomer = await createMutation.mutateAsync(data);
  
      // Update cache with real server data
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
      // Rollback optimistic update on error
      if (previousData) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, previousData);
      }
      console.error('Error creating customer:', error);
      throw error;
    }
  }, [createMutation, queryClient]);

  /**
   * Updates an existing customer with optimistic updates
   * @param {number} customerId - ID of the customer to update
   * @param {Partial<CreateCustomerData>} data - Updated customer data
   * @throws {Error} When update fails
   */
  const handleUpdateCustomer = useCallback(async (
    customerId: number, 
    data: Partial<CreateCustomerData>
  ) => {
    let previousData: CustomersData | undefined;

    try {
      // Prepare for optimistic update
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.byId(customerId) 
      });

      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);

      // Perform optimistic update
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

      // Execute server update
      await updateMutation.mutateAsync({ customerId, data });

      // Invalidate and refetch affected queries
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.customers.all }),
        queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.byId(customerId)
        })
      ]);
    } catch (error) {
      // Rollback on error
      if (previousData) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, previousData);
      }
      console.error('Error updating customer:', error);
      throw error;
    }
  }, [updateMutation, queryClient]);

  /**
   * Deletes a customer with optimistic updates
   * @param {number} customerId - ID of the customer to delete
   * @throws {Error} When deletion fails
   */
  const handleDeleteCustomer = useCallback(async (customerId: number) => {
    let previousData: CustomersData | undefined;

    try {
      // Prepare for optimistic deletion
      await queryClient.cancelQueries({ queryKey: queryKeys.customers.all });

      previousData = queryClient.getQueryData<CustomersData>(queryKeys.customers.all);

      // Perform optimistic removal
      if (previousData?.customers) {
        queryClient.setQueryData<CustomersData>(queryKeys.customers.all, {
          customers: previousData.customers.filter(
            customer => customer.id !== customerId
          )
        });
      }

      // Execute server deletion
      await deleteMutation.mutateAsync(customerId);

      // Invalidate affected queries
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

  // Return hook interface with all necessary operations and state
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