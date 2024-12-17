// frontend/src/shared/api/queries/useUserQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { queryKeys } from '../../config/queryClient';
import { User } from '../types/customer.types';

export const useCustomerUsersQuery = (customerId: number) => {
  return useQuery({
    queryKey: queryKeys.customers.users(customerId),
    queryFn: () => userService.getCustomerUsers(customerId),
    enabled: !!customerId,
  });
};

export const useAddUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: Omit<User, 'id'>) => 
      userService.addUser(customerId, user),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    },
  });
};

export const useUpdateUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Partial<User> }) =>
      userService.updateUser(customerId, userId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    },
  });
};

export const useDeleteUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => 
      userService.deleteUser(customerId, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    },
  });
};

export const useResetPasswordMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) => 
      userService.resetPassword(customerId, userId, password),
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    },
  });
};