// backend/src/shared/types/dto/requests/customer.ts
import { Status } from '../../base';

export interface CreateCustomerDTO {
  customer: {
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    email: string | null;
  };
  projects: Array<{
    lookupCode: string;
    name: string;
    description?: string;
    isDefault: boolean;
  }>;
  users: Array<{
    email: string;
    password?: string;
    role: string;
    status: Status;
  }>;
}

export interface UpdateCustomerDTO {
  customer?: {
    lookupCode?: string;
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    phone?: string | null;
    email?: string | null;
    status?: Status;
  };
  projects?: Array<{
    lookupCode: string;
    name: string;
    description?: string;
    isDefault: boolean;
  }>;
  users?: Array<{
    email: string;
    password?: string;
    role: string;
    status: Status;
  }>;
}