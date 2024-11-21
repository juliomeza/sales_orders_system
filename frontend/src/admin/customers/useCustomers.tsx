// frontend/src/admin/customers/useCustomers.tsx
import { useState, useEffect } from 'react';
import { apiClient } from '../../shared/api/apiClient';

interface Customer {
  id: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
  projects: Array<{
    id: number;
    name: string;
    isDefault: boolean;
  }>;
  _count: {
    users: number;
  };
}

interface Project {
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

interface CustomerResponse {
  customers: Customer[];
  total: number;
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

  const handleCreateCustomer = async (data: {
    customer: Omit<Customer, 'id' | '_count'>;
    projects: Project[];
    users: any[];
  }) => {
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
    users: any[];
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