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
  const [newUser, setNewUser] = useState<User>({
    email: '',
    role: 'CLIENT',
    status: 1
  });

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleAddUser = () => {
    if (!validateEmail(newUser.email)) return;
    
    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    onChange(updatedUsers);
    setNewUser({
      email: '',
      role: 'CLIENT',
      status: 1
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
    validateEmail
  };
};