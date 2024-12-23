/**
 * @fileoverview User management React Query hooks
 * Provides functionality for managing customer users including CRUD operations
 * and password management with optimistic updates and error handling.
 */

// frontend/src/shared/api/queries/useUserQueries.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import { queryKeys } from '../../config/queryKeys';
import { User } from '../types/customer.types';
import { CACHE_TIME } from '../../config/queryClient';

/**
 * Hook to fetch all users associated with a customer
 * 
 * Features:
 * - Conditional fetching based on customer ID
 * - Data normalization for role and status
 * - Smart retry logic for specific error cases
 * 
 * @param {number} customerId - The ID of the customer whose users to fetch
 * @returns {UseQueryResult} Query result containing user list
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
 * Hook to add a new user to a customer account
 * 
 * Features:
 * - Optimistic updates with temporary IDs
 * - Automatic cache invalidation for related queries
 * - Rollback capability on error
 * 
 * @param {number} customerId - The ID of the customer to add the user to
 * @returns {UseMutationResult} Mutation handlers and state
 */
export const useAddUserMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (user: Omit<User, 'id'>) => 
      userService.addUser(customerId, user),
    
    onMutate: async (newUser) => {
      // Optimistic update implementation
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
      // Rollback logic
      if (context?.previousUsers) {
        queryClient.setQueryData<User[]>(
          queryKeys.customers.users(customerId),
          context.previousUsers
        );
      }
      console.error('Error adding user:', error);
    },

    onSettled: () => {
      // Invalidate affected queries
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
 * Hook to update an existing user's information
 * 
 * Features:
 * - Optimistic updates with rollback
 * - Partial updates support
 * - Cache synchronization
 * 
 * @param {number} customerId - The ID of the customer owning the user
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
 * Hook to delete a user from a customer account
 * 
 * Features:
 * - Optimistic deletion
 * - Automatic cache updates
 * - Related queries invalidation
 * 
 * @param {number} customerId - The ID of the customer owning the user
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
 * Hook to handle user password reset
 * 
 * Features:
 * - No optimistic updates for security
 * - Optional cache refresh on success
 * - Error handling for sensitive operation
 * 
 * @param {number} customerId - The ID of the customer owning the user
 */
export const useResetPasswordMutation = (customerId: number) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, password }: { userId: number; password: string }) => 
      userService.resetPassword(customerId, userId, password),
    
    // No optimistic update for security-sensitive operations
    onError: (error) => {
      console.error('Error resetting password:', error);
    },

    onSuccess: () => {
      // Refresh user data after successful password reset
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.customers.users(customerId) 
      });
    }
  });
};