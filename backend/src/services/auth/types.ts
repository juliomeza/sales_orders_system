// backend/src/services/auth/types.ts
import { UserDomain } from '../../domain/user';

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
  
  export interface AuthResponse {
    token: string;
    user: Omit<UserDomain, 'password'>;
  }