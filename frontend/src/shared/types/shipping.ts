// frontend/src/shared/types/shipping.ts
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
  lookupCode: string;
  city: string;
  state: string;
  address: string;  // Añadir este campo
}

export interface InventoryItem {
  id: string;
  code: string;           // Del backend
  lookupCode: string;     // Para el frontend
  description: string;
  uom: string;
  availableQuantity: number;  // Del backend
  available: number;          // Para el frontend
  quantity: number;
  packaging: string;
  baseAvailable?: number;     // Opcional
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
  expectedDate: Date | null | undefined;
  
  // Updated to separate Ship To and Bill To
  shipToAccount: string;
  shipToAddress: ShippingAddress;
  billToAccount: string;
  billToAddress: ShippingAddress;
  
  preferredWarehouse: string;
  orderNotes: string;
}