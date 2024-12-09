// src/admin/customers/hooks/useCustomerUsers.ts
import { useState, useEffect } from 'react';
import { User } from '../types';

interface UseCustomerUsersProps {
  initialUsers: User[];
  onChange: (users: User[]) => void;
}

export const useCustomerUsers = ({ initialUsers, onChange }: UseCustomerUsersProps) => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [newUser, setNewUser] = useState<User & { password: string; confirmPassword: string }>({
    email: '',
    role: 'CLIENT',
    status: 1,
    password: '',
    confirmPassword: ''
  });
  const [resetPasswordUser, setResetPasswordUser] = useState<{index: number; email: string} | null>(null);

  useEffect(() => {
    setUsers(initialUsers);
  }, [initialUsers]);

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

  const handleAddUser = () => {
    if (!validateEmail(newUser.email) || !newUser.password || newUser.password !== newUser.confirmPassword) {
      return;
    }
    
    const userToAdd = {
      email: newUser.email,
      role: 'CLIENT',
      status: 1,
      password: newUser.password
    };
    
    const updatedUsers = [...users, userToAdd];
    setUsers(updatedUsers);
    onChange(updatedUsers);
    setNewUser({
      email: '',
      role: 'CLIENT',
      status: 1,
      password: '',
      confirmPassword: ''
    });
  };

  const handleRemoveUser = (index: number) => {
    const updatedUsers = users.filter((_, i) => i !== index);
    setUsers(updatedUsers);
    onChange(updatedUsers);
  };

  const openResetPassword = (index: number) => {
    const user = users[index];
    setResetPasswordUser({ index, email: user.email });
  };

  const closeResetPassword = () => {
    setResetPasswordUser(null);
  };

  const handleResetPassword = (password: string) => {
    if (!resetPasswordUser) return;

    const updatedUsers = users.map((user, i) => {
      if (i === resetPasswordUser.index) {
        return {
          ...user,
          password
        };
      }
      return user;
    });

    setUsers(updatedUsers);
    onChange(updatedUsers);
    closeResetPassword();
  };

  return {
    users,
    newUser,
    resetPasswordUser,
    handleAddUser,
    handleRemoveUser,
    openResetPassword,
    closeResetPassword,
    handleResetPassword,
    setNewUser,
    getFieldError
  };
};