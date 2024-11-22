// src/admin/customers/hooks/useCustomerUsers.ts
import { useState } from 'react';
import { User } from '../types';

interface UseCustomerUsersProps {
  initialUsers?: User[];
  onChange: (users: User[]) => void;
}

export const useCustomerUsers = ({ 
  initialUsers = [], 
  onChange 
}: UseCustomerUsersProps) => {
  const [users, setUsers] = useState(initialUsers);
  const [newUser, setNewUser] = useState<User & { password: string; confirmPassword: string }>({
    email: '',
    role: 'CLIENT',
    status: 1,
    password: '',
    confirmPassword: ''
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password: string) => {
    return password.length >= 8; // Add more validation rules as needed
  };

  const validateForm = () => {
    if (!validateEmail(newUser.email)) return false;
    if (!validatePassword(newUser.password)) return false;
    if (newUser.password !== newUser.confirmPassword) return false;
    return true;
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
    if (!validateForm()) return;
    
    const userToAdd = {
      email: newUser.email,
      role: newUser.role,
      status: newUser.status,
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

  return {
    users,
    newUser,
    handleAddUser,
    handleRemoveUser,
    setNewUser,
    validateForm,
    getFieldError
  };
};