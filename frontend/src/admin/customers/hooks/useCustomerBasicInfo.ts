// src/admin/customers/hooks/useCustomerBasicInfo.ts
import { useState } from 'react';
import { Customer } from '../types';

export const useCustomerBasicInfo = (initialData?: Partial<Customer>) => {
  const [formData, setFormData] = useState(initialData || {
    lookupCode: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    status: 1
  });

  const handleChange = (field: keyof Customer) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({
      ...formData,
      [field]: event.target.value,
    });
  };

  const handleStatusChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      status: event.target.checked ? 1 : 2,
    });
  };

  return {
    formData,
    handleChange,
    handleStatusChange
  };
};