// backend/src/domain/customer.ts
import { Status } from '../shared/types/common';

export interface CustomerDomain {
    id: number;
    lookupCode: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string | null;
    email: string | null;
    status: number;
    projects?: ProjectDomain[];
    users?: UserDomain[];
    _count?: {
      users: number;
    };
  }
  
  export interface ProjectDomain {
    id?: number;
    lookupCode: string;
    name: string;
    description?: string;
    isDefault: boolean;
    customerId?: number;
  }
  
  export interface UserDomain {
    id?: number;
    email: string;
    role: string;
    status: number;
    password?: string;
    customerId?: number;
  }