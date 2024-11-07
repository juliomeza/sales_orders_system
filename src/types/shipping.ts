// src/types/shipping.ts
export interface ShippingAddress {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Carrier {
  id: string;
  name: string;
  services: string[];
}

export interface Warehouse {
  id: string;
  name: string;
}

export interface InventoryItem {
  id: string;
  lookupCode: string;
  description: string;
  baseAvailable: number;
  available: number;
  quantity: number;
  packaging: string;
}

export interface OrderData {
  orderLookup: string;
  poNo: string;
  referenceNo: string;
  orderClass: string;
  owner: string;
  project: string;
  carrier: string;
  serviceType: string;
  expectedDate: Date | null;
  
  // Updated to separate Ship To and Bill To
  shipToAccount: string;
  shipToAddress: ShippingAddress;
  billToAccount: string;
  billToAddress: ShippingAddress;
  
  preferredWarehouse: string;
  orderNotes: string;
}