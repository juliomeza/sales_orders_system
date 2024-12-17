// frontend/src/shared/api/queries/useCustomerQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customerService } from '../services/customerService';
import { queryKeys } from '../../config/queryClient';
import { Customer, CreateCustomerData } from '../types/customer.types';

export const useCustomersQuery = () => {
  return useQuery({
    queryKey: queryKeys.customers.all,
    queryFn: () => customerService.getCustomers(),
  });
};

export const useCreateCustomerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateCustomerData) => customerService.createCustomer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useUpdateCustomerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ customerId, data }: { customerId: number; data: Partial<CreateCustomerData> }) => 
      customerService.updateCustomer(customerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};

export const useDeleteCustomerMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (customerId: number) => customerService.deleteCustomer(customerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.customers.all });
    },
  });
};