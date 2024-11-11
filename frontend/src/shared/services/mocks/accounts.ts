// src/mocks/accounts.ts
import { ShippingAddress } from '../../types/shipping';

export const mockAccounts: ShippingAddress[] = [
  {
    id: '1',
    name: 'Acme Corporation',
    address: '123 Business Ave',
    city: 'Chicago',
    state: 'IL',
    zipCode: '60601'
  },
  {
    id: '2',
    name: 'TechCorp Industries',
    address: '456 Innovation Dr',
    city: 'San Jose',
    state: 'CA',
    zipCode: '95110'
  },
  {
    id: '3',
    name: 'Global Solutions LLC',
    address: '789 Enterprise Blvd',
    city: 'Austin',
    state: 'TX',
    zipCode: '78701'
  }
];