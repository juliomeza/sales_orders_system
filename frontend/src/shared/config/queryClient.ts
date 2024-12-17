// frontend/src/shared/config/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 5 * 60 * 1000, // 5 minutes
        gcTime: 10 * 60 * 1000, // 10 minutes
        refetchOnWindowFocus: false,
        retry: 1,
        retryDelay: 3000,
      },
      mutations: {
        retry: 1,
        retryDelay: 3000,
      },
    },
  });

// Keys para consultas
export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    byId: (id: number) => ['customers', id] as const,
    search: (query: string) => ['customers', 'search', query] as const,
    projects: (customerId: number) => ['customers', customerId, 'projects'] as const,
    users: (customerId: number) => ['customers', customerId, 'users'] as const,
  },
  inventory: {
    all: ['inventory'] as const,
    byId: (id: string) => ['inventory', id] as const,
    search: (query: string) => ['inventory', 'search', query] as const,
  },
  warehouses: {
    all: ['warehouses'] as const,
    byId: (id: number) => ['warehouses', id] as const,
    stats: ['warehouses', 'stats'] as const,
  },
  shipping: {
    carriers: ['shipping', 'carriers'] as const,
    services: (carrierId: string) => ['shipping', 'carriers', carrierId, 'services'] as const,
    warehouses: ['shipping', 'warehouses'] as const,  // Agregamos esta línea
  },
  accounts: {
    all: ['accounts'] as const,
    byId: (id: string) => ['accounts', id] as const,
    shipTo: ['accounts', 'ship-to'] as const,
    billTo: ['accounts', 'bill-to'] as const,
  },
};