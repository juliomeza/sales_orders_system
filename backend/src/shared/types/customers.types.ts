// backend/src/shared/types/customers.types.ts
import { CustomerDomain, ProjectDomain, UserDomain } from '../../domain/customer';
import { Status } from './base/common';

export interface CreateCustomerDTO {
  customer: Omit<CustomerDomain, 'id' | 'status'>;
  projects: Array<Omit<ProjectDomain, 'id' | 'customerId'>>;
  users: Array<Omit<UserDomain, 'id' | 'customerId'>>;
}

export interface UpdateCustomerDTO {
  customer?: Partial<Omit<CustomerDomain, 'id'>> & {
      status?: Status;
  };
  projects?: Array<Omit<ProjectDomain, 'id' | 'customerId'>>;
  users?: Array<Omit<UserDomain, 'id' | 'customerId'>>;
}