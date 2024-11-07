// src/services/api/mockApi.ts
import { ShippingAddress, InventoryItem, Carrier, Warehouse } from '../../types/shipping';
import { mockCarriers } from '../../mocks/carriers';
import { mockWarehouses } from '../../mocks/warehouses';
import { mockAccounts } from '../../mocks/accounts';
import { mockInventory } from '../../mocks/inventory';

export interface MockAPI {
  getCarriers: () => Promise<Carrier[]>;
  getWarehouses: () => Promise<Warehouse[]>;
  getAccounts: () => Promise<ShippingAddress[]>;
  getInventory: () => Promise<InventoryItem[]>;
}

export const mockApi: MockAPI = {
  getCarriers: async () => {
    return new Promise<Carrier[]>((resolve) => {
      setTimeout(() => resolve(mockCarriers), 500);
    });
  },
  
  getWarehouses: async () => {
    return new Promise<Warehouse[]>((resolve) => {
      setTimeout(() => resolve(mockWarehouses), 500);
    });
  },
  
  getAccounts: async () => {
    return new Promise<ShippingAddress[]>((resolve) => {
      setTimeout(() => resolve(mockAccounts), 500);
    });
  },
  
  getInventory: async () => {
    return new Promise<InventoryItem[]>((resolve) => {
      setTimeout(() => resolve(mockInventory), 500);
    });
  }
};