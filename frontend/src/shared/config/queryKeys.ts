// frontend/src/shared/config/queryKeys.ts
export const queryKeys = {
  customers: {
    all: ['customers'] as const,
    byId: (id: number) => ['customers', id] as const,
    projects: (customerId: number) => ['customers', customerId, 'projects'] as const,
    users: (customerId: number) => ['customers', customerId, 'users'] as const,
    search: (query: string) => ['customers', 'search', query] as const
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
      warehouses: ['shipping', 'warehouses'] as const,
    },
    accounts: {
      all: ['accounts'] as const,
      byId: (id: string) => ['accounts', id] as const,
      shipTo: ['accounts', 'ship-to'] as const,
      billTo: ['accounts', 'bill-to'] as const,
    },
    orders: {
      all: ['orders'] as const,
      byId: (id: string) => ['orders', id] as const,
      byCustomer: (customerId: number) => ['orders', 'customer', customerId] as const,
    }
  } as const;