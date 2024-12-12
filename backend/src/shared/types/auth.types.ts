// backend/src/shared/types/auth.types.ts
import { UserDomain } from '../../domain/user';
import { Status } from '.';

export interface LoginDTO {
    email: string;
    password: string;
  }
  
  export interface RegisterDTO {
    email: string;
    password: string;
    role?: string;
    customerId?: number;
  }

  export interface CreateUserDTO {
    email: string;
    password: string;
    role: string;
    customerId?: number;
    status: Status;
  }
  
  export interface AuthResponse {
    token: string;
    user: Omit<UserDomain, 'password'>;
  }