// backend/src/backend/src/shared/types/models/customer.ts
import { BaseEntity, Status } from '../base/common';
import { User } from './user';

export interface Customer extends BaseEntity {
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string | null;
  email: string | null;
  projects?: Project[];
  users?: User[];
  _count?: {
    users: number;
  };
}

export interface Project extends BaseEntity {
  name: string;
  description?: string;
  isDefault: boolean;
  customerId?: number;
}