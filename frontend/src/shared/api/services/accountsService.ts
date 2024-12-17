// frontend/src/shared/api/services/accountsService.ts
import { apiClient } from '../apiClient';
import { ShippingAddressResponse, ShippingAddress } from '../types/accounts.types';

export const accountsService = {
  getShippingAddresses: async (): Promise<ShippingAddress[]> => {
    const response = await apiClient.get<ShippingAddressResponse>('/ship-to');
    return response.addresses;
  },

  createShippingAddress: async (newAccount: Omit<ShippingAddress, 'id'>): Promise<ShippingAddress> => {
    return apiClient.post<ShippingAddress>('/ship-to', newAccount);
  }
};