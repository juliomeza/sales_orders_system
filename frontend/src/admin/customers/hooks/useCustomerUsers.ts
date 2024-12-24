// frontend/src/admin/customers/hooks/useCustomerUsers.ts
/**
 * Custom hook for managing customer users.
 * Provides functionality for CRUD operations on users and password management.
 */

import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { User } from '../../../shared/api/types/customer.types';
import {
  useCustomerUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation
} from '../../../shared/api/queries/useUserQueries';
import { queryKeys } from '../../../shared/config/queryKeys';

/**
 * Props interface for the useCustomerUsers hook
 */
interface UseCustomerUsersProps {
  customerId?: number;        // Optional ID of the customer
  initialUsers?: User[];      // Initial array of users
  onChange: (users: User[]) => void;  // Callback when users change
}

interface UsersData {
  users: User[];
}

interface NewUser extends User {
  password: string;
  confirmPassword: string;
}

/**
 * Hook for managing customer users including adding, updating, deleting users and password reset functionality
 * @param customerId - The ID of the customer
 * @param initialUsers - Initial array of users
 * @param onChange - Callback function when users change
 */
export const useCustomerUsers = ({ 
  customerId,
  initialUsers = [],
  onChange 
}: UseCustomerUsersProps) => {
  const queryClient = useQueryClient();
  
  // State for managing new user form data
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    role: 'CLIENT',
    status: 1,
    password: '',
    confirmPassword: ''
  });

  // State for managing password reset functionality
  const [resetPasswordUser, setResetPasswordUser] = useState<{
    index: number; 
    email: string;
  } | null>(null);

  // Fetch users data using React Query
  const { 
    data: users = initialUsers,
    isLoading,
    error
  } = useCustomerUsersQuery(customerId ?? 0);

  // Mutation hooks for user operations
  const addUserMutation = useAddUserMutation(customerId ?? 0);
  const updateUserMutation = useUpdateUserMutation(customerId ?? 0);
  const deleteUserMutation = useDeleteUserMutation(customerId ?? 0);
  const resetPasswordMutation = useResetPasswordMutation(customerId ?? 0);

  /**
   * Validates email format using regex
   * @param email - Email string to validate
   */
  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  /**
   * Validates password length
   * @param password - Password string to validate
   */
  const validatePassword = useCallback((password: string) => {
    return password.length >= 8;
  }, []);

  /**
   * Validates form fields and returns error messages
   * @returns Object containing field errors
   */
  const getFieldError = useCallback(() => {
    const errors: Record<string, string> = {};
    
    if (newUser.email && !validateEmail(newUser.email)) {
      errors.email = 'Invalid email format';
    }
    
    if (newUser.password && !validatePassword(newUser.password)) {
      errors.password = 'Password must be at least 8 characters';
    }
    
    if (newUser.confirmPassword && newUser.password !== newUser.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return errors;
  }, [newUser, validateEmail, validatePassword]);

  /**
   * Handles adding a new user with optimistic updates
   * Includes validation, error handling, and query invalidation
   */
  const handleAddUser = useCallback(async () => {
    if (!validateEmail(newUser.email) || !newUser.password || 
        newUser.password !== newUser.confirmPassword) {
      return;
    }

    let previousData: UsersData | undefined;
    
    try {
      const userToAdd = {
        email: newUser.email,
        role: 'CLIENT',
        status: 1,
        password: newUser.password
      };

      if (customerId) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.users(customerId) 
        });

        previousData = queryClient.getQueryData<UsersData>(
          queryKeys.customers.users(customerId)
        );

        // Optimistic update
        if (previousData?.users) {
          queryClient.setQueryData<UsersData>(
            queryKeys.customers.users(customerId),
            {
              users: [...previousData.users, { ...userToAdd, id: Date.now() }]
            }
          );
        }

        await addUserMutation.mutateAsync(userToAdd);
      }

      const updatedUsers = [...users, userToAdd];
      onChange(updatedUsers);
      
      setNewUser({
        email: '',
        role: 'CLIENT',
        status: 1,
        password: '',
        confirmPassword: ''
      });

      // Invalidate related queries
      if (customerId) {
        await Promise.all([
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.customers.users(customerId) 
          }),
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.customers.byId(customerId) 
          })
        ]);
      }
    } catch (error) {
      // Rollback on error
      if (previousData && customerId) {
        queryClient.setQueryData<UsersData>(
          queryKeys.customers.users(customerId),
          previousData
        );
      }
      console.error('Error adding user:', error);
      throw error;
    }
  }, [newUser, users, customerId, addUserMutation, onChange, queryClient, validateEmail]);

  /**
   * Handles removing a user with optimistic updates
   * @param index - Index of the user to remove
   */
  const handleRemoveUser = useCallback(async (index: number) => {
    const userToRemove = users[index];
    let previousData: UsersData | undefined;
    
    try {
      if (customerId && userToRemove.id) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.users(customerId) 
        });

        previousData = queryClient.getQueryData<UsersData>(
          queryKeys.customers.users(customerId)
        );

        // Optimistic update
        if (previousData?.users) {
          queryClient.setQueryData<UsersData>(
            queryKeys.customers.users(customerId),
            {
              users: previousData.users.filter(u => u.id !== userToRemove.id)
            }
          );
        }

        await deleteUserMutation.mutateAsync(userToRemove.id);
      }
      
      const updatedUsers = users.filter((_, i) => i !== index);
      onChange(updatedUsers);

      // Invalidate related queries
      if (customerId) {
        await Promise.all([
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.customers.users(customerId) 
          }),
          queryClient.invalidateQueries({ 
            queryKey: queryKeys.customers.byId(customerId) 
          })
        ]);
      }
    } catch (error) {
      // Rollback on error
      if (previousData && customerId) {
        queryClient.setQueryData<UsersData>(
          queryKeys.customers.users(customerId),
          previousData
        );
      }
      console.error('Error removing user:', error);
      throw error;
    }
  }, [users, customerId, deleteUserMutation, onChange, queryClient]);

  /**
   * Handles password reset for a user
   * @param password - New password to set
   */
  const handleResetPassword = useCallback(async (password: string) => {
    if (!resetPasswordUser || !customerId) return;

    let previousUser: User | undefined;
    
    try {
      const user = users[resetPasswordUser.index];
      if (user.id) {
        await queryClient.cancelQueries({ 
          queryKey: queryKeys.customers.users(customerId) 
        });

        previousUser = user;

        await resetPasswordMutation.mutateAsync({ 
          userId: user.id, 
          password 
        });

        setResetPasswordUser(null);

        // Invalidate user query to refresh status/metadata
        await queryClient.invalidateQueries({ 
          queryKey: queryKeys.customers.users(customerId) 
        });
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  }, [resetPasswordUser, customerId, users, resetPasswordMutation, queryClient]);

  // Return object with all necessary state and handlers
  return {
    users: customerId ? users : initialUsers,
    newUser,
    resetPasswordUser,
    isLoading: customerId ? isLoading : false,
    error: error ? String(error) : null,
    isAdding: addUserMutation.isPending,
    isRemoving: deleteUserMutation.isPending,
    isResettingPassword: resetPasswordMutation.isPending,
    handleAddUser,
    handleRemoveUser,
    handleResetPassword,
    // Utility functions for reset password modal
    openResetPassword: (index: number) => {
      const user = users[index];
      setResetPasswordUser({ index, email: user.email });
    },
    closeResetPassword: () => setResetPasswordUser(null),
    setNewUser,
    getFieldError
  };
};