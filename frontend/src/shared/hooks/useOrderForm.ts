// frontend/src/shared/hooks/useOrderForm.ts
import { useState } from 'react';
import { OrderData } from '../types/shipping';

const initialOrderData: OrderData = {
  orderLookup: '',
  poNo: '',
  referenceNo: '',
  orderClass: 'Sales Order',
  owner: '',
  project: '',
  carrier: '',
  serviceType: '',
  expectedDate: null,
  shipToAccount: '',
  billToAccount: '',
  preferredWarehouse: '',
  shipToAddress: {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  },
  billToAddress: {
    id: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: ''
  },
  orderNotes: ''
};

export const useOrderForm = () => {
  const [orderData, setOrderData] = useState<OrderData>(initialOrderData);

  const handleOrderDataChange = (field: keyof OrderData, value: any) => {
    setOrderData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const resetForm = () => {
    setOrderData(initialOrderData);
  };

  return {
    orderData,
    handleOrderDataChange,
    resetForm
  };
};