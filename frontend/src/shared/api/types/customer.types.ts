// frontend/src/shared/api/types/customer.types.ts
export interface Customer {
  id: number;
  lookupCode: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone?: string;
  email?: string;
  status: number;
  projects?: Project[];
  users?: User[];
  _count?: {
    users: number;
  };
}

export interface Project {
  id?: number;
  lookupCode: string;
  name: string;
  description?: string;
  isDefault: boolean;
}

export interface User {
  id?: number;
  email: string;
  role: string;
  status: number;
  password?: string;
}

export interface CreateCustomerData {
  customer: Omit<Customer, 'id' | '_count'>;
  projects: Project[];
  users: User[];
}

export interface ValidationErrorItem {
  field: string;
  message: string;
}

export class ValidationError extends Error {
  constructor(
    message: string,
    public readonly errors: ValidationErrorItem[]
  ) {
    super(message);
    this.name = 'ValidationError';
    
    // Necesario para que instanceof funcione correctamente
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}