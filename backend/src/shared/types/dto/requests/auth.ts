// backend/src/shared/types/dto/requests/auth.ts
import { Status } from '../../base/common';

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