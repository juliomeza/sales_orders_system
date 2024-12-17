// frontend/src/shared/api/services/userService.ts
import { apiClient } from '../apiClient';
import { User } from '../types/customer.types';

interface UserResponse {
  users: User[];
}

// Añadido "export" aquí
export const userService = {
  // Obtener usuarios de un cliente
  getCustomerUsers: async (customerId: number): Promise<User[]> => {
    const response = await apiClient.get<UserResponse>(`/customers/${customerId}/users`);
    return response.users;
  },

  // Añadir un usuario a un cliente
  addUser: async (customerId: number, user: Omit<User, 'id'>): Promise<User> => {
    return apiClient.post<User>(`/customers/${customerId}/users`, user);
  },

  // Actualizar un usuario
  updateUser: async (customerId: number, userId: number, user: Partial<User>): Promise<User> => {
    return apiClient.put<User>(`/customers/${customerId}/users/${userId}`, user);
  },

  // Eliminar un usuario
  deleteUser: async (customerId: number, userId: number): Promise<void> => {
    return apiClient.delete(`/customers/${customerId}/users/${userId}`);
  },

  // Resetear contraseña de usuario
  resetPassword: async (customerId: number, userId: number, password: string): Promise<void> => {
    return apiClient.put(`/customers/${customerId}/users/${userId}/reset-password`, { password });
  }
};