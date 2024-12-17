// frontend/src/admin/customers/hooks/useCustomerUsers.ts
import { useState, useEffect } from 'react';
import { User } from '../../../shared/api/types/customer.types';
import {
  useCustomerUsersQuery,
  useAddUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation
} from '../../../shared/api/queries/useUserQueries';

interface UseCustomerUsersProps {
  customerId?: number;
  initialUsers?: User[];
  onChange: (users: User[]) => void;
}

export const useCustomerUsers = ({ 
  customerId,
  initialUsers = [],
  onChange 
}: UseCustomerUsersProps) => {
  const [newUser, setNewUser] = useState<User & { password: string; confirmPassword: string }>({
    email: '',
    role: 'CLIENT',
    status: 1,
    password: '',
    confirmPassword: ''
  });

  const [resetPasswordUser, setResetPasswordUser] = useState<{index: number; email: string} | null>(null);

  // Queries y Mutations
  const { 
    data: users = initialUsers,
    isLoading,
    error
  } = useCustomerUsersQuery(customerId ?? 0);

  const addUserMutation = useAddUserMutation(customerId ?? 0);
  const updateUserMutation = useUpdateUserMutation(customerId ?? 0);
  const deleteUserMutation = useDeleteUserMutation(customerId ?? 0);
  const resetPasswordMutation = useResetPasswordMutation(customerId ?? 0);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const getFieldError = () => {
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
  };

  const handleAddUser = async () => {
    if (!validateEmail(newUser.email) || !newUser.password || newUser.password !== newUser.confirmPassword) {
      return;
    }
    
    const userToAdd = {
      email: newUser.email,
      role: 'CLIENT',
      status: 1,
      password: newUser.password
    };
    
    try {
      if (customerId) {
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
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleRemoveUser = async (index: number) => {
    const userToRemove = users[index];
    
    try {
      if (customerId && userToRemove.id) {
        await deleteUserMutation.mutateAsync(userToRemove.id);
      }
      
      const updatedUsers = users.filter((_, i) => i !== index);
      onChange(updatedUsers);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  };

  const openResetPassword = (index: number) => {
    const user = users[index];
    setResetPasswordUser({ index, email: user.email });
  };

  const closeResetPassword = () => {
    setResetPasswordUser(null);
  };

  const handleResetPassword = async (password: string) => {
    if (!resetPasswordUser || !customerId) return;

    try {
      const user = users[resetPasswordUser.index];
      if (user.id) {
        await resetPasswordMutation.mutateAsync({ 
          userId: user.id, 
          password 
        });
      }

      closeResetPassword();
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  return {
    users: customerId ? users : initialUsers,
    newUser,
    resetPasswordUser,
    isLoading: customerId ? isLoading : false,
    error: error ? String(error) : null,
    handleAddUser,
    handleRemoveUser,
    openResetPassword,
    closeResetPassword,
    handleResetPassword,
    setNewUser,
    getFieldError
  };
};