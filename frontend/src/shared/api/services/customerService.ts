// frontend/src/shared/api/services/customerService.ts
import { apiClient } from '../apiClient';
import { Customer, CreateCustomerData } from '../types/customer.types';

export const customerService = {
  getCustomers: async () => {
    return apiClient.get<{ customers: Customer[] }>('/customers');
  },

  createCustomer: async (data: CreateCustomerData) => {
    return apiClient.post<Customer>('/customers', data);
  },

  updateCustomer: async (customerId: number, data: Partial<CreateCustomerData>) => {
    return apiClient.put<Customer>(`/customers/${customerId}`, data);
  },

  deleteCustomer: async (customerId: number) => {
    return apiClient.delete(`/customers/${customerId}`);
  }
};