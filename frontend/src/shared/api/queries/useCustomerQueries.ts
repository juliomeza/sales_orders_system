// frontend/src/shared/api/queries/useCustomerQueries.ts
import { 
  useQuery, 
  useMutation, 
  useQueryClient,
  QueryKey
} from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { queryKeys } from '../../config/queryKeys';
import { 
  Customer, 
  CreateCustomerData,
  ServiceResponse 
} from '../types/customer.types';
import { CACHE_TIME } from '../../config/queryClient';

// Types
interface CustomersResponse {
  customers: Customer[];
}

interface UseCustomersQueryOptions {
  status?: number;
  search?: string;
}

// Main Queries
export const useCustomersQuery = (options: UseCustomersQueryOptions = {}) => {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => customerService.getCustomers(options),
    staleTime: CACHE_TIME.DYNAMIC,
    select: (data: CustomersResponse) => ({
      customers: data.customers.map(customer => ({
        ...customer,
        status: customer.status || 1,
        _count: customer._count || { users: 0 }
      }))
    }),
    retry: (failureCount, error: any) => {
      // No retry on 404 or 403
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 3;
    }
  });
};

// Create Customer Mutation
export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCustomerData) => 
      customerService.createCustomer(data),
    
    onMutate: async (newCustomer) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.all 
      });

      // Snapshot the previous value
      const previousCustomers = queryClient.getQueryData<CustomersResponse>(
        queryKeys.customers.all
      );

      // Optimistically update the cache
      if (previousCustomers) {
        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          {
            customers: [
              ...previousCustomers.customers,
              {
                id: Date.now(), // Temporary ID
                ...newCustomer.customer,
                projects: newCustomer.projects || [],
                users: newCustomer.users || [],
                _count: { users: newCustomer.users?.length || 0 }
              }
            ]
          }
        );
      }

      // Return context with snapshot
      return { previousCustomers };
    },

    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousCustomers) {
        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          context.previousCustomers
        );
      }
      console.error('Error creating customer:', error);
    },

    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.all 
      });
    }
  });
};

// Update Customer Mutation
export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ 
      customerId, 
      data 
    }: { 
      customerId: number; 
      data: Partial<CreateCustomerData>; 
    }) => customerService.updateCustomer(customerId, data),

    onMutate: async ({ customerId, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.all 
      });

      const previousCustomers = queryClient.getQueryData<CustomersResponse>(
        queryKeys.customers.all
      );

      if (previousCustomers) {
        const newCustomers = {
          customers: previousCustomers.customers.map(customer => 
            customer.id === customerId
              ? { 
                  ...customer, 
                  ...data.customer,
                  projects: data.projects || customer.projects,
                  users: data.users || customer.users,
                  _count: { 
                    users: data.users?.length || customer._count?.users || 0 
                  }
                }
              : customer
          )
        };

        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          newCustomers
        );
      }

      return { previousCustomers };
    },

    onError: (error, variables, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          context.previousCustomers
        );
      }
      console.error('Error updating customer:', error);
    },

    onSuccess: (updatedCustomer, { customerId }) => {
      // Invalidate related queries
      const relatedQueries: QueryKey[] = [
        queryKeys.customers.all,
        queryKeys.customers.byId(customerId),
        queryKeys.customers.projects(customerId),
        queryKeys.customers.users(customerId)
      ];

      relatedQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  });
};

// Delete Customer Mutation
export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (customerId: number) => 
      customerService.deleteCustomer(customerId),

    onMutate: async (deletedCustomerId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.all 
      });

      const previousCustomers = queryClient.getQueryData<CustomersResponse>(
        queryKeys.customers.all
      );

      if (previousCustomers) {
        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          {
            customers: previousCustomers.customers.filter(
              customer => customer.id !== deletedCustomerId
            )
          }
        );
      }

      return { previousCustomers };
    },

    onError: (error, variables, context) => {
      if (context?.previousCustomers) {
        queryClient.setQueryData<CustomersResponse>(
          queryKeys.customers.all,
          context.previousCustomers
        );
      }
      console.error('Error deleting customer:', error);
    },

    onSuccess: (_, customerId) => {
      // Invalidate related queries
      const relatedQueries: QueryKey[] = [
        queryKeys.customers.all,
        queryKeys.customers.byId(customerId),
        queryKeys.customers.projects(customerId),
        queryKeys.customers.users(customerId)
      ];

      relatedQueries.forEach(queryKey => {
        queryClient.invalidateQueries({ queryKey });
      });
    }
  });
};