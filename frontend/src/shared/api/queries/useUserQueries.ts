// frontend/src/shared/api/queries/useUserQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { queryKeys } from '../../config/queryKeys';
import { User } from '../types/customer.types';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch all users for a customer
 */
export const useCustomerUsersQuery = (customerId: number) => {
  return useQuery<User[], Error>({
    queryKey: queryKeys.customers.users(customerId),
    queryFn: () => userService.getCustomerUsers(customerId),
    enabled: Boolean(customerId),
    staleTime: CACHE_TIME.DYNAMIC,
    select: (users) => users.map(user => ({
      ...user,
      role: user.role || 'CLIENT',
      status: user.status || 1
    })),
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      if (error?.response?.status === 403) return false;
      return failureCount < 2;
    }
  });
};

/**
 * Hook to add a new user
 */
export const useAddUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: Omit<User, 'id'>) => 
      userService.addUser(customerId, user),
    
    onMutate: async (newUser) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });

      const previousUsers = queryClient.getQueryData<User[]>(
        queryKeys.customers.users(customerId)
      );

      if (previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          [
            ...previousUsers,
            { ...newUser, id: Date.now() } // Temporary ID
          ]
        );
      }

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          context.previousUsers
        );
      }
      console.error('Error adding user:', error);
    },

    onSettled: () => {
      // Invalidate both users and customer queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.byId(customerId) 
      });
    }
  });
};

/**
 * Hook to update an existing user
 */
export const useUpdateUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, data }: { userId: number; data: Partial<User> }) =>
      userService.updateUser(customerId, userId, data),
    
    onMutate: async ({ userId, data }) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });

      const previousUsers = queryClient.getQueryData<User[]>(
        queryKeys.customers.users(customerId)
      );

      if (previousUsers) {
        const updatedUsers = previousUsers.map(user =>
          user.id === userId ? { ...user, ...data } : user
        );

        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          updatedUsers
        );
      }

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          context.previousUsers
        );
      }
      console.error('Error updating user:', error);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    }
  });
};

/**
 * Hook to delete a user
 */
export const useDeleteUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (userId: number) => 
      userService.deleteUser(customerId, userId),
    
    onMutate: async (deletedUserId) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });

      const previousUsers = queryClient.getQueryData<User[]>(
        queryKeys.customers.users(customerId)
      );

      if (previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          previousUsers.filter(user => user.id !== deletedUserId)
        );
      }

      return { previousUsers };
    },

    onError: (error, variables, context) => {
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          context.previousUsers
        );
      }
      console.error('Error deleting user:', error);
    },

    onSettled: () => {
      // Invalidate both users and customer queries
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.byId(customerId) 
      });
    }
  });
};

/**
 * Hook to reset user password
 */
export const useResetPasswordMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ 
      userId, 
      password 
    }: { 
      userId: number; 
      password: string 
    }) => userService.resetPassword(customerId, userId, password),
    
    // No optimistic update for password reset
    onError: (error) => {
      console.error('Error resetting password:', error);
    },

    onSuccess: () => {
      // Optionally invalidate user query to refresh status/metadata
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    }
  });
};