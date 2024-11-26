// backend/src/services/customers/types.ts
import { CustomerDomain, ProjectDomain, UserDomain } from '../../domain/customer';

export interface CreateCustomerDTO {
  customer: Omit<CustomerDomain, 'id'>;
  projects: Omit<ProjectDomain, 'id' | 'customerId'>[];
  users: Omit<UserDomain, 'id' | 'customerId'>[];
}

export interface UpdateCustomerDTO {
  customer?: Partial<Omit<CustomerDomain, 'id'>>;
  projects?: Omit<ProjectDomain, 'id' | 'customerId'>[];
  users?: Omit<UserDomain, 'id' | 'customerId'>[];
}