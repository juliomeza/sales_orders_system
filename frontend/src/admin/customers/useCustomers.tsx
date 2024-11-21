// frontend/src/admin/customers/useCustomers.tsx
import { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/apiClient';

interface CustomerData {
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
}

interface Project {
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

interface User {
  email: string;
  role: string;
  status: number;
}

interface Customer extends CustomerData {
  id: number;
  projects: Array<{
    id: number;
    name: string;
    isDefault: boolean;
  }>;
  _count: {
    users: number;
  };
}

interface CustomerResponse {
  customers: Customer[];
  total: number;
}

interface CreateCustomerData {
  customer: CustomerData;
  projects: Project[];
  users: User[];
}

export const useCustomers = (searchTerm: string = '') => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await apiClient.get<CustomerResponse>('/customers', {
          params: { search: searchTerm }
        });
        setCustomers(response.customers);
      } catch (err) {
        console.error('Error loading customers:', err);
        setError('Error loading customers');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, [searchTerm]);

  const handleCreateCustomer = async (data: CreateCustomerData) => {
    try {
      const response = await apiClient.post<Customer>('/customers', data);
      setCustomers(prev => [...prev, response]);
      return response;
    } catch (err) {
      console.error('Error creating customer:', err);
      throw err;
    }
  };

  const handleUpdateCustomer = async (data: {
    customer: Customer;
    projects: Project[];
    users: User[];
  }) => {
    try {
      const response = await apiClient.put<Customer>(`/customers/${data.customer.id}`, data);
      setCustomers(prev => 
        prev.map(customer => 
          customer.id === response.id ? response : customer
        )
      );
      return response;
    } catch (err) {
      console.error('Error updating customer:', err);
      throw err;
    }
  };

  return {
    customers,
    isLoading,
    error,
    handleCreateCustomer,
    handleUpdateCustomer
  };
};

export type { CustomerData, Project, User, Customer };