// frontend/src/admin/customers/hooks/useCustomerUsers.ts
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

interface UseCustomerUsersProps {
  customerId?: number;
  initialUsers?: User[];
  onChange: (users: User[]) => void;
}

interface UsersData {
  users: User[];
}

interface NewUser extends User {
  password: string;
  confirmPassword: string;
}

export const useCustomerUsers = ({ 
  customerId,
  initialUsers = [],
  onChange 
}: UseCustomerUsersProps) => {
  const queryClient = useQueryClient();
  const [newUser, setNewUser] = useState<NewUser>({
    email: '',
    role: 'CLIENT',
    status: 1,
    password: '',
    confirmPassword: ''
  });

  const [resetPasswordUser, setResetPasswordUser] = useState<{
    index: number; 
    email: string;
  } | null>(null);

  const { 
    data: users = initialUsers,
    isLoading,
    error
  } = useCustomerUsersQuery(customerId ?? 0);

  const addUserMutation = useAddUserMutation(customerId ?? 0);
  const updateUserMutation = useUpdateUserMutation(customerId ?? 0);
  const deleteUserMutation = useDeleteUserMutation(customerId ?? 0);
  const resetPasswordMutation = useResetPasswordMutation(customerId ?? 0);

  const validateEmail = useCallback((email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }, []);

  const validatePassword = useCallback((password: string) => {
    return password.length >= 8;
  }, []);

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
    openResetPassword: (index: number) => {
      const user = users[index];
      setResetPasswordUser({ index, email: user.email });
    },
    closeResetPassword: () => setResetPasswordUser(null),
    setNewUser,
    getFieldError
  };
};